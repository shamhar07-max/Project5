import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { employerVerifications, memberships } from "../db/schema";

/** True when the user is an active member of an organization DigitalBurj verified as an employer. */
export async function verifiedEmployerOrg(userId: string, orgId: string | null) {
  if (!orgId) return false;
  const db = getDb();
  const [m, v] = await Promise.all([
    db.select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.userId, userId), eq(memberships.status, "active"))).get(),
    db.select().from(employerVerifications).where(eq(employerVerifications.orgId, orgId)).get(),
  ]);
  return Boolean(m && v?.status === "VERIFIED");
}
