"use server";
import { getDb } from "../../../db";
import { messages, auditLog } from "../../../db/schema";
import { workspaceContext } from "../access";
import { revalidatePath } from "next/cache";

export async function postMessage(formData: FormData) {
  const ctx = await workspaceContext();
  if (!ctx.orgId || ctx.role === "guest") throw new Error("An active organization membership is required to send messages.");
  const body = String(formData.get("body") || "").trim();
  if (body.length < 1 || body.length > 2000) throw new Error("Enter a message under 2000 characters.");
  const id = crypto.randomUUID();
  const db = getDb();
  await db.batch([
    db.insert(messages).values({ id, orgId: ctx.orgId, authorId: ctx.user.userId, authorName: ctx.user.displayName.slice(0, 120), body, createdAt: new Date() }),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: "message.post", resource: "message", resourceId: id, decision: "allow", createdAt: new Date() }),
  ]);
  revalidatePath("/workspace/messages");
}
