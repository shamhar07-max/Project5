"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { auditLog, talentEvidence, talentProfiles } from "../../../db/schema";

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
