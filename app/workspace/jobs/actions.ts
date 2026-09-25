"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { auditLog, jobTracks } from "../../../db/schema";

export const statuses = ["Saved", "Applied (self reported)", "Interview (self reported)", "Offer (self reported)", "Rejected", "Withdrawn"] as const;
const field = (form: FormData, key: string, max: number) => {
  const value = String(form.get(key) || "").trim();
  if (value.length > max) throw new Error(`${key} is too long.`);
  return value;
};
const audit = (ownerId: string, action: string, id: string) => ({ id: crypto.randomUUID(), actorId: ownerId, orgId: null, action, resource: "job_track", resourceId: id, decision: "allow" as const, createdAt: new Date() });

export async function createJobTrack(form: FormData) {
  const user = await requireChatGPTUser("/workspace/jobs");
  const roleTitle = field(form, "roleTitle", 120);
  const employer = field(form, "employer", 120);
  const notes = field(form, "notes", 1000);
  const sourceUrl = field(form, "sourceUrl", 500);
  if (!roleTitle || !employer) throw new Error("Role and employer are required.");
  if (sourceUrl) { try { const url = new URL(sourceUrl); if (!["http:", "https:"].includes(url.protocol)) throw new Error(); } catch { throw new Error("Enter a valid http or https link."); } }
  const id = crypto.randomUUID(); const now = new Date(); const db = getDb();
  await db.batch([
    db.insert(jobTracks).values({ id, ownerId: user.userId, roleTitle, employer, notes, sourceUrl, status: "Saved", createdAt: now, updatedAt: now }),
    db.insert(auditLog).values(audit(user.userId, "job_track.create", id)),
  ]);
  revalidatePath("/workspace/jobs");
}

export async function updateJobTrack(form: FormData) {
  const user = await requireChatGPTUser("/workspace/jobs");
  const id = String(form.get("id") || "");
  const status = String(form.get("status") || "");
  if (!/^[0-9a-f-]{36}$/.test(id) || !statuses.includes(status as typeof statuses[number])) throw new Error("Invalid opportunity or status.");
  const db = getDb();
  const found = await db.select({ id: jobTracks.id }).from(jobTracks).where(and(eq(jobTracks.id, id), eq(jobTracks.ownerId, user.userId))).get();
  if (!found) throw new Error("Opportunity unavailable.");
  await db.batch([
    db.update(jobTracks).set({ status, updatedAt: new Date() }).where(and(eq(jobTracks.id, id), eq(jobTracks.ownerId, user.userId))),
    db.insert(auditLog).values(audit(user.userId, "job_track.status", id)),
  ]);
  revalidatePath("/workspace/jobs");
}

export async function removeJobTrack(form: FormData) {
  const user = await requireChatGPTUser("/workspace/jobs");
  const id = String(form.get("id") || "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Opportunity unavailable.");
  const db = getDb();
  const found = await db.select({ id: jobTracks.id }).from(jobTracks).where(and(eq(jobTracks.id, id), eq(jobTracks.ownerId, user.userId))).get();
  if (!found) throw new Error("Opportunity unavailable.");
  await db.batch([
    db.delete(jobTracks).where(and(eq(jobTracks.id, id), eq(jobTracks.ownerId, user.userId))),
    db.insert(auditLog).values(audit(user.userId, "job_track.delete", id)),
  ]);
  revalidatePath("/workspace/jobs");
}
