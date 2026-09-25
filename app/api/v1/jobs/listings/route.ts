import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { auditLog, employerVerifications, jobListings, organizations } from "../../../../../db/schema";
import { api, ApiError, orgOf, page, requireScope } from "../../../../../lib/api";

// GET: public published listings, or ?mine=1 for the caller's organization (read:jobs).
export const GET = api(async (req, caller) => {
  const { limit, offset } = page(req);
  const mine = new URL(req.url).searchParams.get("mine") === "1";
  const db = getDb();
  if (mine) {
    requireScope(caller, "read:jobs");
    const orgId = orgOf(caller); if (!orgId) throw new ApiError(400, "organization_required", "Use an organization context.");
    return { data: await db.select().from(jobListings).where(eq(jobListings.orgId, orgId)).orderBy(desc(jobListings.createdAt)).limit(limit).offset(offset), limit, offset };
  }
  const rows = await db.select().from(jobListings).where(eq(jobListings.status, "PUBLISHED")).orderBy(desc(jobListings.publishedAt)).limit(limit).offset(offset);
  return { data: rows.map(j => ({ id: j.id, company: j.company, title: j.title, location: j.location, workArrangement: j.workArrangement, employmentType: j.employmentType, description: j.description, requirements: j.requirements, skills: j.skills, salaryRange: j.salaryRange, publishedAt: j.publishedAt, url: `/jobs/board/${j.id}` })), limit, offset };
});

// POST: create a DRAFT listing for the caller's organization (write:jobs). Publishing stays a human action.
export const POST = api(async (req, caller) => {
  requireScope(caller, "write:jobs");
  const orgId = orgOf(caller); if (!orgId) throw new ApiError(400, "organization_required", "Use an organization API key.");
  if (caller.kind === "user" && !["org_owner", "admin", "recruiter", "hiring_manager"].includes(caller.role)) throw new ApiError(403, "forbidden", "Your role cannot create listings.");
  let b: Record<string, unknown>;
  try { b = await req.json() as Record<string, unknown>; } catch { throw new ApiError(400, "invalid_json", "Send a JSON body."); }
  const s = (k: string, min: number, max: number) => { const v = typeof b[k] === "string" ? (b[k] as string).trim() : ""; if (v.length < min || v.length > max) throw new ApiError(422, "validation_failed", `${k} must be ${min}–${max} characters.`, { field: k }); return v; };
  const pick = (k: string, opts: string[]) => { const v = String(b[k] ?? ""); if (!opts.includes(v)) throw new ApiError(422, "validation_failed", `${k} must be one of ${opts.join(", ")}.`, { field: k }); return v; };
  const db = getDb();
  const [org, ver] = await Promise.all([db.select().from(organizations).where(eq(organizations.id, orgId)).get(), db.select().from(employerVerifications).where(and(eq(employerVerifications.orgId, orgId))).get()]);
  const id = crypto.randomUUID();
  const row = { id, orgId, company: org?.name ?? "Employer", title: s("title", 3, 120), location: s("location", 2, 120), workArrangement: pick("workArrangement", ["On-site", "Hybrid", "Remote"]), employmentType: pick("employmentType", ["Full-time", "Part-time", "Contract", "Internship"]), description: s("description", 40, 6000), requirements: s("requirements", 10, 4000), skills: s("skills", 0, 300), salaryRange: s("salaryRange", 0, 120), questions: s("questions", 0, 1500), status: "DRAFT", createdBy: caller.kind === "user" ? caller.userId : `apikey:${caller.kind === "key" ? caller.keyId : ""}`, createdAt: new Date() };
  await db.batch([db.insert(jobListings).values(row), db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: row.createdBy, orgId, action: "api.jobs.listing.create", resource: "job", resourceId: id, decision: "allow", reason: null, createdAt: new Date() })]);
  return { id, status: "DRAFT", employerVerified: ver?.status === "VERIFIED", note: "Drafts are published by a person in the employer console." };
});
