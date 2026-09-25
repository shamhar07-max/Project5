"use server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "../../../db";
import { approvals, auditLog, automations, baiMetrics, changeRequests, engagementEvents, engagements, milestones, releaseChecks, studioDecisions } from "../../../db/schema";
import { newApproval } from "../../../lib/approvals";
import { DECISIONS, QUALIFICATION, RELEASE_CHECKS, RISK, STAGES, type Risk } from "../../../lib/delivery";
import { auditRow, membersWith, oneOf, opt, publish, requireStaff, str, uuid, type Notify } from "../../../lib/platform";
import { assertTransition } from "../../../lib/workflow";

type Eng = typeof engagements.$inferSelect;

async function staffFor(id: string, action: string) {
  const db = getDb();
  const eng = await db.select().from(engagements).where(eq(engagements.id, id)).get();
  if (!eng || !["studio", "business"].includes(eng.service)) throw new Error("Engagement unavailable.");
  const { user } = await requireStaff(eng.service === "studio" ? "studio" : "business", action);
  return { user, eng, db };
}

/** The client (owner + org members who can approve for this division). */
async function clientRecipients(eng: Eng, n: Omit<Notify, "userId">): Promise<Notify[]> {
  const ids = new Set<string>([eng.ownerId]);
  if (eng.orgId) (await membersWith(eng.orgId, eng.service === "studio" ? "studio.approve" : "business.approve")).forEach(i => ids.add(i));
  return [...ids].map(userId => ({ userId, ...n }));
}

const log = (db: ReturnType<typeof getDb>, eng: Eng, actorId: string, action: string, detail: string) =>
  db.insert(engagementEvents).values({ id: crypto.randomUUID(), engagementId: eng.id, actorId, action, detail, createdAt: new Date() });
const touch = (db: ReturnType<typeof getDb>, eng: Eng, extra: Partial<Eng> = {}) => db.update(engagements).set({ updatedAt: new Date(), ...extra }).where(eq(engagements.id, eng.id));
const division = (eng: Eng) => eng.service === "studio" ? "Studio" : "Business AI";
const clientHref = (eng: Eng) => `/workspace/engagements/${eng.id}`;
const done = (eng: Eng) => { revalidatePath(`/admin/engagements/${eng.id}`); revalidatePath(clientHref(eng)); };

export async function setStage(form: FormData) {
  const { user, eng, db } = await staffFor(uuid(form, "id"), "engagement.stage");
  const stage = oneOf(form, "stage", STAGES[eng.service as "studio" | "business"], "stage");
  await publish({ type: `${eng.service}.engagement.stage_changed`, actorId: user.userId, orgId: eng.orgId, resourceType: "engagement", resourceId: eng.id, payload: { from: eng.stage, to: stage } },
    await clientRecipients(eng, { title: `${eng.title}: now ${stage}`, href: clientHref(eng), category: division(eng) }),
    [touch(db, eng, { stage }), log(db, eng, user.userId, "stage.changed", `${eng.stage} → ${stage}`), db.insert(auditLog).values(auditRow(user, eng.orgId, "engagement.stage", "engagement", eng.id, "allow", stage))]);
  done(eng);
}

export async function recordDecision(form: FormData) {
  const { user, eng, db } = await staffFor(uuid(form, "id"), "studio.decision");
  if (eng.service !== "studio") throw new Error("Validation decisions apply to Studio.");
  const decision = oneOf(form, "decision", Object.keys(DECISIONS) as (keyof typeof DECISIONS)[], "decision");
  const scores = Object.fromEntries(QUALIFICATION.map((q, i) => { const v = Number(form.get(`q${i}`)); if (!Number.isInteger(v) || v < 1 || v > 5) throw new Error("Score every qualification criterion from 1 to 5."); return [q, v]; }));
  const notes = str(form, "notes", 20, 4000, "Rationale");
  const now = new Date();
  await publish({ type: "studio.validation.decided", actorId: user.userId, orgId: eng.orgId, resourceType: "engagement", resourceId: eng.id, payload: { decision } },
    await clientRecipients(eng, { title: `Validation decision for ${eng.title}: ${decision}`, body: notes.slice(0, 200), href: clientHref(eng), category: "Studio", priority: "high" }),
    [db.insert(studioDecisions).values({ engagementId: eng.id, scores: JSON.stringify(scores), notes, decision, decidedBy: user.userId, decidedAt: now }).onConflictDoUpdate({ target: studioDecisions.engagementId, set: { scores: JSON.stringify(scores), notes, decision, decidedBy: user.userId, decidedAt: now } }),
     touch(db, eng, { stage: "Decision made" }), log(db, eng, user.userId, "decision.recorded", `${decision}: ${notes.slice(0, 300)}`), db.insert(auditLog).values(auditRow(user, eng.orgId, "studio.decision", "engagement", eng.id, "allow", decision))]);
  done(eng);
}

