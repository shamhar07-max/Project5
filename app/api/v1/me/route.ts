import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { memberships, organizations } from "../../../../db/schema";
import { api, ApiError } from "../../../../lib/api";

export const GET = api(async (_req, caller) => {
  if (caller.kind !== "user") throw new ApiError(401, "authentication_required", "This endpoint describes a signed-in person; API keys act for an organization — use /api/v1/organization.");
  const db = getDb();
  const ms = await db.select().from(memberships).where(and(eq(memberships.userId, caller.userId), eq(memberships.status, "active")));
  const orgs = await db.select().from(organizations);
  return { user: { id: caller.userId, email: caller.email }, organizations: ms.map(m => ({ id: m.orgId, name: orgs.find(o => o.id === m.orgId)?.name ?? null, role: m.role })) };
});
