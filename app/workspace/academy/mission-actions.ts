"use server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { academyMissions, auditLog, credentials, missionSubmissions, talentEvidence } from "../../../db/schema";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { auditRow, opt, publish, str, uuid } from "../../../lib/platform";
import { assertTransition } from "../../../lib/workflow";
import { staffIdsWith } from "../../../lib/staff";

export async function submitMission(form: FormData) {
  const user = await requireChatGPTUser("/workspace/academy");
  const missionId = uuid(form, "missionId");
  const content = str(form, "content", 40, 8000, "Your submission");
  const artifactUrl = opt(form, "artifactUrl", 500);
  if (artifactUrl && !/^https:\/\/\S+$/.test(artifactUrl)) throw new Error("Link your artifact with an https:// address (repository, document or recording).");
  const db = getDb();
  const mission = await db.select().from(academyMissions).where(and(eq(academyMissions.id, missionId), eq(academyMissions.published, true))).get();
  if (!mission) throw new Error("This mission is not open for submissions.");
  const latest = await db.select().from(missionSubmissions).where(and(eq(missionSubmissions.missionId, missionId), eq(missionSubmissions.ownerId, user.userId))).orderBy(desc(missionSubmissions.updatedAt)).get();
  const now = new Date();
  let id: string, stmt, type: string;
  if (latest && latest.status === "REVISION_REQUIRED") {
    if (latest.attempt >= mission.maxAttempts) throw new Error(`You have used all ${mission.maxAttempts} attempts for this mission.`);
    assertTransition("submission", latest.status, "RESUBMITTED");
    id = latest.id; type = "academy.submission.resubmitted";
    stmt = db.update(missionSubmissions).set({ content, artifactUrl, attempt: latest.attempt + 1, status: "RESUBMITTED", updatedAt: now }).where(eq(missionSubmissions.id, latest.id));
  } else {
    if (latest && !["FAILED", "VERIFICATION_DECLINED"].includes(latest.status)) throw new Error("You already have an active submission for this mission.");
    id = crypto.randomUUID(); type = "academy.submission.created";
    stmt = db.insert(missionSubmissions).values({ id, missionId, ownerId: user.userId, ownerEmail: user.email, content, artifactUrl, attempt: 1, status: "SUBMITTED", createdAt: now, updatedAt: now });
  }
  const assessors = await staffIdsWith(["academy_assessor", "academy_admin"]);
  await publish({ type, actorId: user.userId, orgId: null, resourceType: "mission_submission", resourceId: id, payload: { missionId, title: mission.title } },
    assessors.map(uid => ({ userId: uid, title: `New submission: ${mission.title}`, href: "/admin/academy", category: "Academy" })),
    [stmt, db.insert(auditLog).values(auditRow(user, null, type, "mission_submission", id))]);
  revalidatePath(`/workspace/academy/missions/${missionId}`);
}

export async function requestIndependentVerification(form: FormData) {
  const user = await requireChatGPTUser("/workspace/academy");
  const id = uuid(form, "submissionId");
  const db = getDb();
  const sub = await db.select().from(missionSubmissions).where(and(eq(missionSubmissions.id, id), eq(missionSubmissions.ownerId, user.userId))).get();
  if (!sub) throw new Error("Submission unavailable.");
  assertTransition("submission", sub.status, "VERIFICATION_PENDING");
  const verifiers = await staffIdsWith(["academy_verifier"]);
  await publish({ type: "academy.verification.requested", actorId: user.userId, orgId: null, resourceType: "mission_submission", resourceId: id },
    verifiers.map(uid => ({ userId: uid, title: "Independent verification requested", href: "/admin/academy?tab=verify", category: "Academy" })),
    [db.update(missionSubmissions).set({ status: "VERIFICATION_PENDING", updatedAt: new Date() }).where(eq(missionSubmissions.id, id)), db.insert(auditLog).values(auditRow(user, null, "academy.verification.request", "mission_submission", id))]);
  revalidatePath(`/workspace/academy/missions/${sub.missionId}`);
}

/** The learner chooses whether verified learning evidence is added to Talent (Domain 05 §9). */
export async function addCredentialToTalent(form: FormData) {
  const user = await requireChatGPTUser("/workspace/academy/credentials");
  const id = uuid(form, "credentialId");
  const db = getDb();
  const c = await db.select().from(credentials).where(and(eq(credentials.id, id), eq(credentials.ownerId, user.userId), eq(credentials.status, "active"))).get();
  if (!c) throw new Error("Credential unavailable.");
  const exists = await db.select().from(talentEvidence).where(and(eq(talentEvidence.ownerId, user.userId), eq(talentEvidence.source, `Academy credential ${c.code}`))).get();
  if (exists) return;
  await db.batch([
    db.update(missionSubmissions).set({ talentConsent: true }).where(eq(missionSubmissions.id, c.submissionId)),
    db.insert(talentEvidence).values({ id: crypto.randomUUID(), ownerId: user.userId, title: c.title, capability: c.skills || c.courseCode, description: `Independently verified DigitalBurj Academy mission. Verify at /verify/${c.code}.`, source: `Academy credential ${c.code}`, status: "Verified", visibility: "Private", createdAt: new Date() }),
    db.insert(auditLog).values(auditRow(user, null, "talent.evidence.from_credential", "credential", c.id)),
  ]);
  revalidatePath("/workspace/academy/credentials");
  revalidatePath("/workspace/talent");
}