export async function addMilestone(form: FormData) {
  const { user, eng, db } = await staffFor(uuid(form, "id"), "studio.milestone.create");
  const due = String(form.get("dueAt") || "");
  const dueAt = due ? new Date(`${due}T12:00:00Z`) : null;
  if (dueAt && Number.isNaN(dueAt.getTime())) throw new Error("Enter a valid due date.");
  const title = str(form, "title", 3, 140, "Milestone");
  await db.batch([
    db.insert(milestones).values({ id: crypto.randomUUID(), engagementId: eng.id, title, deliverables: str(form, "deliverables", 5, 2000, "Deliverables"), dueAt, status: "PLANNED", createdBy: user.userId, createdAt: new Date(), updatedAt: new Date() }),
    log(db, eng, user.userId, "milestone.planned", title), touch(db, eng),
  ]);
  done(eng);
}

/** PLANNED → IN_PROGRESS → SUBMITTED (creates a client approval). Approval moves it on. */
export async function advanceMilestone(form: FormData) {
  const id = uuid(form, "milestoneId");
  const db0 = getDb();
  const m = await db0.select().from(milestones).where(eq(milestones.id, id)).get();
  if (!m) throw new Error("Milestone unavailable.");
  const { user, eng, db } = await staffFor(m.engagementId, "studio.milestone.advance");
  const to = m.status === "PLANNED" || m.status === "CHANGES_REQUESTED" ? "IN_PROGRESS" : "SUBMITTED";
  assertTransition("milestone", m.status, to);
  const extra: unknown[] = [db.update(milestones).set({ status: to, updatedAt: new Date() }).where(eq(milestones.id, m.id)), log(db, eng, user.userId, `milestone.${to.toLowerCase()}`, m.title), touch(db, eng)];
  let notify: Notify[] = [];
  if (to === "SUBMITTED") {
    extra.push(db.insert(approvals).values(newApproval({ kind: "milestone", division: division(eng), orgId: eng.orgId, ownerId: eng.ownerId, approverScope: eng.service === "studio" ? "studio.approve" : "business.approve", resourceId: m.id, title: `Approve milestone: ${m.title}`, detail: `Deliverables:\n${m.deliverables}`, requestedBy: user.userId })));
    notify = await clientRecipients(eng, { title: `Milestone ready for your approval: ${m.title}`, href: "/workspace/approvals", category: division(eng), priority: "high" });
  }
  await publish({ type: `studio.milestone.${to.toLowerCase()}`, actorId: user.userId, orgId: eng.orgId, resourceType: "milestone", resourceId: m.id, payload: { title: m.title } }, notify, extra as never[]);
  done(eng);
}

