import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { requireChatGPTUser } from "../chatgpt-auth";
import { getDb } from "../../db";
import { memberships, auditLog } from "../../db/schema";

export async function workspaceContext() {
  const user = await requireChatGPTUser("/workspace");
  const orgId = (await cookies()).get("db_org")?.value || null;
  if (!orgId) return { user, orgId: null, role: "individual" };
  const membership = await getDb().select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.userId, user.userId), eq(memberships.status, "active"))).get();
  if (!membership) throw new Error("Your organization context is no longer available. Switch to an individual workspace.");
  return { user, orgId, role: membership.role };
}

export async function audit(ctx: Awaited<ReturnType<typeof workspaceContext>>, action: string, resourceId: string | null, decision: "allow" | "deny", reason?: string) {
  await getDb().insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action, resource: "record", resourceId, decision, reason: reason || null, createdAt: new Date() });
}

export async function requireRecordWrite(ctx: Awaited<ReturnType<typeof workspaceContext>>, action: string, resourceId: string | null) {
  if (ctx.role === "guest") {
    await audit(ctx, action, resourceId, "deny", "role_denied");
    throw new Error("Your role cannot change organization records.");
  }
}
