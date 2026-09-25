import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { employerVerifications, memberships, organizations } from "../../../../db/schema";
import { api, ApiError, orgOf, requireScope } from "../../../../lib/api";

export const GET = api(async (_req, caller) => {
  requireScope(caller, "read:organization");
  const orgId = orgOf(caller);
  if (!orgId) throw new ApiError(400, "organization_required", "Pass ?organization=<id> or use an organization API key.");
  const db = getDb();
  const [org, members, employer] = await Promise.all([db.select().from(organizations).where(eq(organizations.id, orgId)).get(), db.select().from(memberships).where(eq(memberships.orgId, orgId)), db.select().from(employerVerifications).where(eq(employerVerifications.orgId, orgId)).get()]);
  if (!org) throw new ApiError(404, "not_found", "Organization not found.");
  return { id: org.id, name: org.name, createdAt: org.createdAt, employerVerification: employer?.status ?? "NOT_REQUESTED", members: members.map(m => ({ email: m.email, role: m.role, status: m.status })) };
});
