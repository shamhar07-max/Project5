// Shared platform services (blueprint Part II): staff roles, organization
// permissions, audit, domain events → notifications + signed webhooks.
import { and, eq, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../db";
import { auditLog, domainEvents, memberships, notifications, staffRoles, webhookDeliveries, webhooks } from "../db/schema";
import { getChatGPTUser, requireChatGPTUser, type ChatGPTUser } from "../app/chatgpt-auth";

type Db = ReturnType<typeof getDb>;

// ─── Staff roles (Domain 09 privileged role model) ───
export const STAFF_ROLES = {
  super_admin: "Super Admin",
  platform_admin: "Platform Admin",
  security_admin: "Security Admin",
  finance_admin: "Finance Admin",
  support_admin: "Support Admin",
  academy_admin: "Academy Admin",
  academy_assessor: "Academy Assessor",
  academy_verifier: "Independent Verifier",
  studio_admin: "Studio Admin",
  business_admin: "Business AI Admin",
  talent_admin: "Talent Admin",
  jobs_admin: "Jobs Admin",
} as const;
export type StaffRole = keyof typeof STAFF_ROLES;

// Admin sections and the roles that may open them. super_admin may open all.
export const ADMIN_SECTIONS = {
  overview: ["platform_admin", "security_admin", "finance_admin", "support_admin", "academy_admin", "academy_assessor", "academy_verifier", "studio_admin", "business_admin", "talent_admin", "jobs_admin"],
  access: ["security_admin"],
  audit: ["security_admin", "platform_admin"],
  academy: ["academy_admin", "academy_assessor", "academy_verifier"],
  studio: ["studio_admin"],
  business: ["business_admin"],
  talent: ["talent_admin"],
  jobs: ["jobs_admin"],
  finance: ["finance_admin"],
  support: ["support_admin"],
  status: ["platform_admin"],
  leads: ["platform_admin", "studio_admin", "business_admin", "academy_admin"],
} as const satisfies Record<string, readonly StaffRole[]>;
export type AdminSection = keyof typeof ADMIN_SECTIONS;

export function bootstrapStaffEmails() {
  return (process.env.DIGITALBURJ_STAFF_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
}

export async function staffRolesFor(email: string): Promise<Set<StaffRole>> {
  const e = email.toLowerCase();
  const roles = new Set<StaffRole>();
  if (bootstrapStaffEmails().includes(e)) roles.add("super_admin");
  try {
    const rows = await getDb().select().from(staffRoles).where(eq(staffRoles.email, e));
    rows.forEach(r => { if (r.role in STAFF_ROLES) roles.add(r.role as StaffRole); });
  } catch { /* table unavailable: fall back to bootstrap roles only */ }
  return roles;
}

export function hasSection(roles: Set<StaffRole>, section: AdminSection) {
  return roles.has("super_admin") || (ADMIN_SECTIONS[section] as readonly StaffRole[]).some(r => roles.has(r));
}

/** Staff context for an admin page. Non-staff get a 404 so the admin area is not discoverable. */
export async function adminContext(section: AdminSection) {
  const user = await requireChatGPTUser(`/admin${section === "overview" ? "" : `/${section}`}`);
  const seen = await (await import("./staff")).touchUser(user);
  if (seen?.suspendedAt) notFound();
  const roles = await staffRolesFor(user.email);
  if (!hasSection(roles, section)) notFound();
  return { user, roles };
}

/** Same check for server actions; also records denied attempts. */
export async function requireStaff(section: AdminSection, action: string) {
  const user = await getChatGPTUser();
  if (!user) throw new Error("Sign in first.");
  const roles = await staffRolesFor(user.email);
  if (!hasSection(roles, section)) {
    await getDb().insert(auditLog).values(auditRow(user, null, action, "admin", null, "deny", "staff_role_required"));
    throw new Error("Your DigitalBurj role does not allow this action.");
  }
  return { user, roles };
}

// ─── Organization roles (Domain 07 §6) ───
export const ORG_ROLES = {
  org_owner: "Owner",
  admin: "Admin",
  member: "Member",
  billing_manager: "Billing Manager",
  learning_manager: "Academy Learning Manager",
  studio_owner: "Studio Client Owner",
  business_owner: "Business AI Owner",
  recruiter: "Recruiter",
  hiring_manager: "Hiring Manager",
  guest: "Guest",
} as const;
export type OrgRole = keyof typeof ORG_ROLES;

const PERMISSIONS = {
  "org.manage": ["org_owner", "admin"],
  "billing.view": ["org_owner", "admin", "billing_manager"],
  "studio.approve": ["org_owner", "admin", "studio_owner"],
  "business.approve": ["org_owner", "admin", "business_owner"],
  "jobs.manage": ["org_owner", "admin", "recruiter", "hiring_manager"],
  "jobs.offer.approve": ["org_owner", "hiring_manager"],
  "learning.manage": ["org_owner", "admin", "learning_manager"],
  "developer.manage": ["org_owner", "admin"],
} as const;
export type Permission = keyof typeof PERMISSIONS;

export function can(role: string, permission: Permission) {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export async function activeMembership(orgId: string, userId: string) {
  return getDb().select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.userId, userId), eq(memberships.status, "active"))).get();
}

