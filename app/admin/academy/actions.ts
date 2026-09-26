"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { academyMissions, auditLog, credentials, missionSubmissions, submissionReviews, userDirectory } from "../../../db/schema";
import { academyCourses } from "../../academy-data";
import { auditRow, oneOf, publish, readableCode, requireStaff, str, opt, uuid, type StaffRole } from "../../../lib/platform";
import { assertTransition } from "../../../lib/workflow";
import { academyAccounts, academyEntitlements, academyOrders } from "../../../db/schema";
import { grantPlan, logActivity } from "../../../lib/academy/access";
import { isPlanId, planById, termDays } from "../../../lib/academy/plans";

const has = (roles: Set<StaffRole>, ...r: StaffRole[]) => roles.has("super_admin") || r.some(x => roles.has(x));

export async function createMission(form: FormData) {
  const { user, roles } = await requireStaff("academy", "academy.mission.create");
  if (!has(roles, "academy_admin")) throw new Error("Only an Academy Admin can author missions.");
  const courseCode = str(form, "courseCode", 2, 20, "Unit");
  if (!academyCourses.some(c => c.code === courseCode)) throw new Error("Choose a unit from the catalogue.");
  const rubric = str(form, "rubric", 10, 3000, "Rubric").split("\n").map(s => s.trim()).filter(Boolean);
  if (rubric.length < 2 || rubric.length > 10) throw new Error("Write between 2 and 10 rubric criteria, one per line.");
  const id = crypto.randomUUID(); const db = getDb();
  await db.batch([
    db.insert(academyMissions).values({ id, courseCode, title: str(form, "title", 4, 140, "Title"), scenario: str(form, "scenario", 20, 4000, "Scenario"), objective: str(form, "objective", 10, 600, "Objective"), instructions: str(form, "instructions", 20, 6000, "Instructions"), requiredOutput: str(form, "requiredOutput", 5, 1000, "Required output"), rubric: JSON.stringify(rubric), skills: opt(form, "skills", 200), maxAttempts: Math.min(5, Math.max(1, Number(form.get("maxAttempts") || 3))), published: form.get("published") === "on", createdBy: user.userId, createdAt: new Date() }),
    db.insert(auditLog).values(auditRow(user, null, "academy.mission.create", "mission", id)),
  ]);
  revalidatePath("/admin/academy");
}

export async function toggleMission(form: FormData) {
  const { user, roles } = await requireStaff("academy", "academy.mission.publish");
  if (!has(roles, "academy_admin")) throw new Error("Only an Academy Admin can publish missions.");
  const id = uuid(form, "id"); const db = getDb();
  const m = await db.select().from(academyMissions).where(eq(academyMissions.id, id)).get();
  if (!m) throw new Error("Mission unavailable.");
  await db.batch([db.update(academyMissions).set({ published: !m.published }).where(eq(academyMissions.id, id)), db.insert(auditLog).values(auditRow(user, null, m.published ? "academy.mission.unpublish" : "academy.mission.publish", "mission", id))]);
  revalidatePath("/admin/academy");
}

export async function claimReview(form: FormData) {
  const { user, roles } = await requireStaff("academy", "academy.review.claim");
  if (!has(roles, "academy_assessor", "academy_admin")) throw new Error("Only assessors review submissions.");
  const id = uuid(form, "id"); const db = getDb();
  const s = await db.select().from(missionSubmissions).where(eq(missionSubmissions.id, id)).get();
  if (!s) throw new Error("Submission unavailable.");
  if (s.ownerId === user.userId) throw new Error("You cannot assess your own work.");
  assertTransition("submission", s.status, "UNDER_REVIEW");
  await publish({ type: "academy.submission.under_review", actorId: user.userId, orgId: null, resourceType: "mission_submission", resourceId: id },
    [{ userId: s.ownerId, title: "An assessor started reviewing your mission", href: `/workspace/academy/missions/${s.missionId}`, category: "Academy" }],
    [db.update(missionSubmissions).set({ status: "UNDER_REVIEW", assessorId: user.userId, updatedAt: new Date() }).where(eq(missionSubmissions.id, id)), db.insert(auditLog).values(auditRow(user, null, "academy.review.claim", "mission_submission", id))]);
  revalidatePath("/admin/academy");
}

