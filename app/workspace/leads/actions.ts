"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, leads } from "../../../db/schema";
import { staffEmails } from "../../../lib/leads";
import { workspaceContext } from "../access";

export async function updateLeadStatus(formData: FormData) {
  const ctx = await workspaceContext();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const db = getDb();
  if (!staffEmails().includes(ctx.user.email.toLowerCase())) {
    await db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: "lead.status", resource: "lead", resourceId: id || null, decision: "deny", reason: "not_staff", createdAt: new Date() });
    throw new Error("Only DigitalBurj staff can update request status.");
  }
  if (!["New", "Contacted", "Routed", "Closed"].includes(status) || !id) throw new Error("Choose a valid status.");
  await db.batch([
    db.update(leads).set({ status }).where(eq(leads.id, id)),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: "lead.status", resource: "lead", resourceId: id, decision: "allow", reason: status, createdAt: new Date() }),
  ]);
  revalidatePath("/workspace/leads");
}
