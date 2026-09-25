"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, staffRoles, userDirectory } from "../../../db/schema";
import { auditRow, requireStaff, str, STAFF_ROLES, type StaffRole } from "../../../lib/platform";

export async function grantRole(form: FormData) {
  const { user, roles } = await requireStaff("access", "staff.role.grant");
  const email = str(form, "email", 5, 254, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
  const role = String(form.get("role") || "") as StaffRole;
  if (!(role in STAFF_ROLES)) throw new Error("Choose a role.");
  if (role === "super_admin" && !roles.has("super_admin")) throw new Error("Only a Super Admin can grant Super Admin.");
  const reason = str(form, "reason", 5, 300, "Reason");
  const db = getDb();
  await db.batch([
    db.insert(staffRoles).values({ id: crypto.randomUUID(), email, role, grantedBy: user.userId, createdAt: new Date() }).onConflictDoNothing(),
    db.insert(auditLog).values(auditRow(user, null, "staff.role.grant", "staff_role", email, "allow", `${role}: ${reason}`)),
  ]);
  revalidatePath("/admin/access");
}

export async function revokeRole(form: FormData) {
  const { user, roles } = await requireStaff("access", "staff.role.revoke");
  const id = String(form.get("id") || ""); const reason = str(form, "reason", 5, 300, "Reason");
  const db = getDb();
  const r = await db.select().from(staffRoles).where(eq(staffRoles.id, id)).get();
  if (!r) throw new Error("Role unavailable.");
  if (r.role === "super_admin" && !roles.has("super_admin")) throw new Error("Only a Super Admin can revoke Super Admin.");
  if (r.email === user.email.toLowerCase() && ["super_admin", "security_admin"].includes(r.role)) throw new Error("Ask another admin to remove your own access roles.");
  await db.batch([db.delete(staffRoles).where(eq(staffRoles.id, id)), db.insert(auditLog).values(auditRow(user, null, "staff.role.revoke", "staff_role", r.email, "allow", `${r.role}: ${reason}`))]);
  revalidatePath("/admin/access");
}

/** Suspension requires a reason and is reversible (Domain 09 §6 admin UX safeguards). */
export async function setSuspension(form: FormData) {
  const { user } = await requireStaff("access", "user.suspend");
  const id = String(form.get("userId") || "");
  const suspend = form.get("suspend") === "1";
  const reason = str(form, "reason", 5, 300, "Reason");
  if (id === user.userId) throw new Error("You cannot suspend yourself.");
  const db = getDb();
  await db.batch([
    db.update(userDirectory).set(suspend ? { suspendedAt: new Date(), suspendedReason: reason } : { suspendedAt: null, suspendedReason: "" }).where(and(eq(userDirectory.userId, id))),
    db.insert(auditLog).values(auditRow(user, null, suspend ? "user.suspend" : "user.reinstate", "user", id, "allow", reason)),
  ]);
  revalidatePath("/admin/access");
}
