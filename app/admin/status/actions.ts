"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { auditLog, incidentUpdates, incidents } from "../../../db/schema";
import { auditRow, oneOf, publish, requireStaff, str, uuid } from "../../../lib/platform";
import { COMPONENTS, IMPACTS } from "../../../lib/status";
import { assertTransition } from "../../../lib/workflow";

export async function declareIncident(form: FormData) {
  const { user } = await requireStaff("status", "status.incident.create");
  const kind = oneOf(form, "kind", ["incident", "maintenance"] as const, "type");
  const components = COMPONENTS.filter(c => form.get(`c:${c}`) === "on");
  if (!components.length) throw new Error("Choose the affected components.");
  const start = String(form.get("startsAt") || "");
  const startsAt = kind === "maintenance" && start ? new Date(start) : new Date();
  if (Number.isNaN(startsAt.getTime())) throw new Error("Enter a valid start time.");
  const status = kind === "maintenance" ? (startsAt.getTime() > Date.now() ? "SCHEDULED" : "IN_PROGRESS") : "INVESTIGATING";
  const id = crypto.randomUUID(); const db = getDb(); const now = new Date();
  await publish({ type: `status.${kind}.created`, actorId: user.userId, orgId: null, resourceType: "incident", resourceId: id, payload: { components } }, [],
    [db.insert(incidents).values({ id, title: str(form, "title", 5, 140, "Title"), kind, status, impact: kind === "maintenance" ? "MAINTENANCE" : oneOf(form, "impact", IMPACTS.filter(i => i !== "MAINTENANCE"), "impact"), components: components.join(", "), startsAt, createdBy: user.userId, createdAt: now }),
     db.insert(incidentUpdates).values({ id: crypto.randomUUID(), incidentId: id, status, body: str(form, "body", 10, 1000, "First update"), createdBy: user.userId, createdAt: now }),
     db.insert(auditLog).values(auditRow(user, null, `status.${kind}.create`, "incident", id))]);
  revalidatePath("/admin/status"); revalidatePath("/status");
}

export async function postUpdate(form: FormData) {
  const { user } = await requireStaff("status", "status.incident.update");
  const id = uuid(form, "id"); const db = getDb();
  const i = await db.select().from(incidents).where(eq(incidents.id, id)).get();
  if (!i) throw new Error("Incident unavailable.");
  const to = String(form.get("status") || i.status);
  if (to !== i.status) assertTransition("incident", i.status, to);
  const done = ["RESOLVED", "COMPLETED"].includes(to);
  await db.batch([
    db.update(incidents).set({ status: to, ...(done ? { resolvedAt: new Date() } : {}) }).where(eq(incidents.id, id)),
    db.insert(incidentUpdates).values({ id: crypto.randomUUID(), incidentId: id, status: to, body: str(form, "body", 5, 1000, "Update"), createdBy: user.userId, createdAt: new Date() }),
    db.insert(auditLog).values(auditRow(user, null, "status.incident.update", "incident", id, "allow", to)),
  ]);
  revalidatePath("/admin/status"); revalidatePath("/status");
}
