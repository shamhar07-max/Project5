"use server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, supportTickets, ticketMessages, ticketMeta } from "../../../db/schema";
import { workspaceContext } from "../access";
import { auditRow, publish, str, uuid } from "../../../lib/platform";
import { staffIdsWith } from "../../../lib/staff";
import { LEGACY_STATUS, TOPICS } from "../../../lib/support";
import { assertTransition } from "../../../lib/workflow";

export async function createTicket(formData: FormData) {
  const ctx = await workspaceContext();
  const topic = String(formData.get("topic") || "");
  const message = String(formData.get("message") || "").trim();
  if (!(topic in TOPICS) || message.length < 10 || message.length > 2000) throw new Error("Choose a topic and enter a message between 10 and 2000 characters.");
  const priority = formData.get("urgent") === "on" ? "high" : "normal";
  const id = crypto.randomUUID(); const now = new Date();
  const db = getDb();
  const agents = await staffIdsWith(["support_admin"]);
  await publish({ type: "support.ticket.created", actorId: ctx.user.userId, orgId: ctx.orgId, resourceType: "ticket", resourceId: id, payload: { topic } },
    agents.map(userId => ({ userId, title: `New ticket: ${topic}`, body: message.slice(0, 120), href: `/admin/support/${id}`, category: "Support", priority: priority === "high" ? "high" as const : "normal" as const })),
    [db.insert(supportTickets).values({ id, ownerId: ctx.user.userId, orgId: ctx.orgId, topic, message, status: "Open", createdAt: now }),
     db.insert(ticketMeta).values({ ticketId: id, division: TOPICS[topic as keyof typeof TOPICS], priority, workflow: "NEW", updatedAt: now }),
     db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "support.ticket.create", "support_ticket", id))]);
  revalidatePath("/workspace/support");
  redirect(`/workspace/support/${id}`);
}

export async function replyAsCustomer(form: FormData) {
  const ctx = await workspaceContext();
  const id = uuid(form, "ticketId");
  const body = str(form, "body", 2, 3000, "Message");
  const db = getDb();
  const t = await db.select().from(supportTickets).where(and(eq(supportTickets.id, id), eq(supportTickets.ownerId, ctx.user.userId))).get();
  if (!t) throw new Error("Ticket unavailable.");
  const meta = await db.select().from(ticketMeta).where(eq(ticketMeta.ticketId, id)).get();
  const now = new Date();
  let workflow = meta?.workflow ?? "NEW";
  if (workflow === "CLOSED") throw new Error("This ticket is closed. Open a new one and mention this reference.");
  if (workflow === "RESOLVED") { assertTransition("ticket", "RESOLVED", "REOPENED"); workflow = "REOPENED"; }
  else if (workflow === "WAITING_FOR_CUSTOMER") workflow = "IN_PROGRESS";
  const stmts = [
    db.insert(ticketMessages).values({ id: crypto.randomUUID(), ticketId: id, authorId: ctx.user.userId, authorLabel: ctx.user.fullName || ctx.user.email, internal: false, body, createdAt: now }),
    db.insert(ticketMeta).values({ ticketId: id, workflow, updatedAt: now }).onConflictDoUpdate({ target: ticketMeta.ticketId, set: { workflow, updatedAt: now, ...(workflow === "REOPENED" ? { resolvedAt: null } : {}) } }),
    db.update(supportTickets).set({ status: LEGACY_STATUS[workflow] }).where(eq(supportTickets.id, id)),
  ];
  const notify = meta?.assigneeId ? [{ userId: meta.assigneeId, title: `Customer replied: ${t.topic}`, href: `/admin/support/${id}`, category: "Support" }] : [];
  await publish({ type: "support.ticket.customer_reply", actorId: ctx.user.userId, orgId: t.orgId, resourceType: "ticket", resourceId: id }, notify, stmts);
  revalidatePath(`/workspace/support/${id}`);
}
