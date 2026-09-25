// status.digitalburj.com (blueprint Domain 13): component health from live checks
// plus declared incidents and maintenance. No infrastructure detail is exposed.
import { env } from "cloudflare:workers";
import { desc, gt, inArray, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import { incidents, incidentUpdates } from "../db/schema";

export const COMPONENTS = ["Corporate Website", "Academy", "Studio", "Business AI", "Talent", "Jobs", "Identity", "Unified Workspace", "API", "Files", "Billing", "Notifications", "Support"] as const;
export const IMPACTS = ["DEGRADED PERFORMANCE", "PARTIAL OUTAGE", "MAJOR OUTAGE", "MAINTENANCE"] as const;
const RANK: Record<string, number> = { OPERATIONAL: 0, MAINTENANCE: 1, "DEGRADED PERFORMANCE": 2, "PARTIAL OUTAGE": 3, "MAJOR OUTAGE": 4 };
// Components that cannot work without the database or file storage.
const NEEDS_DB = new Set(["Academy", "Studio", "Business AI", "Talent", "Jobs", "Unified Workspace", "API", "Billing", "Notifications", "Support"]);

async function timed<T>(fn: () => Promise<T>) { const t = Date.now(); try { await fn(); return { ok: true, ms: Date.now() - t }; } catch { return { ok: false, ms: Date.now() - t }; } }

export async function liveChecks() {
  const [database, storage] = await Promise.all([
    timed(() => getDb().run(sql`select 1`)),
    timed(async () => { if (!env.BUCKET) throw new Error("no bucket"); await env.BUCKET.list({ limit: 1 }); }),
  ]);
  return { database, storage };
}

export async function componentStatus() {
  const db = getDb();
  const [checks, open, recent] = await Promise.all([
    liveChecks(),
    db.select().from(incidents).where(or(inArray(incidents.status, ["INVESTIGATING", "IDENTIFIED", "MONITORING", "IN_PROGRESS"]), sql`${incidents.status} = 'SCHEDULED' AND ${incidents.startsAt} <= ${Date.now()}`)).catch(() => []),
    db.select().from(incidents).where(gt(incidents.createdAt, new Date(Date.now() - 90 * 86400000))).orderBy(desc(incidents.createdAt)).catch(() => []),
  ]);
  const status = Object.fromEntries(COMPONENTS.map(c => [c, "OPERATIONAL"])) as Record<string, string>;
  const worse = (c: string, s: string) => { if (RANK[s] > RANK[status[c]]) status[c] = s; };
  if (!checks.database.ok) NEEDS_DB.forEach(c => worse(c, "MAJOR OUTAGE"));
  else if (checks.database.ms > 1500) NEEDS_DB.forEach(c => worse(c, "DEGRADED PERFORMANCE"));
  if (!checks.storage.ok) worse("Files", "MAJOR OUTAGE");
  for (const i of open) i.components.split(",").map(s => s.trim()).forEach(c => { if (c in status) worse(c, i.kind === "maintenance" ? "MAINTENANCE" : i.impact); });
  const updates = recent.length ? await db.select().from(incidentUpdates).where(inArray(incidentUpdates.incidentId, recent.map(r => r.id))).orderBy(desc(incidentUpdates.createdAt)).catch(() => []) : [];
  const overall = Object.values(status).reduce((a, b) => RANK[b] > RANK[a] ? b : a, "OPERATIONAL");
  return { status, overall, checks, recent, updates, checkedAt: new Date() };
}
