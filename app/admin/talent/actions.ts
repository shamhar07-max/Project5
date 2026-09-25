"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, employerVerifications, talentEvidence, verificationRequests } from "../../../db/schema";
import { auditRow, membersWith, oneOf, opt, publish, requireStaff, str, uuid } from "../../../lib/platform";
import { assertTransition } from "../../../lib/workflow";

export async function claimVerification(form: FormData) {
  const { user } = await requireStaff("talent", "talent.verification.claim");
  const id = uuid(form, "id"); const db = getDb();
  const r = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id)).get();
  if (!r) throw new Error("Request unavailable.");
  if (r.ownerId === user.userId) throw new Error("You cannot verify your own evidence.");
  assertTransition("verification", r.status, "UNDER_REVIEW");
  await db.batch([db.update(verificationRequests).set({ status: "UNDER_REVIEW", verifierId: user.userId, updatedAt: new Date() }).where(eq(verificationRequests.id, id)), db.insert(auditLog).values(auditRow(user, null, "talent.verification.claim", "verification", id))]);
  revalidatePath("/admin/talent");
}

export async function decideVerification(form: FormData) {
  const { user } = await requireStaff("talent", "talent.verification.decide");
  const id = uuid(form, "id"); const db = getDb();
  const r = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id)).get();
  if (!r || r.verifierId !== user.userId) throw new Error("Claim this request before deciding.");
  const to = oneOf(form, "decision", ["VERIFIED", "REJECTED", "MORE_INFO"] as const, "decision");
  const note = str(form, "note", to === "VERIFIED" ? 0 : 10, 1000, "Note");
  assertTransition("verification", r.status, to);
  const ev = await db.select().from(talentEvidence).where(eq(talentEvidence.id, r.evidenceId)).get();
  const evidenceStatus = to === "VERIFIED" ? "Verified" : to === "REJECTED" ? "Declared" : "Submitted";
  await publish({ type: to === "VERIFIED" ? "talent.verification.completed" : `talent.verification.${to.toLowerCase()}`, actorId: user.userId, orgId: null, resourceType: "verification", resourceId: id },
    [{ userId: r.ownerId, title: to === "VERIFIED" ? `Verified: ${ev?.title}` : to === "MORE_INFO" ? `A verifier needs more information: ${ev?.title}` : `Not verified: ${ev?.title}`, body: note.slice(0, 200), href: "/workspace/talent", category: "Talent", priority: "high" }],
    [db.update(verificationRequests).set({ status: to, note: note || r.note, updatedAt: new Date() }).where(eq(verificationRequests.id, id)),
     db.update(talentEvidence).set({ status: evidenceStatus, ...(to === "VERIFIED" ? { source: `Verified by DigitalBurj (${new Date().toISOString().slice(0, 10)})` } : {}) }).where(eq(talentEvidence.id, r.evidenceId)),
     db.insert(auditLog).values(auditRow(user, null, "talent.verification.decide", "verification", id, "allow", to))]);
  revalidatePath("/admin/talent");
}

/** Revocation keeps the audit history (Domain 05 §2 REVOKED). */
export async function revokeVerification(form: FormData) {
  const { user } = await requireStaff("talent", "talent.verification.revoke");
  const id = uuid(form, "id"); const reason = str(form, "reason", 10, 500, "Reason"); const db = getDb();
  const r = await db.select().from(verificationRequests).where(eq(verificationRequests.id, id)).get();
  if (!r) throw new Error("Request unavailable.");
  assertTransition("verification", r.status, "REVOKED");
  await publish({ type: "talent.verification.revoked", actorId: user.userId, orgId: null, resourceType: "verification", resourceId: id },
    [{ userId: r.ownerId, title: "A verification was revoked", body: reason, href: "/workspace/talent", category: "Talent", priority: "high" }],
    [db.update(verificationRequests).set({ status: "REVOKED", note: reason, updatedAt: new Date() }).where(eq(verificationRequests.id, id)), db.update(talentEvidence).set({ status: "Revoked" }).where(eq(talentEvidence.id, r.evidenceId)), db.insert(auditLog).values(auditRow(user, null, "talent.verification.revoke", "verification", id, "allow", reason))]);
  revalidatePath("/admin/talent");
}

export async function decideEmployer(form: FormData) {
  const { user } = await requireStaff("talent", "employer.verification.decide");
  const orgId = String(form.get("orgId") || ""); const db = getDb();
  const v = await db.select().from(employerVerifications).where(eq(employerVerifications.orgId, orgId)).get();
  if (!v) throw new Error("Request unavailable.");
  const status = oneOf(form, "decision", ["VERIFIED", "REJECTED"] as const, "decision");
  const note = status === "REJECTED" ? str(form, "note", 10, 500, "Reason") : opt(form, "note", 500);
  const admins = await membersWith(orgId, "org.manage");
  await publish({ type: `organization.employer.${status.toLowerCase()}`, actorId: user.userId, orgId, resourceType: "organization", resourceId: orgId },
    admins.map(userId => ({ userId, title: status === "VERIFIED" ? `${v.companyName} is now a verified employer` : "Employer verification was not approved", body: note, href: "/workspace/organizations", category: "Jobs", priority: "high" })),
    [db.update(employerVerifications).set({ status, note, decidedBy: user.userId, updatedAt: new Date() }).where(eq(employerVerifications.orgId, orgId)), db.insert(auditLog).values(auditRow(user, orgId, "employer.verification.decide", "organization", orgId, "allow", status))]);
  revalidatePath("/admin/talent");
}