export async function progressChangeRequest(form: FormData) {
  const id = uuid(form, "crId");
  const c = await getDb().select().from(changeRequests).where(eq(changeRequests.id, id)).get();
  if (!c) throw new Error("Change request unavailable.");
  const { user, eng, db } = await staffFor(c.engagementId, "studio.change_request.progress");
  const to = oneOf(form, "to", ["UNDER_REVIEW", "IMPACT_ASSESSED", "QUOTED", "DECLINED", "IMPLEMENTING", "COMPLETED"] as const, "status");
  assertTransition("changeRequest", c.status, to);
  const set: Partial<typeof changeRequests.$inferInsert> = { status: to, updatedAt: new Date() };
  if (to === "IMPACT_ASSESSED") { set.impactScope = str(form, "impactScope", 3, 800, "Scope impact"); set.impactTime = str(form, "impactTime", 1, 200, "Timeline impact"); set.impactCost = str(form, "impactCost", 1, 200, "Cost impact"); }
  const extra: unknown[] = [db.update(changeRequests).set(set).where(eq(changeRequests.id, c.id)), log(db, eng, user.userId, `change_request.${to.toLowerCase()}`, c.title), touch(db, eng)];
  if (to === "QUOTED") extra.push(db.insert(approvals).values(newApproval({ kind: "change_request", division: division(eng), orgId: eng.orgId, ownerId: eng.ownerId, approverScope: eng.service === "studio" ? "studio.approve" : "business.approve", resourceId: c.id, title: `Approve change: ${c.title}`, detail: `Scope: ${c.impactScope}\nTimeline: ${c.impactTime}\nCost: ${c.impactCost}`, requestedBy: user.userId })));
  await publish({ type: `studio.change_request.${to.toLowerCase()}`, actorId: user.userId, orgId: eng.orgId, resourceType: "change_request", resourceId: c.id },
    await clientRecipients(eng, { title: to === "QUOTED" ? `Change request quoted — your approval is needed: ${c.title}` : `Change request ${to.replace(/_/g, " ").toLowerCase()}: ${c.title}`, href: to === "QUOTED" ? "/workspace/approvals" : clientHref(eng), category: division(eng), priority: to === "QUOTED" ? "high" : "normal" }), extra as never[]);
  done(eng);
}

export async function toggleReleaseCheck(form: FormData) {
  const { user, eng, db } = await staffFor(uuid(form, "id"), "studio.release_check");
  const key = oneOf(form, "key", RELEASE_CHECKS.map(r => r[0]), "check");
  const existing = await db.select().from(releaseChecks).where(and(eq(releaseChecks.engagementId, eng.id), eq(releaseChecks.checkKey, key))).get();
  const doneNow = !existing?.done; const note = opt(form, "note", 300);
  await db.batch([
    db.insert(releaseChecks).values({ id: crypto.randomUUID(), engagementId: eng.id, checkKey: key, done: doneNow, note, updatedBy: user.userId, updatedAt: new Date() }).onConflictDoUpdate({ target: [releaseChecks.engagementId, releaseChecks.checkKey], set: { done: doneNow, note, updatedBy: user.userId, updatedAt: new Date() } }),
    log(db, eng, user.userId, doneNow ? "release_check.done" : "release_check.reopened", RELEASE_CHECKS.find(r => r[0] === key)![1]),
  ]);
  done(eng);
}

// ─── Business AI ───
export async function saveMetric(form: FormData) {
  const { user, eng, db } = await staffFor(uuid(form, "id"), "business.metric.save");
  const basis = ["Measured", "Estimated"] as const;
  const metricId = String(form.get("metricId") || "");
  const values = { name: str(form, "name", 2, 120, "Metric"), unit: str(form, "unit", 1, 40, "Unit"), baseline: str(form, "baseline", 1, 60, "Baseline"), baselineBasis: oneOf(form, "baselineBasis", basis, "baseline basis"), current: opt(form, "current", 60), currentBasis: String(form.get("currentBasis") || ""), updatedBy: user.userId, updatedAt: new Date() };
  if (values.current && !(basis as readonly string[]).includes(values.currentBasis)) throw new Error("Label the current value as measured or estimated.");
  if (!values.current) values.currentBasis = "";
  const stmt = /^[0-9a-f-]{36}$/.test(metricId)
    ? db.update(baiMetrics).set(values).where(and(eq(baiMetrics.id, metricId), eq(baiMetrics.engagementId, eng.id)))
    : db.insert(baiMetrics).values({ id: crypto.randomUUID(), engagementId: eng.id, ...values });
  await publish({ type: "business.metric.updated", actorId: user.userId, orgId: eng.orgId, resourceType: "engagement", resourceId: eng.id, payload: { name: values.name } },
    await clientRecipients(eng, { title: `Metric updated: ${values.name}`, href: clientHref(eng), category: "Business AI" }), [stmt, log(db, eng, user.userId, "metric.saved", `${values.name}: ${values.baseline} → ${values.current || "—"}`), touch(db, eng)]);
  done(eng);
}

