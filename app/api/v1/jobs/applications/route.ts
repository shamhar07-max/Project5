import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { jobApplications } from "../../../../../db/schema";
import { api, ApiError, orgOf, page, requireScope } from "../../../../../lib/api";

export const GET = api(async (req, caller) => {
  requireScope(caller, "read:jobs");
  const { limit, offset } = page(req);
  const orgId = orgOf(caller);
  const db = getDb();
  if (orgId) {
    if (caller.kind === "user" && !["org_owner", "admin", "recruiter", "hiring_manager"].includes(caller.role)) throw new ApiError(403, "forbidden", "Your role cannot read applications.");
    const rows = await db.select().from(jobApplications).where(eq(jobApplications.orgId, orgId)).orderBy(desc(jobApplications.updatedAt)).limit(limit).offset(offset);
    return { data: rows.map(a => ({ id: a.id, jobId: a.jobId, candidate: { name: a.candidateName, email: a.candidateEmail }, stage: a.stage, sharedPassport: a.shareProfile, createdAt: a.createdAt, updatedAt: a.updatedAt })), limit, offset };
  }
  if (caller.kind !== "user") throw new ApiError(400, "organization_required", "Use an organization context.");
  const rows = await db.select().from(jobApplications).where(eq(jobApplications.candidateId, caller.userId)).orderBy(desc(jobApplications.updatedAt)).limit(limit).offset(offset);
  return { data: rows.map(a => ({ id: a.id, jobId: a.jobId, stage: a.stage, createdAt: a.createdAt, updatedAt: a.updatedAt })), limit, offset };
});
