import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { academyMissions, credentials, missionSubmissions, submissionReviews } from "../../../db/schema";
import { academyCourses } from "../../academy-data";
import { Btn, Chip, Empty, Field, PageHead, Panel, fmt } from "../../_app/kit";
import { AdminShell, Tabs } from "../shell";
import { adminContext } from "../../../lib/platform";
import { assess, cancelAcademyOrder, claimReview, confirmAcademyOrder, createMission, grantAcademyAccess, revokeAcademyAccess, revokeCredential, toggleMission, verify } from "./actions";
import { academyAccounts, academyEntitlements, academyOrders } from "../../../db/schema";
import { isPlanId, planById, withVat } from "../../../lib/academy/plans";

export const dynamic = "force-dynamic";

export default async function AcademyAdmin({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { user, roles } = await adminContext("academy");
  const tab = (await searchParams).tab ?? "review";
  const db = getDb();
  const [missions, queue, verifyQueue, creds] = await Promise.all([
    db.select().from(academyMissions).orderBy(desc(academyMissions.createdAt)),
    db.select().from(missionSubmissions).where(inArray(missionSubmissions.status, ["SUBMITTED", "RESUBMITTED", "UNDER_REVIEW"])).orderBy(missionSubmissions.updatedAt),
    db.select().from(missionSubmissions).where(eq(missionSubmissions.status, "VERIFICATION_PENDING")).orderBy(missionSubmissions.updatedAt),
    db.select().from(credentials).orderBy(desc(credentials.issuedAt)).limit(100),
  ]);
  const mTitle = (id: string) => missions.find(m => m.id === id);
  const reviewIds = [...queue, ...verifyQueue].map(s => s.id);
  const [pendingOrders, recentOrders, activeEnts, accounts] = await Promise.all([
    db.select().from(academyOrders).where(eq(academyOrders.status, "payment_pending")).orderBy(academyOrders.createdAt),
    db.select().from(academyOrders).orderBy(desc(academyOrders.createdAt)).limit(30),
    db.select().from(academyEntitlements).where(eq(academyEntitlements.status, "active")).orderBy(desc(academyEntitlements.createdAt)).limit(100),
    db.select({ id: academyAccounts.id, email: academyAccounts.email, name: academyAccounts.name }).from(academyAccounts),
  ]);
  const who = (id: string) => accounts.find(a => a.id === id);
  const planName = (p: string) => isPlanId(p) ? planById[p].name : p;
  const reviews = reviewIds.length ? await db.select().from(submissionReviews).where(inArray(submissionReviews.submissionId, reviewIds)).orderBy(desc(submissionReviews.createdAt)) : [];
  return <AdminShell roles={roles} email={user.email} active="academy">
    <PageHead kicker="Admin · Academy" title="Assessment & verification" lede="Assessors review against published rubrics; a different person independently verifies before a credential is issued." />
    <Tabs base="/admin/academy" active={tab} tabs={[["review", `Review queue (${queue.length})`], ["verify", `Verification (${verifyQueue.length})`], ["missions", `Missions (${missions.length})`], ["credentials", "Credentials"], ["access", `Orders & access (${pendingOrders.length})`]]} />
    {tab === "review" && <Panel title="Submissions awaiting assessment" sub="Oldest first. Claim a submission, score every criterion 0–4, then decide.">
      {queue.length ? <div className="app-rows">{queue.map(s => { const m = mTitle(s.missionId); const rubric = JSON.parse(m?.rubric ?? "[]") as string[]; const mine = s.assessorId === user.userId; return <div key={s.id} className="app-row" style={{ alignItems: "flex-start" }}>
        <div className="app-row-main"><strong>{m?.title}</strong><small>{s.ownerEmail} · attempt {s.attempt} · {fmt(s.updatedAt)}</small>
          <details className="app-more" open={mine}><summary>Submission</summary><p className="app-pre">{s.content}</p>{s.artifactUrl && <a href={s.artifactUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Artifact</a>}
            {reviews.filter(r => r.submissionId === s.id).map(r => <p key={r.id} className="app-note" style={{ marginTop: ".5rem" }}>Earlier review ({r.decision}): {r.feedback}</p>)}</details>
          {mine && s.status === "UNDER_REVIEW" && <form action={assess} className="app-form" style={{ marginTop: ".8rem" }}><input type="hidden" name="id" value={s.id} />
            {rubric.map((r, i) => <Field key={i} label={`${i + 1}. ${r}`}><select name={`score${i}`} required defaultValue=""><option value="" disabled>Score</option>{[0, 1, 2, 3, 4].map(v => <option key={v} value={v}>{v} / 4</option>)}</select></Field>)}
            <Field label="Feedback for the learner"><textarea name="feedback" required minLength={20} rows={4} /></Field>
            <Field label="Decision"><select name="decision" required defaultValue="REVISION_REQUIRED"><option value="PASSED">Passed</option><option value="REVISION_REQUIRED">Revision required</option><option value="FAILED">Failed</option></select></Field>
            <div><Btn>Record assessment</Btn></div></form>}
        </div>
        <Chip state={s.status} />
        {s.status !== "UNDER_REVIEW" && <form action={claimReview}><input type="hidden" name="id" value={s.id} /><Btn kind="secondary">Claim</Btn></form>}
        {s.status === "UNDER_REVIEW" && !mine && <span className="app-note">With another assessor</span>}
      </div>; })}</div> : <Empty title="The review queue is empty" />}
    </Panel>}
    {tab === "verify" && <Panel title="Independent verification" sub="You cannot verify work you assessed or authored.">
      {verifyQueue.length ? <div className="app-rows">{verifyQueue.map(s => { const m = mTitle(s.missionId); const assessment = reviews.find(r => r.submissionId === s.id && r.kind === "assessment"); const blocked = s.assessorId === user.userId || s.ownerId === user.userId; return <div key={s.id} className="app-row" style={{ alignItems: "flex-start" }}>
        <div className="app-row-main"><strong>{m?.title}</strong><small>{s.ownerEmail} · score {s.score}% · assessed by {assessment?.reviewerEmail ?? "—"}</small>
          <details className="app-more"><summary>Evidence & assessment</summary><p className="app-pre">{s.content}</p>{s.artifactUrl && <a href={s.artifactUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Artifact</a>}{assessment && <p className="app-note" style={{ marginTop: ".5rem" }}>Assessor feedback: {assessment.feedback}</p>}</details>
          {blocked ? <p className="app-note" style={{ marginTop: ".5rem" }}>You assessed or authored this work, so another verifier must decide.</p> : <form action={verify} className="app-form" style={{ marginTop: ".8rem" }}><input type="hidden" name="id" value={s.id} /><Field label="Verifier note (required to decline)"><textarea name="note" rows={2} /></Field><div className="app-inline"><Btn name="decision" value="verify">Verify & issue credential</Btn><Btn kind="danger" name="decision" value="decline">Decline</Btn></div></form>}
        </div><Chip state={s.status} />
      </div>; })}</div> : <Empty title="Nothing awaiting verification" />}
    </Panel>}
    {tab === "missions" && <div className="app-split">
      <Panel title="Missions">{missions.length ? <div className="app-rows">{missions.map(m => <div key={m.id} className="app-row"><div className="app-row-main"><strong>{m.title}</strong><small>{m.courseCode} · {(JSON.parse(m.rubric) as string[]).length} criteria · {m.maxAttempts} attempts</small></div><Chip state={m.published ? "ACTIVE" : "DRAFT"} text={m.published ? "Published" : "Draft"} /><form action={toggleMission}><input type="hidden" name="id" value={m.id} /><Btn kind="ghost">{m.published ? "Unpublish" : "Publish"}</Btn></form></div>)}</div> : <Empty title="No missions yet" />}</Panel>
      <Panel title="New mission" sub="Scenario, objective, instructions, required output and a published rubric (Domain 02 §7).">
        <form action={createMission} className="app-form">
          <Field label="Unit"><select name="courseCode" required>{academyCourses.map(c => <option key={c.code} value={c.code}>{c.code} · {c.title}</option>)}</select></Field>
          <Field label="Title"><input name="title" required minLength={4} /></Field>
          <Field label="Scenario"><textarea name="scenario" required minLength={20} rows={3} /></Field>
          <Field label="Objective"><input name="objective" required minLength={10} /></Field>
          <Field label="Instructions"><textarea name="instructions" required minLength={20} rows={4} /></Field>
          <Field label="Required output"><input name="requiredOutput" required /></Field>
          <Field label="Rubric" hint="One criterion per line (2–10)."><textarea name="rubric" required rows={4} placeholder={"Solves the stated problem\nExplains trade-offs\nTested with evidence"} /></Field>
          <div className="app-form-row"><Field label="Skills (comma-separated)"><input name="skills" /></Field><Field label="Max attempts"><input name="maxAttempts" type="number" min={1} max={5} defaultValue={3} /></Field></div>
          <label className="app-check"><input type="checkbox" name="published" /> Publish immediately</label>
          <div><Btn>Create mission</Btn></div>
        </form>
      </Panel>
    </div>}
    {tab === "access" && <>
      <Panel title="Orders awaiting payment" sub="No payment provider is connected. Confirm only after payment has been received; confirming activates the package.">
        {pendingOrders.length ? <div className="app-rows">{pendingOrders.map(o => <div key={o.id} className="app-row"><div className="app-row-main"><strong>{planName(o.plan)} · {o.billing} · AED {withVat(o.amount).toLocaleString()} incl. VAT</strong><small>{who(o.accountId)?.name} · {who(o.accountId)?.email} · order {o.id.slice(0, 8).toUpperCase()} · {fmt(o.createdAt)}</small></div>
          <form action={confirmAcademyOrder} className="app-inline"><input type="hidden" name="id" value={o.id} /><Btn>Confirm payment</Btn></form>
          <form action={cancelAcademyOrder} className="app-inline"><input type="hidden" name="id" value={o.id} /><Btn kind="secondary">Cancel</Btn></form></div>)}</div> : <Empty title="No orders awaiting payment" />}
      </Panel>
      <Panel title="Grant a package" sub="For scholarships, pilots and corrections. Audit-logged.">
        <form action={grantAcademyAccess} className="app-form"><Field label="Academy account email"><input name="email" type="email" required /></Field><Field label="Package"><select name="plan"><option value="plus">Academy Plus</option><option value="creator">Educator & Creator</option><option value="professional">Professional</option></select></Field><Field label="Days"><input name="days" type="number" min={1} max={730} defaultValue={30} /></Field><div><Btn>Grant access</Btn></div></form>
      </Panel>
      <Panel title="Active packages">{activeEnts.length ? <div className="app-rows">{activeEnts.map(e => <div key={e.id} className="app-row"><div className="app-row-main"><strong>{planName(e.plan)} · {who(e.accountId)?.email}</strong><small>via {e.source} · since {fmt(e.startsAt, false)}{e.endsAt ? ` · until ${fmt(e.endsAt, false)}` : ""}</small></div><form action={revokeAcademyAccess} className="app-inline"><input type="hidden" name="id" value={e.id} /><Btn kind="danger">Revoke</Btn></form></div>)}</div> : <Empty title="No active paid packages" />}</Panel>
      <Panel title="Recent orders">{recentOrders.length ? <div className="app-rows">{recentOrders.map(o => <div key={o.id} className="app-row"><div className="app-row-main"><strong>{planName(o.plan)} · {who(o.accountId)?.email}</strong><small>{o.status} · {o.coupon ?? "no promotion"} · {fmt(o.createdAt)}</small></div></div>)}</div> : <Empty title="No orders yet" />}</Panel>
    </>}
    {tab === "credentials" && <Panel title="Issued credentials">{creds.length ? <div className="app-rows">{creds.map(c => <div key={c.id} className="app-row" style={{ alignItems: "flex-start" }}><div className="app-row-main"><strong>{c.code} · {c.title}</strong><small>{c.holderName} · {fmt(c.issuedAt, false)}{c.statusReason ? ` · ${c.statusReason}` : ""}</small></div><Chip state={c.status === "active" ? "VERIFIED" : "REVOKED"} />{c.status === "active" && <form action={revokeCredential} className="app-inline"><input type="hidden" name="id" value={c.id} /><input name="reason" required minLength={10} placeholder="Reason (required)" /><Btn kind="danger">Revoke</Btn></form>}</div>)}</div> : <Empty title="No credentials issued yet" />}</Panel>}
  </AdminShell>;
}