export async function addAutomation(form: FormData) {
  const { user, eng, db } = await staffFor(uuid(form, "id"), "business.automation.create");
  const riskLevel = oneOf(form, "riskLevel", Object.keys(RISK) as Risk[], "risk level");
  const name = str(form, "name", 3, 120, "Name");
  await db.batch([
    db.insert(automations).values({ id: crypto.randomUUID(), engagementId: eng.id, name, objective: str(form, "objective", 10, 800, "Objective"), trigger: str(form, "trigger", 3, 300, "Trigger"), systems: opt(form, "systems", 300), aiComponents: opt(form, "aiComponents", 300), riskLevel, state: "IDEA", createdBy: user.userId, createdAt: new Date(), updatedAt: new Date() }),
    log(db, eng, user.userId, "automation.idea", `${name} (${riskLevel})`), touch(db, eng),
  ]);
  done(eng);
}

/**
 * Staff move automations through the lifecycle. Two moves need the client:
 * DESIGNED→APPROVED always, and PILOT→LIVE for HIGH risk. CRITICAL never runs autonomously.
 */
export async function advanceAutomation(form: FormData) {
  const id = uuid(form, "automationId");
  const a = await getDb().select().from(automations).where(eq(automations.id, id)).get();
  if (!a) throw new Error("Automation unavailable.");
  const { user, eng, db } = await staffFor(a.engagementId, "business.automation.advance");
  const to = String(form.get("to") || "");
  assertTransition("automation", a.state, to);
  if (a.riskLevel === "CRITICAL" && ["BUILDING", "TESTING", "PILOT", "LIVE"].includes(to)) throw new Error("Critical-risk work stays a controlled human process; it cannot be built as autonomous automation.");
  const needsApproval = to === "APPROVED" || (to === "LIVE" && a.state === "PILOT" && a.riskLevel === "HIGH");
  if (needsApproval) {
    const open = await db.select().from(approvals).where(and(eq(approvals.resourceId, a.id), eq(approvals.status, "pending"))).get();
    if (open) throw new Error("An approval for this automation is already waiting on the client.");
    const kind = to === "APPROVED" ? "automation.design" : "automation.golive";
    await publish({ type: "business.automation.approval_requested", actorId: user.userId, orgId: eng.orgId, resourceType: "automation", resourceId: a.id, payload: { to } },
      await clientRecipients(eng, { title: `${to === "APPROVED" ? "Approve automation design" : "Approve go-live"}: ${a.name}`, href: "/workspace/approvals", category: "Business AI", priority: "high" }),
      [db.insert(approvals).values(newApproval({ kind, division: "Business AI", orgId: eng.orgId, ownerId: eng.ownerId, approverScope: "business.approve", resourceId: a.id, title: `${to === "APPROVED" ? "Approve design" : "Approve go-live"}: ${a.name}`, detail: `Objective: ${a.objective}\nTrigger: ${a.trigger}\nSystems: ${a.systems || "—"}\nAI components: ${a.aiComponents || "none"}\nRisk: ${a.riskLevel} — ${RISK[a.riskLevel as Risk]}`, requestedBy: user.userId })), log(db, eng, user.userId, "automation.approval_requested", `${a.name} → ${to}`)]);
  } else {
    await publish({ type: to === "FAILED" ? "business.automation.failed" : `business.automation.${to.toLowerCase()}`, actorId: user.userId, orgId: eng.orgId, resourceType: "automation", resourceId: a.id, payload: { from: a.state, to } },
      await clientRecipients(eng, { title: `Automation ${a.name}: ${to.toLowerCase()}`, href: clientHref(eng), category: "Business AI", priority: to === "FAILED" ? "critical" : "normal" }),
      [db.update(automations).set({ state: to, updatedAt: new Date() }).where(eq(automations.id, a.id)), log(db, eng, user.userId, `automation.${to.toLowerCase()}`, a.name), touch(db, eng)]);
  }
  done(eng);
}
