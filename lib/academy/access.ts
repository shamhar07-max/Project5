// Entitlement decisions for Academy accounts. The only source of paid access is an
// active, unexpired entitlement row; everyone else is treated as Explorer.
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../../db";
import { academyActivity, academyEntitlements } from "../../db/schema";
import { isPlanId, planById, type Plan } from "./plans";

export type Access = {
  plan: Plan;
  entitlement: typeof academyEntitlements.$inferSelect | null;
  daysLeft: number | null;
};

export async function accessFor(accountId: string): Promise<Access> {
  const rows = await getDb().select().from(academyEntitlements)
    .where(and(eq(academyEntitlements.accountId, accountId), eq(academyEntitlements.status, "active")))
    .orderBy(desc(academyEntitlements.createdAt));
  const now = Date.now();
  const live = rows.find(r => !r.endsAt || r.endsAt.getTime() > now);
  if (!live || !isPlanId(live.plan)) return { plan: planById.explorer, entitlement: null, daysLeft: null };
  return {
    plan: planById[live.plan],
    entitlement: live,
    daysLeft: live.endsAt ? Math.max(0, Math.ceil((live.endsAt.getTime() - now) / 86_400_000)) : null,
  };
}

/** Activates a plan, superseding whatever was active before. */
export async function grantPlan(accountId: string, plan: Plan, source: string, orderId: string | null, days: number | null) {
  const db = getDb(); const now = new Date();
  await db.update(academyEntitlements).set({ status: "superseded" })
    .where(and(eq(academyEntitlements.accountId, accountId), eq(academyEntitlements.status, "active")));
  await db.insert(academyEntitlements).values({
    id: crypto.randomUUID(), accountId, plan: plan.id, orderId, status: "active", source,
    startsAt: now, endsAt: days ? new Date(now.getTime() + days * 86_400_000) : null, createdAt: now,
  });
}

export async function logActivity(accountId: string, kind: string, detail: string) {
  await getDb().insert(academyActivity).values({ id: crypto.randomUUID(), accountId, kind, detail: detail.slice(0, 200), createdAt: new Date() }).catch(() => undefined);
}
