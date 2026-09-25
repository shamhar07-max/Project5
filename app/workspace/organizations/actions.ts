"use server";

import { cookies } from "next/headers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { organizations, memberships, auditLog } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { activeMembership, auditRow, can, ORG_ROLES, publish } from "../../../lib/platform";
import { employerVerifications } from "../../../db/schema";

async function currentUser() {
  const user = await getChatGPTUser();
  if (!user) throw new Error("Sign in to manage organizations.");
  return user;
}

export async function createOrganization(formData: FormData) {
  const user = await currentUser();
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2 || name.length > 100) throw new Error("Enter an organization name between 2 and 100 characters.");
  const id = crypto.randomUUID();
  const db = getDb();
  await db.batch([
    db.insert(organizations).values({ id, name, ownerId: user.userId, createdAt: new Date() }),
    db.insert(memberships).values({ id: crypto.randomUUID(), orgId: id, userId: user.userId, email: user.email.toLowerCase(), role: "org_owner", status: "active", createdAt: new Date() }),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: user.userId, orgId: id, action: "organization.create", resource: "organization", resourceId: id, decision: "allow", createdAt: new Date() }),
  ]);
  revalidatePath("/workspace/organizations");
}

export async function inviteMember(formData: FormData) {
  const user = await currentUser();
  const orgId = String(formData.get("orgId") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("Enter a valid email address.");
  const db = getDb();
  const manager = await activeMembership(orgId, user.userId);
  if (!manager || !can(manager.role, "org.manage")) throw new Error("Only an organization owner or admin can invite members.");
  const role = String(formData.get("role") || "member");
  if (!(role in ORG_ROLES) || role === "org_owner" || (role === "admin" && manager.role !== "org_owner")) throw new Error("Choose a role you are allowed to assign.");
  const existing = await db.select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.email, email))).get();
  if (existing) throw new Error("This address already belongs to the organization or has a pending invitation.");
  await db.batch([
    db.insert(memberships).values({ id: crypto.randomUUID(), orgId, userId: null, email, role, status: "invited", createdAt: new Date() }),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: user.userId, orgId, action: "membership.invite", resource: "membership", decision: "allow", createdAt: new Date() }),
  ]);
  revalidatePath("/workspace/organizations");
}

export async function acceptInvitation(formData: FormData) {
  const user = await currentUser();
  const id = String(formData.get("id") || "");
  const db = getDb();
  const invitation = await db.select().from(memberships).where(and(eq(memberships.id, id), eq(memberships.email, user.email.toLowerCase()), eq(memberships.status, "invited"))).get();
  if (!invitation) throw new Error("This invitation is unavailable for your account.");
  await db.batch([
    db.update(memberships).set({ userId: user.userId, status: "active" }).where(eq(memberships.id, invitation.id)),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: user.userId, orgId: invitation.orgId, action: "membership.accept", resource: "membership", resourceId: id, decision: "allow", createdAt: new Date() }),
  ]);
  revalidatePath("/workspace/organizations");
}

export async function switchOrganization(formData: FormData) {
  const user = await currentUser();
  const orgId = String(formData.get("orgId") || "");
  if (orgId) {
    const membership = await getDb().select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.userId, user.userId), eq(memberships.status, "active"))).get();
    if (!membership) throw new Error("You cannot switch to this organization.");
  }
  (await cookies()).set("db_org", orgId, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/workspace");
  revalidatePath("/workspace/organizations");
}

/** Owners and admins change roles. Only an owner can grant admin; there must always be one owner. */
export async function changeRole(formData: FormData) {
  const user = await currentUser();
  const id = String(formData.get("membershipId") || "");
  const role = String(formData.get("role") || "");
  const db = getDb();
  const target = await db.select().from(memberships).where(eq(memberships.id, id)).get();
  if (!target) throw new Error("Member unavailable.");
  const manager = await activeMembership(target.orgId, user.userId);
  if (!manager || !can(manager.role, "org.manage")) throw new Error("Only an owner or admin can change roles.");
  if (!(role in ORG_ROLES)) throw new Error("Choose a valid role.");
  if ((role === "org_owner" || role === "admin" || target.role === "org_owner" || target.role === "admin") && manager.role !== "org_owner") throw new Error("Only an owner can grant or change owner and admin roles.");
  if (target.role === "org_owner" && role !== "org_owner") {
    const owners = (await db.select().from(memberships).where(and(eq(memberships.orgId, target.orgId), eq(memberships.role, "org_owner"), eq(memberships.status, "active")))).length;
    if (owners <= 1) throw new Error("An organization needs at least one owner.");
  }
  await publish({ type: "organization.role.changed", actorId: user.userId, orgId: target.orgId, resourceType: "membership", resourceId: target.id, payload: { email: target.email, from: target.role, to: role } },
    target.userId ? [{ userId: target.userId, title: `Your role is now ${ORG_ROLES[role as keyof typeof ORG_ROLES]}`, href: "/workspace/organizations", category: "Organization", priority: "high" }] : [],
    [db.update(memberships).set({ role }).where(eq(memberships.id, target.id)), db.insert(auditLog).values(auditRow(user, target.orgId, "membership.role.change", "membership", target.id, "allow", `${target.role}→${role}`))]);
  revalidatePath("/workspace", "layout");
}

export async function removeMember(formData: FormData) {
  const user = await currentUser();
  const id = String(formData.get("membershipId") || "");
  const db = getDb();
  const target = await db.select().from(memberships).where(eq(memberships.id, id)).get();
  if (!target) throw new Error("Member unavailable.");
  const manager = await activeMembership(target.orgId, user.userId);
  if (!manager || !can(manager.role, "org.manage")) throw new Error("Only an owner or admin can remove members.");
  if (target.role === "org_owner") throw new Error("Transfer ownership before removing an owner.");
  if (target.role === "admin" && manager.role !== "org_owner") throw new Error("Only an owner can remove an admin.");
  await db.batch([db.delete(memberships).where(eq(memberships.id, target.id)), db.insert(auditLog).values(auditRow(user, target.orgId, "membership.remove", "membership", target.id, "allow", target.email))]);
  revalidatePath("/workspace", "layout");
}

/** An organization asks DigitalBurj to verify it as an employer (Domain 06 §5 Company Verification). */
export async function requestEmployerVerification(formData: FormData) {
  const user = await currentUser();
  const orgId = String(formData.get("orgId") || "");
  const manager = await activeMembership(orgId, user.userId);
  if (!manager || !can(manager.role, "org.manage")) throw new Error("Only an owner or admin can request verification.");
  const companyName = String(formData.get("companyName") || "").trim().slice(0, 120);
  const website = String(formData.get("website") || "").trim().slice(0, 200);
  const registration = String(formData.get("registration") || "").trim().slice(0, 120);
  if (companyName.length < 2) throw new Error("Enter the registered company name.");
  if (website && !/^https:\/\/[^\s]+\.[^\s]+$/.test(website)) throw new Error("Enter the company website as an https:// address.");
  const db = getDb(); const now = new Date();
  await db.batch([
    db.insert(employerVerifications).values({ orgId, status: "PENDING", companyName, website, registration, requestedBy: user.userId, createdAt: now, updatedAt: now })
      .onConflictDoUpdate({ target: employerVerifications.orgId, set: { status: "PENDING", companyName, website, registration, requestedBy: user.userId, updatedAt: now } }),
    db.insert(auditLog).values(auditRow(user, orgId, "employer.verification.request", "organization", orgId)),
  ]);
  revalidatePath("/workspace/organizations");
}
