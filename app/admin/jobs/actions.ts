"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, jobListings } from "../../../db/schema";
import { auditRow, membersWith, publish, requireStaff, str, uuid } from "../../../lib/platform";

/** Moderation: close a listing with a recorded reason (Domain 06 §10). */
export async function moderateListing(form: FormData) {
  const { user } = await requireStaff("jobs", "jobs.listing.moderate");
  const id = uuid(form, "id"); const reason = str(form, "reason", 10, 500, "Reason"); const db = getDb();
  const job = await db.select().from(jobListings).where(eq(jobListings.id, id)).get();
  if (!job) throw new Error("Listing unavailable.");
  const admins = await membersWith(job.orgId, "jobs.manage");
  await publish({ type: "jobs.listing.moderated", actorId: user.userId, orgId: job.orgId, resourceType: "job", resourceId: id, payload: { reason } },
    admins.map(userId => ({ userId, title: `DigitalBurj closed your listing: ${job.title}`, body: reason, href: "/workspace/jobs/employer", category: "Jobs", priority: "high" })),
    [db.update(jobListings).set({ status: "CLOSED" }).where(eq(jobListings.id, id)), db.insert(auditLog).values(auditRow(user, job.orgId, "jobs.listing.moderate", "job", id, "allow", reason))]);
  revalidatePath("/admin/jobs");
}
