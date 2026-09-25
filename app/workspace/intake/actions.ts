"use server";
import { getDb } from "../../../db";
import { enquiries, auditLog } from "../../../db/schema";
import { workspaceContext } from "../access";
import { revalidatePath } from "next/cache";

export async function submitEnquiry(formData: FormData) {
  const ctx = await workspaceContext();
  if (ctx.role === "guest") throw new Error("Your organization role cannot submit an enquiry.");
  const service = String(formData.get("service") || "");
  if (!["studio", "business"].includes(service)) throw new Error("Choose a valid service.");
  const projectName = String(formData.get("projectName") || "").trim();
  const problem = String(formData.get("problem") || "").trim();
  if (projectName.length < 2 || projectName.length > 120 || problem.length < 20 || problem.length > 3000) throw new Error("Enter a project name and describe the problem in at least 20 characters.");
  const field = (key: string, max: number) => String(formData.get(key) || "").trim().slice(0, max);
  const id = crypto.randomUUID();
  const db = getDb();
  await db.batch([
    db.insert(enquiries).values({ id, ownerId: ctx.user.userId, orgId: ctx.orgId, service, projectName, problem, audience: field("audience", 500), currentState: field("currentState", 500), desiredOutcome: field("desiredOutcome", 1000), budget: field("budget", 120), timeline: field("timeline", 120), createdAt: new Date() }),
    db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: `${service}.enquiry.create`, resource: "enquiry", resourceId: id, decision: "allow", createdAt: new Date() }),
  ]);
  revalidatePath("/workspace/intake");
}
