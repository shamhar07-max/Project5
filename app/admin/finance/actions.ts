"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, invoices, organizations, userDirectory } from "../../../db/schema";
import { auditRow, membersWith, oneOf, publish, readableCode, requireStaff, str, uuid } from "../../../lib/platform";
import { assertTransition } from "../../../lib/workflow";

export async function createInvoice(form: FormData) {
  const { user } = await requireStaff("finance", "finance.invoice.create");
  const db = getDb();
  const orgId = String(form.get("orgId") || "") || null;
  let customerEmail = String(form.get("customerEmail") || "").trim().toLowerCase();
  if (orgId) {
    const org = await db.select().from(organizations).where(eq(organizations.id, orgId)).get();
    if (!org) throw new Error("Choose an existing organization.");
    customerEmail = customerEmail || `org:${org.id}`;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) throw new Error("Enter the customer's sign-in email, or choose an organization.");
  const lines = str(form, "lines", 3, 4000, "Line items").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const m = l.match(/^(.*?)\s*[|,]\s*([0-9]+(?:\.[0-9]{1,2})?)$/);
    if (!m) throw new Error(`Write each line as "Item | amount", e.g. "Discovery workshop | 4500". Problem: ${l}`);
    return { item: m[1].slice(0, 160), amountMinor: Math.round(Number(m[2]) * 100) };
  });
  const total = lines.reduce((a, b) => a + b.amountMinor, 0);
  if (total <= 0) throw new Error("The invoice total must be above zero.");
  const due = String(form.get("dueAt") || "");
  const id = crypto.randomUUID();
  const customer = orgId ? null : await db.select().from(userDirectory).where(eq(userDirectory.email, customerEmail)).get();
  await db.batch([
    db.insert(invoices).values({ id, number: readableCode(`INV-${new Date().getFullYear()}`, 6), orgId, customerId: customer?.userId ?? null, customerEmail, division: oneOf(form, "division", ["Academy", "Studio", "Business AI", "Talent", "Jobs", "Platform"] as const, "division"), description: str(form, "description", 3, 200, "Description"), lines: JSON.stringify(lines), currency: oneOf(form, "currency", ["AED", "USD", "SAR", "EUR", "GBP"] as const, "currency"), amountMinor: total, status: "draft", dueAt: due ? new Date(`${due}T12:00:00Z`) : null, issuedBy: user.userId, createdAt: new Date() }),
    db.insert(auditLog).values(auditRow(user, orgId, "finance.invoice.create", "invoice", id)),
  ]);
  revalidatePath("/admin/finance");
}

/** issue / paid / void / refunded. Void and refund require a reason (Domain 09 §6). */
export async function setInvoiceStatus(form: FormData) {
  const { user } = await requireStaff("finance", "finance.invoice.status");
  const id = uuid(form, "id"); const db = getDb();
  const inv = await db.select().from(invoices).where(eq(invoices.id, id)).get();
  if (!inv) throw new Error("Invoice unavailable.");
  const to = oneOf(form, "to", ["issued", "paid", "void", "refunded"] as const, "status");
  assertTransition("invoice", inv.status, to);
  const reason = ["void", "refunded"].includes(to) ? str(form, "reason", 5, 300, "Reason") : String(form.get("reason") || "").slice(0, 300);
  const recipients = inv.orgId ? await membersWith(inv.orgId, "billing.view") : inv.customerId ? [inv.customerId] : [];
  await publish({ type: `billing.invoice.${to}`, actorId: user.userId, orgId: inv.orgId, resourceType: "invoice", resourceId: id, payload: { number: inv.number, amountMinor: inv.amountMinor, currency: inv.currency } },
    to === "issued" || to === "paid" || to === "refunded" ? recipients.map(userId => ({ userId, title: to === "issued" ? `Invoice ${inv.number} issued` : to === "paid" ? `Payment received for ${inv.number}` : `Refund recorded for ${inv.number}`, href: "/workspace/billing", category: "Billing", priority: to === "issued" ? "high" as const : "normal" as const })) : [],
    [db.update(invoices).set({ status: to, statusReason: reason, ...(to === "paid" ? { paidAt: new Date() } : {}) }).where(eq(invoices.id, id)), db.insert(auditLog).values(auditRow(user, inv.orgId, `finance.invoice.${to}`, "invoice", id, "allow", reason || undefined))]);
  revalidatePath("/admin/finance");
}
