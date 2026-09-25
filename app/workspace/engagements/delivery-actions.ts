"use server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, changeRequests, engagementEvents, engagements } from "../../../db/schema";
import { auditRow, publish, str, uuid } from "../../../lib/platform";
import { staffIdsWith } from "../../../lib/staff";
import { workspaceContext } from "../access";

export async function submitChangeRequest(form: FormData) {
  const ctx = await workspaceContext();
  if (ctx.role === "guest") throw new Error("Your role cannot request changes.");
  const id = uuid(form, "engagementId");
  const db = getDb();
  const eng = await db.select().from(engagements).where(and(eq(engagements.id, id), ctx.orgId ? eq(engagements.orgId, ctx.orgId) : and(eq(engagements.ownerId, ctx.user.userId), isNull(engagements.orgId)))).get();
  if (!eng) throw new Error("Engagement unavailable in this workspace.");
  if (eng.stage === "Draft") throw new Error("Request discovery before asking for changes.");
  const title = str(form, "title", 4, 140, "Change");
  const crId = crypto.randomUUID(); const now = new Date();
  const staff = await staffIdsWith([eng.service === "studio" ? "studio_admin" : "business_admin"]);
  await publish({ type: `${eng.service}.change_request.submitted`, actorId: ctx.user.userId, orgId: eng.orgId, resourceType: "change_request", resourceId: crId, payload: { title } },
    staff.map(userId => ({ userId, title: `Change request on ${eng.title}: ${title}`, href: `/admin/engagements/${eng.id}`, category: eng.service === "studio" ? "Studio" : "Business AI" })),
    [db.insert(changeRequests).values({ id: crId, engagementId: eng.id, title, reason: str(form, "reason", 10, 2000, "Reason"), status: "SUBMITTED", requestedBy: ctx.user.userId, createdAt: now, updatedAt: now }),
     db.insert(engagementEvents).values({ id: crypto.randomUUID(), engagementId: eng.id, actorId: ctx.user.userId, action: "change_request.submitted", detail: title, createdAt: now }),
     db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "change_request.submit", "change_request", crId))]);
  revalidatePath(`/workspace/engagements/${eng.id}`);
}