export async function assess(form: FormData) {
  const { user, roles } = await requireStaff("academy", "academy.review.decide");
  if (!has(roles, "academy_assessor", "academy_admin")) throw new Error("Only assessors review submissions.");
  const id = uuid(form, "id"); const db = getDb();
  const s = await db.select().from(missionSubmissions).where(eq(missionSubmissions.id, id)).get();
  if (!s || s.assessorId !== user.userId) throw new Error("Claim this submission before assessing it.");
  const m = await db.select().from(academyMissions).where(eq(academyMissions.id, s.missionId)).get();
  const rubric = JSON.parse(m?.rubric ?? "[]") as string[];
  const scores = rubric.map((_, i) => { const v = Number(form.get(`score${i}`)); if (!Number.isInteger(v) || v < 0 || v > 4) throw new Error("Score every criterion from 0 to 4."); return v; });
  const decision = oneOf(form, "decision", ["PASSED", "REVISION_REQUIRED", "FAILED"] as const, "decision");
  const feedback = str(form, "feedback", 20, 4000, "Feedback");
  const pct = Math.round((scores.reduce((a, b) => a + b, 0) / (rubric.length * 4)) * 100);
  if (decision === "PASSED" && scores.some(v => v < 2)) throw new Error("A pass needs at least 2/4 on every criterion.");
  assertTransition("submission", s.status, decision);
  await publish({ type: "academy.assessment.reviewed", actorId: user.userId, orgId: null, resourceType: "mission_submission", resourceId: id, payload: { decision, score: pct } },
    [{ userId: s.ownerId, title: decision === "PASSED" ? `Passed: ${m?.title} (${pct}%)` : decision === "REVISION_REQUIRED" ? `Revision requested: ${m?.title}` : `Not passed: ${m?.title}`, body: feedback.slice(0, 200), href: `/workspace/academy/missions/${s.missionId}`, category: "Academy", priority: "high" }],
    [db.update(missionSubmissions).set({ status: decision, score: pct, updatedAt: new Date() }).where(eq(missionSubmissions.id, id)),
     db.insert(submissionReviews).values({ id: crypto.randomUUID(), submissionId: id, reviewerId: user.userId, reviewerEmail: user.email, kind: "assessment", scores: JSON.stringify(scores), feedback, decision, createdAt: new Date() }),
     db.insert(auditLog).values(auditRow(user, null, "academy.review.decide", "mission_submission", id, "allow", decision))]);
  revalidatePath("/admin/academy");
}

/** Independent verification: the verifier must not be the assessor (Domain 02 §8 layer 5). */
export async function verify(form: FormData) {
  const { user, roles } = await requireStaff("academy", "academy.verify");
  if (!has(roles, "academy_verifier")) throw new Error("Only independent verifiers can verify.");
  const id = uuid(form, "id"); const db = getDb();
  const s = await db.select().from(missionSubmissions).where(eq(missionSubmissions.id, id)).get();
  if (!s) throw new Error("Submission unavailable.");
  if (s.assessorId === user.userId || s.ownerId === user.userId) {
    await db.insert(auditLog).values(auditRow(user, null, "academy.verify", "mission_submission", id, "deny", "verifier_not_independent"));
    throw new Error("Verification must be done by someone who did not assess (or author) this work.");
  }
  const approve = form.get("decision") === "verify";
  const note = str(form, "note", approve ? 0 : 10, 2000, "Verifier note");
  const to = approve ? "VERIFIED" : "VERIFICATION_DECLINED";
  assertTransition("submission", s.status, to);
  const m = await db.select().from(academyMissions).where(eq(academyMissions.id, s.missionId)).get();
  const stmts: unknown[] = [
    db.update(missionSubmissions).set({ status: to, verifierId: user.userId, updatedAt: new Date() }).where(eq(missionSubmissions.id, id)),
    db.insert(submissionReviews).values({ id: crypto.randomUUID(), submissionId: id, reviewerId: user.userId, reviewerEmail: user.email, kind: "verification", scores: "[]", feedback: note || "Evidence reviewed and verified.", decision: to, createdAt: new Date() }),
    db.insert(auditLog).values(auditRow(user, null, "academy.verify", "mission_submission", id, "allow", to)),
  ];
  let code = "";
  if (approve) {
    code = readableCode("DBC");
    const dir = await db.select().from(userDirectory).where(eq(userDirectory.userId, s.ownerId)).get();
    const [local, domain] = s.ownerEmail.split("@");
    const holder = dir?.name || `${local.slice(0, 1)}•••@${domain}`; // never publish a full email address
    stmts.push(db.insert(credentials).values({ id: crypto.randomUUID(), code, ownerId: s.ownerId, holderName: holder, submissionId: s.id, courseCode: m?.courseCode ?? "", title: m?.title ?? "Academy mission", skills: m?.skills ?? "", verifierId: user.userId, status: "active", issuedAt: new Date() }));
  }
  await publish({ type: approve ? "academy.credential.issued" : "academy.verification.declined", actorId: user.userId, orgId: null, resourceType: "mission_submission", resourceId: id, payload: { code } },
    [{ userId: s.ownerId, title: approve ? `Verified — credential ${code} issued` : "Verification declined", body: note.slice(0, 200), href: approve ? "/workspace/academy/credentials" : `/workspace/academy/missions/${s.missionId}`, category: "Academy", priority: "high" }],
    stmts as never[]);
  revalidatePath("/admin/academy");
}

