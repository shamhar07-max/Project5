"use server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../db";
import { approvals, auditLog, jobApplications, notifications, offers, supportTickets, ticketMeta, userPreferences } from "../../db/schema";
import { decisionEffects } from "../../lib/approvals";
import { auditRow, can, publish, str, opt, uuid } from "../../lib/platform";
import { workspaceContext } from "./access";

export async function markNotificationRead(form: FormData) {
  const ctx = await workspaceContext();
  const id = uuid(form, "id");
  await getDb().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.userId, ctx.user.userId)));
  revalidatePath("/workspace", "layout");
}

export async function markAllNotificationsRead() {
  const ctx = await workspaceContext();
  await getDb().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.userId, ctx.user.userId), isNull(notifications.readAt)));
  revalidatePath("/workspace", "layout");
}

/** Approve or reject from the universal approval center. Authorization is re-derived from the approval scope. */
export async function decideApproval(form: FormData) {
  const ctx = await workspaceContext();
  const id = uuid(form, "id");
  const approve = form.get("decision") === "approve";
  const note = opt(form, "note", 500);
  if (!approve && note.length < 5) throw new Error("Add a short reason when you reject so the team knows what to change.");
  const db = getDb();
  const a = await db.select().from(approvals).where(eq(approvals.id, id)).get();
  if (!a || a.status !== "pending") throw new Error("This approval is no longer pending.");
  const allowed = a.orgId
    ? a.orgId === ctx.orgId && (a.approverScope === "org.manage" ? can(ctx.role, "org.manage") : can(ctx.role, a.approverScope as Parameters<typeof can>[1]))
    : a.ownerId === ctx.user.userId && !ctx.orgId;
  if (!allowed) {
    await db.insert(auditLog).values(auditRow(ctx.user, ctx.orgId, "approval.decide", "approval", id, "deny", "not_authorized"));
    throw new Error("Your role cannot decide this approval.");
  }
  const effects = await decisionEffects(db, a, approve, ctx.user.userId, note);
  const extraNotify: { userId: string; title: string; href: string; category: string; priority: "high" }[] = [];
  if (a.resourceType === "offer" && approve) {
    const o = await db.select().from(offers).where(eq(offers.id, a.resourceId)).get();
    const app = o && await db.select().from(jobApplications).where(eq(jobApplications.id, o.applicationId)).get();
    if (app) extraNotify.push({ userId: app.candidateId, title: "You have received a job offer", href: "/workspace/jobs/applications", category: "Jobs", priority: "high" });
  }
  await publish(
    { type: `approval.${approve ? "approved" : "rejected"}`, actorId: ctx.user.userId, orgId: a.orgId, resourceType: a.resourceType, resourceId: a.resourceId, payload: { approvalId: a.id, title: a.title, note } },
    [{ userId: a.requestedBy, title: `${approve ? "Approved" : "Changes requested"}: ${a.title}`, body: note, href: a.resourceType === "offer" ? "/workspace/jobs/employer" : a.division === "Business AI" ? "/admin/business" : "/admin/studio", category: a.division, priority: "high" }, ...extraNotify],
    [...effects as never[], db.insert(auditLog).values(auditRow(ctx.user, a.orgId, `approval.${approve ? "approve" : "reject"}`, "approval", a.id))],
  );
  revalidatePath("/workspace", "layout");
}

export async function savePreferences(form: FormData) {
  const ctx = await workspaceContext();
  const values = {
    displayName: opt(form, "displayName", 80),
    locale: ["en", "ar"].includes(String(form.get("locale"))) ? String(form.get("locale")) : "en",
    emailNotifications: form.get("emailNotifications") === "on",
    productUpdates: form.get("productUpdates") === "on",
    researchConsent: form.get("researchConsent") === "on",
    updatedAt: new Date(),
  };
  const db = getDb();
  await db.batch([
    db.insert(userPreferences).values({ userId: ctx.user.userId, ...values }).onConflictDoUpdate({ target: userPreferences.userId, set: values }),
    db.insert(auditLog).values(auditRow(ctx.user, null, "account.privacy.update", "account", ctx.user.userId)),
  ]);
  revalidatePath("/workspace", "layout");
}

/** Deletion is a governed request, not an instant wipe: it opens a tracked privacy ticket. */
export async function requestDeletion(form: FormData) {
  const ctx = await workspaceContext();
  const reason = str(form, "reason", 5, 1000, "Reason");
  const db = getDb(); const id = crypto.randomUUID(); const now = new Date();
  await db.batch([
    db.insert(supportTickets).values({ id, ownerId: ctx.user.userId, orgId: null, topic: "Privacy: account deletion request", message: reason, status: "Open", createdAt: now }),
    db.insert(ticketMeta).values({ ticketId: id, division: "Platform", priority: "high", workflow: "NEW", updatedAt: now }),
    db.insert(auditLog).values(auditRow(ctx.user, null, "account.deletion.request", "account", ctx.user.userId)),
  ]);
  revalidatePath("/workspace/support");
}
