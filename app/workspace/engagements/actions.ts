"use server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "../../../db";
import { auditLog, enquiries, engagements, engagementEntries, engagementEvents } from "../../../db/schema";
import { engagementKinds, validateEntry } from "../../../lib/engagement-workflow";
import { workspaceContext } from "../access";

type Context = Awaited<ReturnType<typeof workspaceContext>>;
const scope = (ctx: Context) => ctx.orgId ? eq(engagements.orgId, ctx.orgId) : and(eq(engagements.ownerId, ctx.user.userId), isNull(engagements.orgId));
async function scopedEngagement(ctx: Context, id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Working brief unavailable.");
  const item = await getDb().select().from(engagements).where(and(eq(engagements.id, id), scope(ctx))).get();
  if (!item) throw new Error("Working brief unavailable in this workspace.");
  return item;
}
const auditValue = (ctx: Context, action: string, resourceId: string) => ({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action, resource: "engagement", resourceId, decision: "allow" as const, createdAt: new Date() });

export async function startEngagement(formData: FormData) {
  const ctx = await workspaceContext();
  if (ctx.role === "guest") throw new Error("Your role cannot create a working brief.");
  const enquiryId = String(formData.get("enquiryId") || "");
  const db = getDb();
  const enquiry = await db.select().from(enquiries).where(and(eq(enquiries.id, enquiryId), ctx.orgId ? eq(enquiries.orgId, ctx.orgId) : and(eq(enquiries.ownerId, ctx.user.userId), isNull(enquiries.orgId)))).get();
  if (!enquiry || !["studio", "business"].includes(enquiry.service)) throw new Error("Choose one of your Studio or Business AI enquiries.");
  const existing = await db.select().from(engagements).where(eq(engagements.enquiryId, enquiry.id)).get();
  if (existing) redirect(`/workspace/engagements/${existing.id}`);
  const id = crypto.randomUUID(); const now = new Date();
  await db.batch([
    db.insert(engagements).values({ id, enquiryId: enquiry.id, ownerId: ctx.user.userId, orgId: ctx.orgId, service: enquiry.service, title: enquiry.projectName, stage: "Draft", createdAt: now, updatedAt: now }),
    db.insert(engagementEvents).values({ id: crypto.randomUUID(), engagementId: id, actorId: ctx.user.userId, action: "brief.created", detail: "Client working brief opened from enquiry", createdAt: now }),
    db.insert(auditLog).values(auditValue(ctx, "engagement.create", id)),
  ]);
  revalidatePath("/workspace/engagements");
  redirect(`/workspace/engagements/${id}`);
}

export async function addEngagementEntry(formData: FormData) {
  const ctx = await workspaceContext();
  if (ctx.role === "guest") throw new Error("Your role cannot edit this working brief.");
  const engagementId = String(formData.get("engagementId") || "");
  const item = await scopedEngagement(ctx, engagementId);
  if (item.stage !== "Draft") throw new Error("This brief was sent for discovery. Start a new enquiry for additional scope.");
  const field = (key: string) => String(formData.get(key) || "").trim();
  const input = { kind: field("kind"), title: field("title"), detail: field("detail"), evidence: field("evidence"), measurement: field("measurement"), measurementBasis: field("measurementBasis") };
  validateEntry(item.service as keyof typeof engagementKinds, input);
  const db = getDb(); const id = crypto.randomUUID(); const now = new Date();
  await db.batch([
    db.insert(engagementEntries).values({ id, engagementId, authorId: ctx.user.userId, ...input, createdAt: now }),
    db.insert(engagementEvents).values({ id: crypto.randomUUID(), engagementId, actorId: ctx.user.userId, action: "entry.added", detail: input.kind, createdAt: now }),
    db.update(engagements).set({ updatedAt: now }).where(and(eq(engagements.id, engagementId), scope(ctx), eq(engagements.stage, "Draft"))),
    db.insert(auditLog).values(auditValue(ctx, "engagement.entry.create", id)),
  ]);
  revalidatePath(`/workspace/engagements/${engagementId}`);
}

export async function requestDiscovery(formData: FormData) {
  const ctx = await workspaceContext();
  if (ctx.role === "guest") throw new Error("Your role cannot submit this working brief.");
  const id = String(formData.get("engagementId") || "");
  const item = await scopedEngagement(ctx, id);
  if (item.stage !== "Draft") return;
  const db = getDb();
  const entries = await db.select({ id: engagementEntries.id }).from(engagementEntries).where(eq(engagementEntries.engagementId, id)).limit(1);
  if (!entries.length) throw new Error("Add at least one discovery entry first.");
  const now = new Date();
  await db.batch([
    db.update(engagements).set({ stage: "Discovery requested", updatedAt: now }).where(and(eq(engagements.id, id), scope(ctx), eq(engagements.stage, "Draft"))),
    db.insert(engagementEvents).values({ id: crypto.randomUUID(), engagementId: id, actorId: ctx.user.userId, action: "discovery.requested", detail: "Client submitted working brief; no project approval implied", createdAt: now }),
    db.insert(auditLog).values(auditValue(ctx, "engagement.discovery.request", id)),
  ]);
  revalidatePath(`/workspace/engagements/${id}`);
  revalidatePath("/workspace/engagements");
}
