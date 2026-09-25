"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, leads } from "../../../db/schema";
import { auditRow, oneOf, requireStaff, uuid } from "../../../lib/platform";

export async function updateLeadStatus(form: FormData) {
  const { user } = await requireStaff("leads", "lead.status");
  const id = uuid(form, "id");
  const status = oneOf(form, "status", ["New", "Contacted", "Routed", "Closed"] as const, "status");
  const db = getDb();
  await db.batch([db.update(leads).set({ status }).where(eq(leads.id, id)), db.insert(auditLog).values(auditRow(user, null, "lead.status", "lead", id, "allow", status))]);
  revalidatePath("/admin/leads");
}
