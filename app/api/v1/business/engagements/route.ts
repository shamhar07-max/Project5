import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { engagements } from "../../../../../db/schema";
import { api, orgOf, page, requireScope } from "../../../../../lib/api";

export const GET = api(async (req, caller) => {
  requireScope(caller, "read:business");
  const { limit, offset } = page(req);
  const orgId = orgOf(caller);
  const scope = orgId ? eq(engagements.orgId, orgId) : and(eq(engagements.ownerId, caller.kind === "user" ? caller.userId : "-"), isNull(engagements.orgId));
  const rows = await getDb().select().from(engagements).where(and(scope, eq(engagements.service, "business"))).orderBy(desc(engagements.updatedAt)).limit(limit).offset(offset);
  return { data: rows.map(e => ({ id: e.id, title: e.title, stage: e.stage, createdAt: e.createdAt, updatedAt: e.updatedAt })), limit, offset };
});