export async function revokeCredential(form: FormData) {
  const { user, roles } = await requireStaff("academy", "academy.credential.revoke");
  if (!has(roles, "academy_admin")) throw new Error("Only an Academy Admin can revoke credentials.");
  const id = uuid(form, "id");
  const reason = str(form, "reason", 10, 500, "Reason");
  const db = getDb();
  const c = await db.select().from(credentials).where(and(eq(credentials.id, id), eq(credentials.status, "active"))).get();
  if (!c) throw new Error("Credential unavailable.");
  await publish({ type: "academy.credential.revoked", actorId: user.userId, orgId: null, resourceType: "credential", resourceId: id, payload: { code: c.code } },
    [{ userId: c.ownerId, title: `Credential ${c.code} was revoked`, body: reason, href: "/workspace/academy/credentials", category: "Academy", priority: "high" }],
    [db.update(credentials).set({ status: "revoked", statusReason: reason }).where(eq(credentials.id, id)), db.insert(auditLog).values(auditRow(user, null, "academy.credential.revoke", "credential", id, "allow", reason))]);
  revalidatePath("/admin/academy");
}

// ─── Academy packages: orders and entitlements ───
// No payment provider is connected, so paid orders wait here until an Academy Admin
// confirms payment. Confirming grants the package; every decision is audit-logged.

async function academyAdmin(action: string) {
  const ctx = await requireStaff("academy", action);
  if (!has(ctx.roles, "academy_admin")) throw new Error("Only an Academy Admin can change Academy access.");
  return ctx;
}

export async function confirmAcademyOrder(form: FormData) {
  const { user } = await academyAdmin("academy.order.confirm");
  const db = getDb(); const id = uuid(form, "id");
  const order = await db.select().from(academyOrders).where(eq(academyOrders.id, id)).get();
  if (!order || order.status !== "payment_pending" || !isPlanId(order.plan)) throw new Error("This order is not awaiting payment.");
  await db.update(academyOrders).set({ status: "paid", decidedAt: new Date(), decidedBy: user.userId }).where(eq(academyOrders.id, id));
  await grantPlan(order.accountId, planById[order.plan], "payment", order.id, termDays(order.billing === "annual" ? "annual" : "monthly"));
  await logActivity(order.accountId, "plan", `Payment confirmed — ${planById[order.plan].name} is active`);
  await db.insert(auditLog).values(auditRow(user, null, "academy.order.confirm", "academy_order", id));
  revalidatePath("/admin/academy");
}

export async function cancelAcademyOrder(form: FormData) {
  const { user } = await academyAdmin("academy.order.cancel");
  const db = getDb(); const id = uuid(form, "id");
  await db.update(academyOrders).set({ status: "cancelled", decidedAt: new Date(), decidedBy: user.userId }).where(and(eq(academyOrders.id, id), eq(academyOrders.status, "payment_pending")));
  await db.insert(auditLog).values(auditRow(user, null, "academy.order.cancel", "academy_order", id));
  revalidatePath("/admin/academy");
}

export async function grantAcademyAccess(form: FormData) {
  const { user } = await academyAdmin("academy.access.grant");
  const db = getDb();
  const email = str(form, "email", 3, 160, "Email").toLowerCase();
  const plan = oneOf(form, "plan", ["plus", "creator", "professional"] as const, "Package");
  const days = Math.max(1, Math.min(730, Number(form.get("days")) || 30));
  const account = await db.select().from(academyAccounts).where(eq(academyAccounts.email, email)).get();
  if (!account) throw new Error("No Academy account uses that email.");
  await grantPlan(account.id, planById[plan], "manual_grant", null, days);
  await logActivity(account.id, "plan", `${planById[plan].name} granted by DigitalBurj`);
  await db.insert(auditLog).values(auditRow(user, null, "academy.access.grant", "academy_account", account.id, "allow", `${plan} ${days}d`));
  revalidatePath("/admin/academy");
}

export async function revokeAcademyAccess(form: FormData) {
  const { user } = await academyAdmin("academy.access.revoke");
  const db = getDb(); const id = uuid(form, "id");
  await db.update(academyEntitlements).set({ status: "revoked" }).where(and(eq(academyEntitlements.id, id), eq(academyEntitlements.status, "active")));
  await db.insert(auditLog).values(auditRow(user, null, "academy.access.revoke", "academy_entitlement", id));
  revalidatePath("/admin/academy");
}
