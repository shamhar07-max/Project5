"use server";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { auditLog, talentEvidence, talentProfiles, talentSettings, verificationRequests } from "../../../db/schema";
import { publish } from "../../../lib/platform";
import { staffIdsWith } from "../../../lib/staff";
import { assertTransition } from "../../../lib/workflow";

const field = (form: FormData, key: string, max: number) => {
  const value = String(form.get(key) || "").trim();
  if (value.length > max) throw new Error(`${key} is too long.`);
  return value;
};
const audit = (userId: string, action: string, id: string) => ({ id: crypto.randomUUID(), actorId: userId, orgId: null, action, resource: "talent", resourceId: id, decision: "allow" as const, createdAt: new Date() });

export async function saveTalentProfile(form: FormData) {
  const user = await requireChatGPTUser("/workspace/talent");
  const headline = field(form, "headline", 120);
  const location = field(form, "location", 100);
  const summary = field(form, "summary", 1200);
  const availability = field(form, "availability", 40);
  if (!headline) throw new Error("Add a professional headline.");
  if (!["Not specified", "Open to work", "Open to projects", "Unavailable"].includes(availability)) throw new Error("Choose an availability option.");
  const db = getDb();
  await db.batch([
    db.insert(talentProfiles).values({ ownerId: user.userId, headline, location, summary, availability, updatedAt: new Date() }).onConflictDoUpdate({ target: talentProfiles.ownerId, set: { headline, location, summary, availability, updatedAt: new Date() } }),
    db.insert(auditLog).values(audit(user.userId, "talent.profile.save", user.userId)),
  ]);
  revalidatePath("/workspace/talent");
}

export async function addTalentEvidence(form: FormData) {
  const user = await requireChatGPTUser("/workspace/talent");
  const title = field(form, "title", 120);
  const capability = field(form, "capability", 80);
  const description = field(form, "description", 1000);
  if (!title || !capability || description.length < 20) throw new Error("Add a title, capability and at least 20 characters describing the work.");
  const id = crypto.randomUUID();
  await getDb().batch([
    getDb().insert(talentEvidence).values({ id, ownerId: user.userId, title, capability, description, source: "Self reported", status: "Declared", visibility: "Private", createdAt: new Date() }),
    getDb().insert(auditLog).values(audit(user.userId, "talent.evidence.create", id)),
  ]);
  revalidatePath("/workspace/talent");
}

export async function removeTalentEvidence(form: FormData) {
  const user = await requireChatGPTUser("/workspace/talent");
  const id = String(form.get("id") || "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Evidence unavailable.");
  const db = getDb();
  const found = await db.select({ id: talentEvidence.id }).from(talentEvidence).where(and(eq(talentEvidence.id, id), eq(talentEvidence.ownerId, user.userId))).get();
  if (!found) throw new Error("Evidence unavailable.");
  await db.batch([
    db.delete(talentEvidence).where(and(eq(talentEvidence.id, id), eq(talentEvidence.ownerId, user.userId))),
    db.insert(auditLog).values(audit(user.userId, "talent.evidence.delete", id)),
  ]);
  revalidatePath("/workspace/talent");
}

// ─── Privacy center, visibility and verification (blueprint Domain 05) ───
export async function saveTalentSettings(form: FormData) {
  const user = await requireChatGPTUser("/workspace/talent");
  const visibility = String(form.get("visibility") || "private");
  if (!["private", "employers", "public"].includes(visibility)) throw new Error("Choose a visibility option.");
  const slug = String(form.get("slug") || "").trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) throw new Error("Your passport address needs 3–40 lowercase letters, numbers or hyphens.");
  const contactEmail = field(form, "contactEmail", 200);
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) throw new Error("Enter a valid contact email.");
  const db = getDb();
  const taken = await db.select().from(talentSettings).where(eq(talentSettings.slug, slug)).get();
  if (taken && taken.ownerId !== user.userId) throw new Error("That passport address is taken.");
  const values = { displayName: field(form, "displayName", 80), slug, visibility, searchable: form.get("searchable") === "on", showContact: form.get("showContact") === "on", contactEmail, updatedAt: new Date() };
  await db.batch([
    db.insert(talentSettings).values({ ownerId: user.userId, ...values }).onConflictDoUpdate({ target: talentSettings.ownerId, set: values }),
    db.insert(auditLog).values(audit(user.userId, "talent.privacy.update", user.userId)),
  ]);
  revalidatePath("/workspace/talent");
}

export async function setEvidenceVisibility(form: FormData) {
  const user = await requireChatGPTUser("/workspace/talent");
  const id = String(form.get("id") || "");
  const visibility = String(form.get("visibility") || "");
  if (!["Private", "Employers", "Public"].includes(visibility)) throw new Error("Choose a visibility.");
  const db = getDb();
  await db.batch([
    db.update(talentEvidence).set({ visibility }).where(and(eq(talentEvidence.id, id), eq(talentEvidence.ownerId, user.userId))),
    db.insert(auditLog).values(audit(user.userId, "talent.evidence.visibility", id)),
  ]);
  revalidatePath("/workspace/talent");
}

export async function requestEvidenceVerification(form: FormData) {
  const user = await requireChatGPTUser("/workspace/talent");
  const id = String(form.get("id") || "");
  const note = field(form, "note", 1000);
  const db = getDb();
  const ev = await db.select().from(talentEvidence).where(and(eq(talentEvidence.id, id), eq(talentEvidence.ownerId, user.userId))).get();
  if (!ev) throw new Error("Evidence unavailable.");
  if (ev.status === "Verified") throw new Error("This evidence is already verified.");
  const open = await db.select().from(verificationRequests).where(and(eq(verificationRequests.evidenceId, id), inArray(verificationRequests.status, ["SUBMITTED", "UNDER_REVIEW", "MORE_INFO"]))).get();
  const now = new Date();
  const verifiers = await staffIdsWith(["talent_admin"]);
  if (open?.status === "MORE_INFO") {
    assertTransition("verification", "MORE_INFO", "SUBMITTED");
    await publish({ type: "talent.verification.resubmitted", actorId: user.userId, orgId: null, resourceType: "verification", resourceId: open.id }, verifiers.map(userId => ({ userId, title: `More information provided: ${ev.title}`, href: "/admin/talent", category: "Talent" })),
      [db.update(verificationRequests).set({ status: "SUBMITTED", note: note || open.note, updatedAt: now }).where(eq(verificationRequests.id, open.id)), db.insert(auditLog).values(audit(user.userId, "talent.verification.resubmit", open.id))]);
  } else if (open) throw new Error("A verification request is already in progress.");
  else {
    const rid = crypto.randomUUID();
    await publish({ type: "talent.verification.requested", actorId: user.userId, orgId: null, resourceType: "verification", resourceId: rid }, verifiers.map(userId => ({ userId, title: `Verification requested: ${ev.title}`, href: "/admin/talent", category: "Talent" })),
      [db.insert(verificationRequests).values({ id: rid, evidenceId: id, ownerId: user.userId, status: "SUBMITTED", note, createdAt: now, updatedAt: now }), db.update(talentEvidence).set({ status: "Submitted" }).where(eq(talentEvidence.id, id)), db.insert(auditLog).values(audit(user.userId, "talent.verification.request", rid))]);
  }
  revalidatePath("/workspace/talent");
}
