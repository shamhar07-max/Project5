"use server";
import { getDb } from "../../../db";
import { supportTickets, auditLog } from "../../../db/schema";
import { workspaceContext } from "../access";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  const ctx = await workspaceContext();
  const topic = String(formData.get("topic") || "");
  const message = String(formData.get("message") || "").trim();
  if (!["Account and security", "Academy", "Studio", "Business AI", "Talent and Jobs", "Billing", "Other"].includes(topic) || message.length < 10 || message.length > 2000) throw new Error("Choose a topic and enter a message between 10 and 2000 characters.");
  const id = crypto.randomUUID();
  const db = getDb();
  await db.batch([
    db.insert(supportTickets).values({ id, ownerId: ctx.user.userId, orgId: ctx.orgId, topic, message, createdAt: new Date() }),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: "support.ticket.create", resource: "support_ticket", resourceId: id, decision: "allow", createdAt: new Date() }),
  ]);
  revalidatePath("/workspace/support");
}
