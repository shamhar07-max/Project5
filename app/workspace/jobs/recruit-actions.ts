"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { applicationEvents, approvals, auditLog, employerVerifications, interviews, jobApplications, jobListings, offers, organizations, talentSettings } from "../../../db/schema";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { newApproval } from "../../../lib/approvals";
import { auditRow, can, membersWith, oneOf, opt, publish, str, uuid } from "../../../lib/platform";
import { assertTransition } from "../../../lib/workflow";
import { workspaceContext } from "../access";

// ─── Candidate ───
export async function applyToJob(form: FormData) {
  const user = await requireChatGPTUser("/jobs/board");
  const jobId = uuid(form, "jobId"); const db = getDb();
  const job = await db.select().from(jobListings).where(and(eq(jobListings.id, jobId), eq(jobListings.status, "PUBLISHED"))).get();
  if (!job) throw new Error("This role is no longer open.");
  const existing = await db.select().from(jobApplications).where(and(eq(jobApplications.jobId, jobId), eq(jobApplications.candidateId, user.userId))).get();
  if (existing) throw new Error("You have already applied to this role.");
  const shareProfile = form.get("shareProfile") === "on";
  if (shareProfile) {
    const s = await db.select().from(talentSettings).where(eq(talentSettings.ownerId, user.userId)).get();
    if (!s || s.visibility === "private") throw new Error("To share your Capability Passport, set its visibility to employers or public first.");
  }
  const id = crypto.randomUUID(); const now = new Date();
  const recruiters = await membersWith(job.orgId, "jobs.manage");
  await publish({ type: "jobs.application.created", actorId: user.userId, orgId: job.orgId, resourceType: "application", resourceId: id, payload: { jobId, title: job.title } },
    recruiters.map(userId => ({ userId, title: `New application: ${job.title}`, href: `/workspace/jobs/employer?job=${job.id}`, category: "Jobs" })),
    [db.insert(jobApplications).values({ id, jobId, orgId: job.orgId, candidateId: user.userId, candidateName: str(form, "name", 2, 80, "Name"), candidateEmail: user.email, coverNote: opt(form, "coverNote", 3000), answers: opt(form, "answers", 3000), shareProfile, assessmentConsent: form.get("assessmentConsent") === "on", stage: "APPLIED", createdAt: now, updatedAt: now }),
     db.insert(applicationEvents).values({ id: crypto.randomUUID(), applicationId: id, actorId: user.userId, fromStage: "", toStage: "APPLIED", note: "Application submitted", createdAt: now }),
     db.insert(auditLog).values(auditRow(user, null, "jobs.application.create", "application", id))]);
  revalidatePath(`/jobs/board/${jobId}`);
  revalidatePath("/workspace/jobs/applications");
}

export async function withdrawApplication(form: FormData) {
  const user = await requireChatGPTUser("/workspace/jobs/applications");
  const id = uuid(form, "id"); const db = getDb();
  const app = await db.select().from(jobApplications).where(and(eq(jobApplications.id, id), eq(jobApplications.candidateId, user.userId))).get();
  if (!app) throw new Error("Application unavailable.");
  assertTransition("application", app.stage, "WITHDRAWN");
  await db.batch([db.update(jobApplications).set({ stage: "WITHDRAWN", updatedAt: new Date() }).where(eq(jobApplications.id, id)), db.insert(applicationEvents).values({ id: crypto.randomUUID(), applicationId: id, actorId: user.userId, fromStage: app.stage, toStage: "WITHDRAWN", note: "Withdrawn by candidate", createdAt: new Date() })]);
  revalidatePath("/workspace/jobs/applications");
}

export async function respondToOffer(form: FormData) {
  const user = await requireChatGPTUser("/workspace/jobs/applications");
  const id = uuid(form, "offerId"); const db = getDb();
  const o = await db.select().from(offers).where(eq(offers.id, id)).get();
  const app = o && await db.select().from(jobApplications).where(and(eq(jobApplications.id, o.applicationId), eq(jobApplications.candidateId, user.userId))).get();
  if (!o || !app) throw new Error("Offer unavailable.");
  const accept = form.get("decision") === "accept";
  const to = accept ? "ACCEPTED" : "DECLINED";
  assertTransition("offer", o.status, to);
  const stmts: unknown[] = [db.update(offers).set({ status: to, updatedAt: new Date() }).where(eq(offers.id, o.id))];
  if (accept) { assertTransition("application", app.stage, "HIRED"); stmts.push(db.update(jobApplications).set({ stage: "HIRED", updatedAt: new Date() }).where(eq(jobApplications.id, app.id)), db.insert(applicationEvents).values({ id: crypto.randomUUID(), applicationId: app.id, actorId: user.userId, fromStage: app.stage, toStage: "HIRED", note: "Offer accepted", createdAt: new Date() })); }
  const recruiters = await membersWith(app.orgId, "jobs.manage");
  await publish({ type: accept ? "jobs.offer.accepted" : "jobs.offer.declined", actorId: user.userId, orgId: app.orgId, resourceType: "offer", resourceId: o.id },
    recruiters.map(userId => ({ userId, title: `${app.candidateName} ${accept ? "accepted" : "declined"} the offer`, href: `/workspace/jobs/employer?job=${app.jobId}`, category: "Jobs", priority: "high" })), stmts as never[]);
  revalidatePath("/workspace/jobs/applications");
}

