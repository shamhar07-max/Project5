// One delivery view for Studio and Business AI engagements. Clients and the
// DigitalBurj team see the same records; only admin mode renders staff controls.
import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "../../db";
import { automations, baiMetrics, changeRequests, milestones, releaseChecks, studioDecisions, engagements } from "../../db/schema";
import { DECISIONS, QUALIFICATION, RELEASE_CHECKS, RISK, type Risk } from "../../lib/delivery";
import { nextStates } from "../../lib/workflow";
import { Btn, Chip, Empty, Field, Panel, fmt } from "./kit";
import { addAutomation, addMilestone, advanceAutomation, advanceMilestone, progressChangeRequest, recordDecision, saveMetric, toggleReleaseCheck } from "../admin/engagements/actions";
import { submitChangeRequest } from "../workspace/engagements/delivery-actions";

type Eng = typeof engagements.$inferSelect;

export async function DeliveryView({ eng, mode, canRequestChange }: { eng: Eng; mode: "client" | "admin"; canRequestChange?: boolean }) {
  const db = getDb();
  const admin = mode === "admin";
  const [decision, ms, crs, checks, metrics, autos] = await Promise.all([
    db.select().from(studioDecisions).where(eq(studioDecisions.engagementId, eng.id)).get(),
    db.select().from(milestones).where(eq(milestones.engagementId, eng.id)).orderBy(asc(milestones.createdAt)),
    db.select().from(changeRequests).where(eq(changeRequests.engagementId, eng.id)).orderBy(asc(changeRequests.createdAt)),
    db.select().from(releaseChecks).where(eq(releaseChecks.engagementId, eng.id)),
    db.select().from(baiMetrics).where(eq(baiMetrics.engagementId, eng.id)).orderBy(asc(baiMetrics.updatedAt)),
    db.select().from(automations).where(eq(automations.engagementId, eng.id)).orderBy(asc(automations.createdAt)),
  ]);
  const studio = eng.service === "studio";
  const scores = decision ? JSON.parse(decision.scores) as Record<string, number> : {};
  const doneChecks = RELEASE_CHECKS.filter(([k]) => checks.find(c => c.checkKey === k)?.done).length;

  return <>
    {studio && <Panel title="Validation decision" sub="BUILD / RESHAPE / STOP, from the eight qualification criteria (Domain 03 §5–7).">
      {decision ? <><p style={{ display: "flex", gap: ".6rem", alignItems: "center" }}><Chip state={decision.decision} text={decision.decision} /> <span className="app-note">{DECISIONS[decision.decision as keyof typeof DECISIONS]} · {fmt(decision.decidedAt)}</span></p>
        <p className="app-pre" style={{ marginTop: ".7rem" }}>{decision.notes}</p>
        <div className="app-grid app-grid-4" style={{ marginTop: ".8rem" }}>{QUALIFICATION.map(q => <div key={q} className="app-stat"><small>{q}</small><strong>{scores[q] ?? "—"}<span className="app-note">/5</span></strong></div>)}</div></>
        : <Empty title="No decision yet">The Studio team records one after discovery and validation.</Empty>}
      {admin && <details className="app-more" style={{ marginTop: "1rem" }}><summary>{decision ? "Revise decision" : "Record decision"}</summary>
        <form action={recordDecision} className="app-form"><input type="hidden" name="id" value={eng.id} />
          <div className="app-form-row">{QUALIFICATION.map((q, i) => <Field key={q} label={q}><select name={`q${i}`} defaultValue={scores[q] ?? 3}>{[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}</select></Field>)}</div>
          <Field label="Decision"><select name="decision" defaultValue={decision?.decision ?? "BUILD"}>{Object.keys(DECISIONS).map(d => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Evidence & rationale"><textarea name="notes" required minLength={20} rows={4} defaultValue={decision?.notes} /></Field>
          <div><Btn>Save decision</Btn></div></form></details>}
    </Panel>}

    <Panel title="Milestones" sub="Each milestone is approved by the client before the next begins.">
      {ms.length ? <div className="app-rows">{ms.map(m => <div key={m.id} className="app-row" style={{ alignItems: "flex-start" }}>
        <div className="app-row-main"><strong>{m.title}</strong><small>Due {fmt(m.dueAt, false)}</small><p className="app-pre app-note" style={{ marginTop: ".3rem" }}>{m.deliverables}</p></div>
        <Chip state={m.status} />
        {admin && ["PLANNED", "IN_PROGRESS", "CHANGES_REQUESTED"].includes(m.status) && <form action={advanceMilestone}><input type="hidden" name="milestoneId" value={m.id} /><Btn kind="secondary">{m.status === "IN_PROGRESS" ? "Submit for approval" : "Start"}</Btn></form>}
        {!admin && m.status === "SUBMITTED" && <Link className="app-btn app-btn-primary" href="/workspace/approvals">Review</Link>}
      </div>)}</div> : <Empty title="No milestones yet" />}
      {admin && <details className="app-more" style={{ marginTop: "1rem" }}><summary>Add milestone</summary><form action={addMilestone} className="app-form"><input type="hidden" name="id" value={eng.id} /><div className="app-form-row"><Field label="Title"><input name="title" required minLength={3} /></Field><Field label="Due date"><input name="dueAt" type="date" /></Field></div><Field label="Deliverables & acceptance criteria"><textarea name="deliverables" required minLength={5} rows={3} /></Field><div><Btn>Add milestone</Btn></div></form></details>}
    </Panel>

    <Panel title="Change requests" sub="Submitted → under review → impact assessed → quoted → client approval → implementing → completed.">
      {crs.length ? <div className="app-rows">{crs.map(c => { const next = nextStates("changeRequest", c.status).filter(s => s !== "APPROVED"); return <div key={c.id} className="app-row" style={{ alignItems: "flex-start" }}>
        <div className="app-row-main"><strong>{c.title}</strong><small>{c.reason}</small>{(c.impactScope || c.impactTime || c.impactCost) && <p className="app-note" style={{ marginTop: ".3rem" }}>Scope: {c.impactScope || "—"} · Time: {c.impactTime || "—"} · Cost: {c.impactCost || "—"}</p>}</div>
        <Chip state={c.status} />
        {admin && next.length > 0 && <form action={progressChangeRequest} className="app-form" style={{ minWidth: 240 }}><input type="hidden" name="crId" value={c.id} />
          {next.includes("IMPACT_ASSESSED") && <><input name="impactScope" placeholder="Scope impact" /><input name="impactTime" placeholder="Timeline impact" /><input name="impactCost" placeholder="Cost impact" /></>}
          <div className="app-inline">{next.map(s => <Btn key={s} kind={s === "DECLINED" ? "danger" : "secondary"} name="to" value={s}>{s.replace(/_/g, " ").toLowerCase()}</Btn>)}</div></form>}
      </div>; })}</div> : <Empty title="No change requests" />}
      {!admin && canRequestChange && <details className="app-more" style={{ marginTop: "1rem" }}><summary>Request a change</summary><form action={submitChangeRequest} className="app-form"><input type="hidden" name="engagementId" value={eng.id} /><Field label="What should change?"><input name="title" required minLength={4} maxLength={140} /></Field><Field label="Why"><textarea name="reason" required minLength={10} rows={3} /></Field><div><Btn>Submit change request</Btn></div><p className="app-note">The team assesses scope, timeline and cost impact before anything changes; you approve the quote.</p></form></details>}
    </Panel>

    {studio && <Panel title={`Release readiness (${doneChecks}/${RELEASE_CHECKS.length})`} sub="Domain 03 §13 QA & release checklist.">
      <div className="app-rows">{RELEASE_CHECKS.map(([k, l]) => { const c = checks.find(x => x.checkKey === k); return <div key={k} className="app-row"><div className="app-row-main"><strong>{l}</strong>{c?.note && <small>{c.note}</small>}</div><Chip state={c?.done ? "COMPLETED" : "PLANNED"} text={c?.done ? "Done" : "Open"} />{admin && <form action={toggleReleaseCheck} className="app-inline"><input type="hidden" name="id" value={eng.id} /><input type="hidden" name="key" value={k} /><input name="note" placeholder="Note" defaultValue={c?.note} style={{ width: 160 }} /><Btn kind="ghost">{c?.done ? "Reopen" : "Mark done"}</Btn></form>}</div>; })}</div>
    </Panel>}

    {!studio && <Panel title="Performance: before and after" sub="Every value is labelled measured or estimated (Domain 04 §6, §12).">
      {metrics.length ? <table className="app-table"><thead><tr><th>Metric</th><th>Baseline</th><th>Current</th>{admin && <th />}</tr></thead><tbody>{metrics.map(m => <tr key={m.id}><td><b>{m.name}</b><div className="app-note">{m.unit}</div></td><td>{m.baseline} <Chip state={m.baselineBasis === "Measured" ? "ACTIVE" : "PENDING"} text={m.baselineBasis} /></td><td>{m.current ? <>{m.current} <Chip state={m.currentBasis === "Measured" ? "ACTIVE" : "PENDING"} text={m.currentBasis} /></> : "—"}</td>{admin && <td><details className="app-more"><summary>Edit</summary><MetricForm engId={eng.id} m={m} /></details></td>}</tr>)}</tbody></table> : <Empty title="No metrics recorded yet" />}
      {admin && <details className="app-more" style={{ marginTop: "1rem" }}><summary>Add metric</summary><MetricForm engId={eng.id} /></details>}
    </Panel>}

    {!studio && <Panel title="Automations" sub="Idea → designed → approved → building → testing → pilot → live. The client approves each design; high-risk go-lives need client approval; critical-risk work is never autonomous.">
      {autos.length ? <div className="app-rows">{autos.map(a => { const next = nextStates("automation", a.state).filter(s => !(a.riskLevel === "CRITICAL" && ["BUILDING", "TESTING", "PILOT", "LIVE"].includes(s))); return <div key={a.id} className="app-row" style={{ alignItems: "flex-start" }}>
        <div className="app-row-main"><strong>{a.name}</strong><small>Trigger: {a.trigger} · Systems: {a.systems || "—"} · AI: {a.aiComponents || "none"}</small><p className="app-note" style={{ marginTop: ".3rem" }}>{a.objective}</p><p className="app-note">Risk {a.riskLevel}: {RISK[a.riskLevel as Risk]}</p></div>
        <Chip state={a.state} />
        {admin && next.length > 0 && <form action={advanceAutomation} className="app-inline"><input type="hidden" name="automationId" value={a.id} />{next.map(s => <Btn key={s} kind={["FAILED", "RETIRED"].includes(s) ? "danger" : "secondary"} name="to" value={s}>{s === "APPROVED" ? "Request design approval" : s === "LIVE" && a.state === "PILOT" && a.riskLevel === "HIGH" ? "Request go-live approval" : s.toLowerCase()}</Btn>)}</form>}
      </div>; })}</div> : <Empty title="No automations yet" />}
      {admin && <details className="app-more" style={{ marginTop: "1rem" }}><summary>Add automation</summary><form action={addAutomation} className="app-form"><input type="hidden" name="id" value={eng.id} /><div className="app-form-row"><Field label="Name"><input name="name" required /></Field><Field label="Risk level"><select name="riskLevel">{Object.keys(RISK).map(r => <option key={r}>{r}</option>)}</select></Field></div><Field label="Objective (business outcome)"><textarea name="objective" required minLength={10} rows={2} /></Field><div className="app-form-row"><Field label="Trigger"><input name="trigger" required /></Field><Field label="Systems"><input name="systems" /></Field><Field label="AI components"><input name="aiComponents" placeholder="Leave empty if deterministic" /></Field></div><div><Btn>Add automation</Btn></div></form></details>}
    </Panel>}
  </>;
}

function MetricForm({ engId, m }: { engId: string; m?: typeof baiMetrics.$inferSelect }) {
  return <form action={saveMetric} className="app-form" style={{ marginTop: ".5rem" }}><input type="hidden" name="id" value={engId} />{m && <input type="hidden" name="metricId" value={m.id} />}
    <div className="app-form-row"><Field label="Metric"><input name="name" required defaultValue={m?.name} placeholder="Cycle time" /></Field><Field label="Unit"><input name="unit" required defaultValue={m?.unit} placeholder="hours / week" /></Field></div>
    <div className="app-form-row"><Field label="Baseline"><input name="baseline" required defaultValue={m?.baseline} /></Field><Field label="Basis"><select name="baselineBasis" defaultValue={m?.baselineBasis ?? "Measured"}><option>Measured</option><option>Estimated</option></select></Field></div>
    <div className="app-form-row"><Field label="Current"><input name="current" defaultValue={m?.current} /></Field><Field label="Basis"><select name="currentBasis" defaultValue={m?.currentBasis || "Measured"}><option>Measured</option><option>Estimated</option></select></Field></div>
    <div><Btn>Save metric</Btn></div></form>;
}
