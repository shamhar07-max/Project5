// Loads everything the signed-in shell needs in one place: resolved context,
// unread notifications, pending approvals and staff status.
import { and, count, eq, isNull, or } from "drizzle-orm";
import { getDb } from "../../db";
import { approvals, notifications, organizations, userPreferences } from "../../db/schema";
import { workspaceContext } from "../workspace/access";
import { ORG_ROLES, staffRolesFor, can, type OrgRole } from "../../lib/platform";
import type { ShellInfo } from "./kit";

export type AppCtx = Awaited<ReturnType<typeof workspaceContext>> & { orgName: string | null };

/** Approvals visible to this user: personal ones they own, or org ones their role can decide. */
export function approvalScope(ctx: Awaited<ReturnType<typeof workspaceContext>>) {
  if (!ctx.orgId) return and(isNull(approvals.orgId), eq(approvals.ownerId, ctx.user.userId));
  const scopes: string[] = [];
  if (can(ctx.role, "studio.approve")) scopes.push("studio.approve");
  if (can(ctx.role, "business.approve")) scopes.push("business.approve");
  if (can(ctx.role, "jobs.offer.approve")) scopes.push("jobs.offer.approve");
  if (can(ctx.role, "org.manage")) scopes.push("org.manage");
  return and(eq(approvals.orgId, ctx.orgId), or(...(scopes.length ? scopes : ["none"]).map(s => eq(approvals.approverScope, s))));
}

export async function loadApp(): Promise<{ ctx: AppCtx; info: ShellInfo }> {
  const base = await workspaceContext();
  const db = getDb();
  const [org, unread, pending, prefs, roles] = await Promise.all([
    base.orgId ? db.select().from(organizations).where(eq(organizations.id, base.orgId)).get() : Promise.resolve(undefined),
    db.select({ n: count() }).from(notifications).where(and(eq(notifications.userId, base.user.userId), isNull(notifications.readAt))).get().catch(() => ({ n: 0 })),
    db.select({ n: count() }).from(approvals).where(and(approvalScope(base), eq(approvals.status, "pending"))).get().catch(() => ({ n: 0 })),
    db.select().from(userPreferences).where(eq(userPreferences.userId, base.user.userId)).get().catch(() => undefined),
    staffRolesFor(base.user.email),
  ]);
  const ctx: AppCtx = { ...base, orgName: org?.name ?? null };
  return {
    ctx,
    info: {
      name: prefs?.displayName || base.user.fullName || base.user.email.split("@")[0],
      email: base.user.email,
      context: org?.name ?? "Personal workspace",
      role: base.orgId ? (ORG_ROLES[base.role as OrgRole] ?? base.role) : "Individual",
      unread: unread?.n ?? 0,
      pendingApprovals: pending?.n ?? 0,
      staff: roles.size > 0,
    },
  };
}