// ─── Employer (organization context, jobs.manage) ───
async function employerCtx() {
  const ctx = await workspaceContext();
  if (!ctx.orgId || !can(ctx.role, "jobs.manage")) throw new Error("Switch to an organization where you are an owner, admin, recruiter or hiring manager.");
  return ctx as typeof ctx & { orgId: string };
}

export async function saveListing(form: FormData) {
  const ctx = await employerCtx(); const db = getDb();
  const org = await db.select().from(organizations).where(eq(organizations.id, ctx.orgId)).get();
  const values = {
    title: str(form, "title", 3, 120, "Job title"), location: str(form, "location", 2, 120, "Location"),
    workArrangement: oneOf(form, "workArrangement", ["On-site", "Hybrid", "Remote"] as const, "work arrangement"),
    employmentType: oneOf(form, "employmentType", ["Full-time", "Part-time", "Contract", "Internship"] as const, "employment type"),
    description: str(form, "description", 40, 6000, "Role description"), requirements: str(form, "requirements", 10, 4000, "Requirements"),
    skills: opt(form, "skills", 300), salaryRange: opt(form, "salaryRange", 120), questions: opt(form, "questions", 1500),
  };
  const id = String(form.get("jobId") || "");
  if (/^[0-9a-f-]{36}$/.test(id)) {
    await db.batch([db.update(jobListings).set(values).where(and(eq(jobListings.id, id), eq(jobListings.orgId, ctx.orgId))), db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "jobs.listing.update", "job", id))]);
  } else {
    const nid = crypto.randomUUID();
    await db.batch([db.insert(jobListings).values({ id: nid, orgId: ctx.orgId, company: org?.name ?? "Employer", ...values, status: "DRAFT", createdBy: ctx.user.userId, createdAt: new Date() }), db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "jobs.listing.create", "job", nid))]);
  }
  revalidatePath("/workspace/jobs/employer");
}

export async function setListingStatus(form: FormData) {
  const ctx = await employerCtx(); const db = getDb();
  const id = uuid(form, "jobId");
  const status = oneOf(form, "status", ["PUBLISHED", "CLOSED", "DRAFT"] as const, "status");
  const job = await db.select().from(jobListings).where(and(eq(jobListings.id, id), eq(jobListings.orgId, ctx.orgId))).get();
  if (!job) throw new Error("Role unavailable.");
  if (status === "PUBLISHED") {
    const v = await db.select().from(employerVerifications).where(eq(employerVerifications.orgId, ctx.orgId)).get();
    if (v?.status !== "VERIFIED") throw new Error("Only verified employers can publish. Request verification from Organizations.");
  }
  await publish({ type: `jobs.listing.${status.toLowerCase()}`, actorId: ctx.user.userId, orgId: ctx.orgId, resourceType: "job", resourceId: id, payload: { title: job.title } }, [],
    [db.update(jobListings).set({ status, publishedAt: status === "PUBLISHED" ? new Date() : job.publishedAt }).where(eq(jobListings.id, id)), db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "jobs.listing.status", "job", id, "allow", status))]);
  revalidatePath("/workspace/jobs/employer");
}

export async function moveApplication(form: FormData) {
  const ctx = await employerCtx(); const db = getDb();
  const id = uuid(form, "id");
  const to = String(form.get("to") || "");
  if (to === "WITHDRAWN" || to === "HIRED" || to === "OFFER") throw new Error("Use the offer workflow for offers; only candidates withdraw.");
  const app = await db.select().from(jobApplications).where(and(eq(jobApplications.id, id), eq(jobApplications.orgId, ctx.orgId))).get();
  if (!app) throw new Error("Application unavailable.");
  assertTransition("application", app.stage, to);
  const note = opt(form, "note", 500);
  const job = await db.select().from(jobListings).where(eq(jobListings.id, app.jobId)).get();
  await publish({ type: `jobs.application.${to.toLowerCase()}`, actorId: ctx.user.userId, orgId: ctx.orgId, resourceType: "application", resourceId: id, payload: { from: app.stage, to } },
    [{ userId: app.candidateId, title: to === "REJECTED" ? `Update on ${job?.title}: not progressing` : `Update on ${job?.title}: ${to.replace(/_/g, " ").toLowerCase()}`, body: note, href: "/workspace/jobs/applications", category: "Jobs" }],
    [db.update(jobApplications).set({ stage: to, updatedAt: new Date() }).where(eq(jobApplications.id, id)), db.insert(applicationEvents).values({ id: crypto.randomUUID(), applicationId: id, actorId: ctx.user.userId, fromStage: app.stage, toStage: to, note, createdAt: new Date() }), db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "jobs.application.move", "application", id, "allow", to))]);
  revalidatePath("/workspace/jobs/employer");
}

