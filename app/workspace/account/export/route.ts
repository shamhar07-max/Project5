import { desc, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { getDb } from "../../../../db";
import { academyEnrollments, academyProfiles, academySubmissions, auditLog, credentials, jobApplications, jobTracks, leads, missionSubmissions, notifications, supportTickets, talentEvidence, talentProfiles, talentSettings, userPreferences, verificationRequests } from "../../../../db/schema";

// Access/export workflow (blueprint Part II-B §3): a signed-in person downloads their own records.
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return new Response("Sign in first.", { status: 401 });
  const db = getDb(); const me = user.userId;
  const [preferences, academyProfile, enrollments, drafts, submissions, creds, talent, settings, evidence, verifications, applications, tracker, tickets, notes, requests, activity] = await Promise.all([
    db.select().from(userPreferences).where(eq(userPreferences.userId, me)),
    db.select().from(academyProfiles).where(eq(academyProfiles.ownerId, me)),
    db.select().from(academyEnrollments).where(eq(academyEnrollments.ownerId, me)),
    db.select().from(academySubmissions).where(eq(academySubmissions.ownerId, me)),
    db.select().from(missionSubmissions).where(eq(missionSubmissions.ownerId, me)),
    db.select().from(credentials).where(eq(credentials.ownerId, me)),
    db.select().from(talentProfiles).where(eq(talentProfiles.ownerId, me)),
    db.select().from(talentSettings).where(eq(talentSettings.ownerId, me)),
    db.select().from(talentEvidence).where(eq(talentEvidence.ownerId, me)),
    db.select().from(verificationRequests).where(eq(verificationRequests.ownerId, me)),
    db.select().from(jobApplications).where(eq(jobApplications.candidateId, me)),
    db.select().from(jobTracks).where(eq(jobTracks.ownerId, me)),
    db.select().from(supportTickets).where(eq(supportTickets.ownerId, me)),
    db.select().from(notifications).where(eq(notifications.userId, me)),
    db.select().from(leads).where(eq(leads.ownerId, me)),
    db.select().from(auditLog).where(eq(auditLog.actorId, me)).orderBy(desc(auditLog.createdAt)).limit(1000),
  ]);
  await db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: me, orgId: null, action: "account.export", resource: "account", resourceId: me, decision: "allow", reason: null, createdAt: new Date() });
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), account: { userId: me, email: user.email, name: user.fullName }, preferences, academy: { profile: academyProfile, enrollments, practiceDrafts: drafts, missionSubmissions: submissions, credentials: creds }, talent: { profile: talent, settings, evidence, verificationRequests: verifications }, jobs: { applications, tracker }, support: tickets, channelRequests: requests, notifications: notes, activity }, null, 2);
  return new Response(body, { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="digitalburj-export-${new Date().toISOString().slice(0, 10)}.json"`, "cache-control": "no-store" } });
}
