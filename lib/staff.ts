// Resolves DigitalBurj staff to user ids for routing notifications. Staff roles are
// keyed by email; the user directory maps each signed-in email to its user id.
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../db";
import { staffRoles, userDirectory } from "../db/schema";
import { bootstrapStaffEmails, type StaffRole } from "./platform";
import type { ChatGPTUser } from "../app/chatgpt-auth";

export async function staffIdsWith(roles: StaffRole[]) {
  const db = getDb();
  const rows = await db.select().from(staffRoles).where(inArray(staffRoles.role, [...roles, "super_admin"])).catch(() => []);
  const emails = [...new Set([...rows.map(r => r.email), ...bootstrapStaffEmails()])];
  if (!emails.length) return [];
  const users = await db.select().from(userDirectory).where(inArray(userDirectory.email, emails)).catch(() => []);
  return users.filter(u => !u.suspendedAt).map(u => u.userId);
}

/** Records that this person signed in; cheap upsert, at most once per 10 minutes per user. */
export async function touchUser(user: ChatGPTUser) {
  const db = getDb(); const now = new Date();
  const row = await db.select().from(userDirectory).where(eq(userDirectory.userId, user.userId)).get().catch(() => undefined);
  if (row && now.getTime() - row.lastSeenAt.getTime() < 10 * 60 * 1000 && row.email === user.email.toLowerCase()) return row;
  await db.insert(userDirectory).values({ userId: user.userId, email: user.email.toLowerCase(), name: user.fullName ?? "", firstSeenAt: now, lastSeenAt: now })
    .onConflictDoUpdate({ target: userDirectory.userId, set: { email: user.email.toLowerCase(), name: user.fullName ?? row?.name ?? "", lastSeenAt: now } }).catch(() => undefined);
  return row;
}
