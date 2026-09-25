import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { domainEvents } from "../../../../db/schema";
import { api, ApiError, orgOf, page, requireScope } from "../../../../lib/api";

// Organization event feed — the same events webhooks deliver, for polling or replay.
export const GET = api(async (req, caller) => {
  requireScope(caller, "read:organization");
  const orgId = orgOf(caller); if (!orgId) throw new ApiError(400, "organization_required", "Use an organization context.");
  const { limit, offset } = page(req);
  const rows = await getDb().select().from(domainEvents).where(eq(domainEvents.orgId, orgId)).orderBy(desc(domainEvents.createdAt)).limit(limit).offset(offset);
  return { data: rows.map(e => ({ id: e.id, type: e.type, resource: { type: e.resourceType, id: e.resourceId }, data: JSON.parse(e.payload), createdAt: e.createdAt })), limit, offset };
});
