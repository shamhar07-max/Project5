// Universal approval center (blueprint Part II §8). An approval is created by the
// domain that needs a decision; deciding it applies the domain transition here, on
// the server, in the same batch as the approval update.
import { and, eq } from "drizzle-orm";
import { getDb } from "../db";
import { approvals, automations, changeRequests, engagementEvents, milestones, offers, jobApplications, applicationEvents } from "../db/schema";
import { assertTransition } from "./workflow";

type Db = ReturnType<typeof getDb>;
type Approval = typeof approvals.$inferSelect;

export type ApprovalKind = "milestone" | "change_request" | "automation.design" | "automation.golive" | "offer";

export function newApproval(input: { kind: ApprovalKind; division: string; orgId: string | null; ownerId: string; approverScope: string; resourceId: string; title: string; detail?: string; requestedBy: string }) {
  return { id: crypto.randomUUID(), division: input.division, orgId: input.orgId, ownerId: input.ownerId, approverScope: input.approverScope, resourceType: input.kind, resourceId: input.resourceId, title: input.title.slice(0, 160), detail: (input.detail ?? "").slice(0, 1000), status: "pending", requestedBy: input.requestedBy, decisionNote: "", createdAt: new Date() };
}

/** Domain statements that make an approve/reject decision take effect. */
export async function decisionEffects(db: Db, a: Approval, approve: boolean, actorId: string, note: string) {
  const now = new Date();
  const stmts: unknown[] = [];
  const logEngagement = (engagementId: string, action: string, detail: string) => stmts.push(db.insert(engagementEvents).values({ id: crypto.randomUUID(), engagementId, actorId, action, detail, createdAt: now }));
  switch (a.resourceType as ApprovalKind) {
    case "milestone": {
      const m = await db.select().from(milestones).where(eq(milestones.id, a.resourceId)).get();
      if (!m) throw new Error("The milestone no longer exists.");
      const to = approve ? "APPROVED" : "CHANGES_REQUESTED";
      assertTransition("milestone", m.status, to);
      stmts.push(db.update(milestones).set({ status: to, updatedAt: now }).where(eq(milestones.id, m.id)));
      logEngagement(m.engagementId, approve ? "milestone.approved" : "milestone.changes_requested", `${m.title}${note ? ` — ${note}` : ""}`);
      break;
    }
    case "change_request": {
      const c = await db.select().from(changeRequests).where(eq(changeRequests.id, a.resourceId)).get();
      if (!c) throw new Error("The change request no longer exists.");
      const to = approve ? "APPROVED" : "DECLINED";
      assertTransition("changeRequest", c.status, to);
      stmts.push(db.update(changeRequests).set({ status: to, updatedAt: now }).where(eq(changeRequests.id, c.id)));
      logEngagement(c.engagementId, approve ? "change_request.approved" : "change_request.declined", c.title);
      break;
    }
    case "automation.design":
    case "automation.golive": {
      const au = await db.select().from(automations).where(eq(automations.id, a.resourceId)).get();
      if (!au) throw new Error("The automation no longer exists.");
      if (approve) {
        const to = a.resourceType === "automation.design" ? "APPROVED" : "LIVE";
        if (to === "LIVE" && au.riskLevel === "CRITICAL") throw new Error("Critical-risk automations cannot run autonomously.");
        assertTransition("automation", au.state, to);
        stmts.push(db.update(automations).set({ state: to, updatedAt: now }).where(eq(automations.id, au.id)));
        logEngagement(au.engagementId, `automation.${to.toLowerCase()}`, au.name);
      } else logEngagement(au.engagementId, "automation.approval_declined", `${au.name}${note ? ` — ${note}` : ""}`);
      break;
    }
    case "offer": {
      const o = await db.select().from(offers).where(eq(offers.id, a.resourceId)).get();
      if (!o) throw new Error("The offer no longer exists.");
      const to = approve ? "SENT" : "WITHDRAWN";
      assertTransition("offer", o.status, to);
      stmts.push(db.update(offers).set({ status: to, approvedBy: approve ? actorId : null, updatedAt: now }).where(eq(offers.id, o.id)));
      if (approve) {
        const app = await db.select().from(jobApplications).where(eq(jobApplications.id, o.applicationId)).get();
        if (app && app.stage !== "OFFER") {
          assertTransition("application", app.stage, "OFFER");
          stmts.push(db.update(jobApplications).set({ stage: "OFFER", updatedAt: now }).where(eq(jobApplications.id, app.id)));
          stmts.push(db.insert(applicationEvents).values({ id: crypto.randomUUID(), applicationId: app.id, actorId, fromStage: app.stage, toStage: "OFFER", note: "Offer approved and sent", createdAt: now }));
        }
      }
      break;
    }
    default:
      throw new Error("Unknown approval type.");
  }
  stmts.push(db.update(approvals).set({ status: approve ? "approved" : "rejected", decidedBy: actorId, decisionNote: note, decidedAt: now }).where(and(eq(approvals.id, a.id), eq(approvals.status, "pending"))));
  return stmts;
}
