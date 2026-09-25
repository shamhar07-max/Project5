"use server";

import { cookies } from "next/headers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { organizations, memberships, auditLog } from "../../../db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
  const owner = await db.select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.userId, user.userId), eq(memberships.role, "org_owner"), eq(memberships.status, "active"))).get();
  if (!owner) throw new Error("Only an organization owner can invite members.");
  const existing = await db.select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.email, email))).get();
  if (existing) throw new Error("This address already belongs to the organization or has a pending invitation.");
  await db.batch([
    db.insert(memberships).values({ id: crypto.randomUUID(), orgId, userId: null, email, role: "member", status: "invited", createdAt: new Date() }),
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