export async function scheduleInterview(form: FormData) {
  const ctx = await employerCtx(); const db = getDb();
  const id = uuid(form, "id");
  const app = await db.select().from(jobApplications).where(and(eq(jobApplications.id, id), eq(jobApplications.orgId, ctx.orgId))).get();
  if (!app) throw new Error("Application unavailable.");
  const when = new Date(String(form.get("scheduledAt") || ""));
  if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() - 60000) throw new Error("Choose a future date and time.");
  const mode = oneOf(form, "mode", ["Video call", "Phone", "In person"] as const, "mode");
  const stmts: unknown[] = [db.insert(interviews).values({ id: crypto.randomUUID(), applicationId: id, scheduledAt: when, mode, interviewer: str(form, "interviewer", 2, 120, "Interviewer"), createdBy: ctx.user.userId, createdAt: new Date() })];
  if (app.stage !== "INTERVIEW") { assertTransition("application", app.stage, "INTERVIEW"); stmts.push(db.update(jobApplications).set({ stage: "INTERVIEW", updatedAt: new Date() }).where(eq(jobApplications.id, id)), db.insert(applicationEvents).values({ id: crypto.randomUUID(), applicationId: id, actorId: ctx.user.userId, fromStage: app.stage, toStage: "INTERVIEW", note: `Interview scheduled (${mode})`, createdAt: new Date() })); }
  await publish({ type: "jobs.interview.scheduled", actorId: ctx.user.userId, orgId: ctx.orgId, resourceType: "application", resourceId: id },
    [{ userId: app.candidateId, title: `Interview scheduled: ${when.toUTCString().slice(0, 22)} UTC (${mode})`, href: "/workspace/jobs/applications", category: "Jobs", priority: "high" }], stmts as never[]);
  revalidatePath("/workspace/jobs/employer");
}

export async function recordInterviewFeedback(form: FormData) {
  const ctx = await employerCtx(); const db = getDb();
  const id = uuid(form, "interviewId");
  const iv = await db.select().from(interviews).where(eq(interviews.id, id)).get();
  const app = iv && await db.select().from(jobApplications).where(and(eq(jobApplications.id, iv.applicationId), eq(jobApplications.orgId, ctx.orgId))).get();
  if (!iv || !app) throw new Error("Interview unavailable.");
  const rating = Number(form.get("rating"));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rate from 1 to 5.");
  await db.update(interviews).set({ feedback: str(form, "feedback", 10, 3000, "Feedback"), rating }).where(eq(interviews.id, id));
  revalidatePath("/workspace/jobs/employer");
}

/** Offers are approved by an Offer Approver (owner or hiring manager) before release (Domain 06 §8). */
export async function createOffer(form: FormData) {
  const ctx = await employerCtx(); const db = getDb();
  const id = uuid(form, "id");
  const app = await db.select().from(jobApplications).where(and(eq(jobApplications.id, id), eq(jobApplications.orgId, ctx.orgId))).get();
  if (!app) throw new Error("Application unavailable.");
  if (!["FINAL_REVIEW", "INTERVIEW"].includes(app.stage)) throw new Error("Move the candidate to final review before making an offer.");
  const pending = await db.select().from(offers).where(and(eq(offers.applicationId, id), eq(offers.status, "PENDING_APPROVAL"))).get();
  if (pending) throw new Error("An offer is already awaiting approval.");
  const terms = str(form, "terms", 20, 3000, "Offer terms");
  const offerId = crypto.randomUUID();
  const approvers = await membersWith(ctx.orgId, "jobs.offer.approve");
  const job = await db.select().from(jobListings).where(eq(jobListings.id, app.jobId)).get();
  const stmts: unknown[] = [db.insert(offers).values({ id: offerId, applicationId: id, terms, status: "PENDING_APPROVAL", createdBy: ctx.user.userId, createdAt: new Date(), updatedAt: new Date() }), db.insert(approvals).values(newApproval({ kind: "offer", division: "Jobs", orgId: ctx.orgId, ownerId: ctx.user.userId, approverScope: "jobs.offer.approve", resourceId: offerId, title: `Approve offer: ${app.candidateName} — ${job?.title}`, detail: terms, requestedBy: ctx.user.userId }))];
  if (app.stage === "INTERVIEW") { assertTransition("application", "INTERVIEW", "FINAL_REVIEW"); stmts.push(db.update(jobApplications).set({ stage: "FINAL_REVIEW", updatedAt: new Date() }).where(eq(jobApplications.id, id))); }
  await publish({ type: "jobs.offer.created", actorId: ctx.user.userId, orgId: ctx.orgId, resourceType: "offer", resourceId: offerId },
    approvers.map(userId => ({ userId, title: `Offer awaiting your approval: ${app.candidateName}`, href: "/workspace/approvals", category: "Jobs", priority: "high" })), stmts as never[]);
  revalidatePath("/workspace/jobs/employer");
}
