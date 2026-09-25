"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, supportTickets, ticketMessages, ticketMeta } from "../../../db/schema";
import { auditRow, oneOf, publish, requireStaff, str, uuid } from "../../../lib/platform";
import { LEGACY_STATUS, PRIORITIES } from "../../../lib/support";
import { assertTransition } from "../../../lib/workflow";

async function load(id: string) {
  const db = getDb();
  const [t, meta] = await Promise.all([db.select().from(supportTickets).where(eq(supportTickets.id, id)).get(), db.select().from(ticketMeta).where(eq(ticketMeta.ticketId, id)).get()]);
  if (!t) throw new Error("Ticket unavailable.");
  return { t, meta: meta ?? { ticketId: id, division: "Platform", priority: "normal", workflow: "NEW", assigneeId: null, assigneeEmail: "", firstResponseAt: null, resolvedAt: null, updatedAt: t.createdAt }, db };
}
const upsert = (db: ReturnType<typeof getDb>, id: string, set: Partial<typeof ticketMeta.$inferInsert>) =>
  db.insert(ticketMeta).values({ ticketId: id, updatedAt: new Date(), ...set }).onConflictDoUpdate({ target: ticketMeta.ticketId, set: { ...set, updatedAt: new Date() } });

export async function assignToMe(form: FormData) {
  const { user } = await requireStaff("support", "support.assign");
  const id = uuid(form, "id"); const { meta, db } = await load(id);
  const workflow = ["NEW", "TRIAGED", "REOPENED"].includes(meta.workflow) ? "ASSIGNED" : meta.workflow;
  if (workflow !== meta.workflow) assertTransition("ticket", meta.workflow, workflow);
  await db.batch([upsert(db, id, { assigneeId: user.userId, assigneeEmail: user.email, workflow }), db.update(supportTickets).set({ status: LEGACY_STATUS[workflow] }).where(eq(supportTickets.id, id)), db.insert(auditLog).values(auditRow(user, null, "support.assign", "support_ticket", id))]);
  revalidatePath(`/admin/support/${id}`);
}

export async function updateTicket(form: FormData) {
  const { user } = await requireStaff("support", "support.update");
  const id = uuid(form, "id"); const { meta, db } = await load(id);
  const priority = oneOf(form, "priority", PRIORITIES, "priority");
  const workflow = String(form.get("workflow") || meta.workflow);
  if (workflow !== meta.workflow) assertTransition("ticket", meta.workflow, workflow);
  const now = new Date();
  await db.batch([
    upsert(db, id, { priority, workflow, division: String(form.get("division") || meta.division).slice(0, 30), ...(workflow === "RESOLVED" ? { resolvedAt: now } : {}) }),
    db.update(supportTickets).set({ status: LEGACY_STATUS[workflow] ?? "Open" }).where(eq(supportTickets.id, id)),
    db.insert(auditLog).values(auditRow(user, null, "support.update", "support_ticket", id, "allow", `${priority}/${workflow}`)),
  ]);
  revalidatePath(`/admin/support/${id}`);
}

export async function agentReply(form: FormData) {
  const { user } = await requireStaff("support", "support.reply");
  const id = uuid(form, "id"); const { t, meta, db } = await load(id);
  const body = str(form, "body", 2, 4000, "Reply");
  const internal = form.get("internal") === "on";
  const now = new Date();
  const set: Partial<typeof ticketMeta.$inferInsert> = {};
  if (!internal && !meta.firstResponseAt) set.firstResponseAt = now;
  if (!internal && !["RESOLVED", "CLOSED"].includes(meta.workflow) && form.get("waiting") === "on") { assertTransition("ticket", ["NEW", "TRIAGED", "REOPENED"].includes(meta.workflow) ? "ASSIGNED" : meta.workflow, "WAITING_FOR_CUSTOMER"); set.workflow = "WAITING_FOR_CUSTOMER"; }
  if (!meta.assigneeId) { set.assigneeId = user.userId; set.assigneeEmail = user.email; if (!set.workflow && meta.workflow === "NEW") set.workflow = "ASSIGNED"; }
  await publish({ type: internal ? "support.ticket.note" : "support.ticket.reply", actorId: user.userId, orgId: t.orgId, resourceType: "ticket", resourceId: id },
    internal ? [] : [{ userId: t.ownerId, title: `DigitalBurj support replied: ${t.topic}`, body: body.slice(0, 160), href: `/workspace/support/${id}`, category: "Support", priority: "high" }],
    [db.insert(ticketMessages).values({ id: crypto.randomUUID(), ticketId: id, authorId: user.userId, authorLabel: "Support team", internal, body, createdAt: now }), upsert(db, id, set), ...(set.workflow ? [db.update(supportTickets).set({ status: LEGACY_STATUS[set.workflow] }).where(eq(supportTickets.id, id))] : [])]);
  revalidatePath(`/admin/support/${id}`);
}