/** User ids of active org members who hold a permission; used to route notifications and approvals. */
export async function membersWith(orgId: string, permission: Permission) {
  const roles = PERMISSIONS[permission] as readonly string[];
  const rows = await getDb().select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.status, "active"), inArray(memberships.role, [...roles])));
  return rows.map(r => r.userId).filter((v): v is string => Boolean(v));
}

// ─── Audit ───
export function auditRow(user: Pick<ChatGPTUser, "userId">, orgId: string | null, action: string, resource: string, resourceId: string | null, decision: "allow" | "deny" = "allow", reason?: string) {
  return { id: crypto.randomUUID(), actorId: user.userId, orgId, action, resource, resourceId, decision, reason: reason || null, createdAt: new Date() };
}

// ─── Events, notifications, webhooks ───
export type Notify = { userId: string; title: string; body?: string; href?: string; category: string; priority?: "normal" | "high" | "critical" };
export type DomainEvent = { type: string; actorId: string; orgId: string | null; resourceType: string; resourceId: string; payload?: Record<string, unknown> };

/** Statements to add to a db.batch: the event itself plus one notification per recipient. */
export function eventStatements(db: Db, event: DomainEvent & { id: string }, notify: Notify[] = []) {
  const now = new Date();
  const seen = new Set<string>();
  const unique = notify.filter(n => n.userId && !seen.has(n.userId) && seen.add(n.userId));
  return [
    db.insert(domainEvents).values({ id: event.id, type: event.type, orgId: event.orgId, actorId: event.actorId, resourceType: event.resourceType, resourceId: event.resourceId, payload: JSON.stringify(event.payload ?? {}), createdAt: now }),
    ...unique.map(n => db.insert(notifications).values({ id: crypto.randomUUID(), userId: n.userId, orgId: event.orgId, category: n.category, title: n.title.slice(0, 160), body: (n.body ?? "").slice(0, 500), href: n.href ?? "", priority: n.priority ?? "normal", createdAt: now })),
  ];
}

async function sign(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, "0")).join("");
}

/** Delivers an organization event to its subscribed webhooks (signed, 4s timeout, outcome recorded). */
export async function deliverWebhooks(event: DomainEvent & { id: string }) {
  if (!event.orgId) return;
  const db = getDb();
  const subs = (await db.select().from(webhooks).where(and(eq(webhooks.orgId, event.orgId), eq(webhooks.active, true))))
    .filter(w => w.events.split(",").map(s => s.trim()).some(p => p === "*" || p === event.type || (p.endsWith(".*") && event.type.startsWith(p.slice(0, -1)))));
  for (const w of subs) {
    const body = JSON.stringify({ id: event.id, type: event.type, createdAt: new Date().toISOString(), organizationId: event.orgId, resource: { type: event.resourceType, id: event.resourceId }, data: event.payload ?? {} });
    let status = "failed", httpStatus: number | null = null;
    try {
      const res = await fetch(w.url, { method: "POST", headers: { "content-type": "application/json", "x-digitalburj-event": event.type, "x-digitalburj-signature": `sha256=${await sign(w.secret, body)}` }, body, signal: AbortSignal.timeout(4000) });
      httpStatus = res.status; status = res.ok ? "delivered" : "failed";
    } catch { status = "failed"; }
    await db.insert(webhookDeliveries).values({ id: crypto.randomUUID(), webhookId: w.id, eventId: event.id, status, httpStatus, createdAt: new Date() });
  }
}

/** Convenience: write an event with notifications and audit in one batch, then deliver webhooks. */
export async function publish(event: DomainEvent, notify: Notify[] = [], extra: Parameters<Db["batch"]>[0][number][] = []) {
  const db = getDb();
  const e = { ...event, id: crypto.randomUUID() };
  const stmts = [...extra, ...eventStatements(db, e, notify)];
  await db.batch(stmts as unknown as Parameters<Db["batch"]>[0]);
  try { await deliverWebhooks(e); } catch (err) { console.error("Webhook delivery failed", err); }
  return e.id;
}

// ─── Small validation helpers for server actions ───
export function str(form: FormData, key: string, min: number, max: number, labelText: string) {
  const v = String(form.get(key) ?? "").trim();
  if (v.length < min) throw new Error(min <= 1 ? `${labelText} is required.` : `${labelText} needs at least ${min} characters.`);
  if (v.length > max) throw new Error(`${labelText} must be ${max} characters or fewer.`);
  return v;
}
export function opt(form: FormData, key: string, max: number) { return String(form.get(key) ?? "").trim().slice(0, max); }
export function oneOf<T extends string>(form: FormData, key: string, values: readonly T[], labelText: string): T {
  const v = String(form.get(key) ?? "");
  if (!(values as readonly string[]).includes(v)) throw new Error(`Choose a valid ${labelText}.`);
  return v as T;
}
export function uuid(form: FormData, key: string) {
  const v = String(form.get(key) ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(v)) throw new Error("That item is unavailable.");
  return v;
}
export function readableCode(prefix: string, len = 8) {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return `${prefix}-${Array.from(crypto.getRandomValues(new Uint8Array(len)), b => alphabet[b % alphabet.length]).join("")}`;
}
