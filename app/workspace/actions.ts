"use server";
import { workspaceContext, audit, requireRecordWrite } from "./access";
import { getDb } from "../../db";
import { records, auditLog } from "../../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
const modules = new Set(["academy", "studio", "business", "talent", "jobs"]);
export async function createRecord(formData: FormData) {
  const ctx = await workspaceContext();
  await requireRecordWrite(ctx, "record.create", null);
  const module = String(formData.get("module") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!modules.has(module) || !title || title.length > 120 || description.length > 1000) throw new Error("Check the record details.");
  const id = crypto.randomUUID();
  const db = getDb();
  await db.batch([
    db.insert(records).values({ id, ownerId: ctx.user.userId, orgId: ctx.orgId, module, title, description, createdAt: new Date() }),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: "record.create", resource: "record", resourceId: id, decision: "allow", createdAt: new Date() }),
  ]);
  revalidatePath("/workspace");
}
export async function updateRecord(formData: FormData) {
  const ctx = await workspaceContext();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!["In progress", "Complete"].includes(status)) throw new Error("Invalid status.");
  await requireRecordWrite(ctx, "record.update", id);
  const record = await getDb().select().from(records).where(eq(records.id, id)).get();
  const allowed = record && (ctx.orgId ? record.orgId === ctx.orgId && (record.ownerId === ctx.user.userId || ctx.role === "org_owner") : !record.orgId && record.ownerId === ctx.user.userId);
  if (!allowed) { await audit(ctx, "record.update", id, "deny", "resource_scope"); throw new Error("Record unavailable."); }
  await getDb().update(records).set({ status }).where(eq(records.id, id));
  await audit(ctx, "record.update", id, "allow");
  revalidatePath("/workspace");
}
export async function deleteRecord(formData: FormData) {
  const ctx = await workspaceContext();
  const id = String(formData.get("id") || "");
  await requireRecordWrite(ctx, "record.delete", id);
  const record = await getDb().select().from(records).where(eq(records.id, id)).get();
  const allowed = record && (ctx.orgId ? record.orgId === ctx.orgId && (record.ownerId === ctx.user.userId || ctx.role === "org_owner") : !record.orgId && record.ownerId === ctx.user.userId);
  if (!allowed) { await audit(ctx, "record.delete", id, "deny", "resource_scope"); throw new Error("Record unavailable."); }
  await getDb().delete(records).where(eq(records.id, id));
  await audit(ctx, "record.delete", id, "allow");
  revalidatePath("/workspace");
}
