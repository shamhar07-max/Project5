import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { auditLog } from "../../../../db/schema";
import { api, ApiError, orgOf, page, requireScope } from "../../../../lib/api";

export const GET = api(async (req, caller) => {
  requireScope(caller, "read:audit");
  const orgId = orgOf(caller);
  if (!orgId) throw new ApiError(400, "organization_required", "Audit logs are available for an organization.");
  if (caller.kind === "user" && !["org_owner", "admin"].includes(caller.role)) throw new ApiError(403, "forbidden", "Only owners and admins can read the audit log.");
  const { limit, offset } = page(req);
  const rows = await getDb().select().from(auditLog).where(eq(auditLog.orgId, orgId)).orderBy(desc(auditLog.createdAt)).limit(limit).offset(offset);
  return { data: rows.map(r => ({ id: r.id, actorId: r.actorId, action: r.action, resource: r.resource, resourceId: r.resourceId, decision: r.decision, reason: r.reason, createdAt: r.createdAt })), limit, offset };
});
