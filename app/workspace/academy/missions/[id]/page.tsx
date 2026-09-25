import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { academyMissions, credentials, missionSubmissions, submissionReviews } from "../../../../../db/schema";
import { AppShell, Btn, Chip, Field, PageHead, Panel, Timeline, fmt } from "../../../../_app/kit";
import { loadApp } from "../../../../_app/shell";
import { requestIndependentVerification, submitMission } from "../../mission-actions";

export const dynamic = "force-dynamic";
const FLOW = ["SUBMITTED", "UNDER_REVIEW", "PASSED", "VERIFICATION_PENDING", "VERIFIED"];

export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { ctx, info } = await loadApp();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const mission = await db.select().from(academyMissions).where(and(eq(academyMissions.id, id), eq(academyMissions.published, true))).get();
  if (!mission) notFound();
  const subs = await db.select().from(missionSubmissions).where(and(eq(missionSubmissions.missionId, id), eq(missionSubmissions.ownerId, ctx.user.userId))).orderBy(desc(missionSubmissions.updatedAt));
  const current = subs[0];
  const reviews = subs.length ? await db.select().from(submissionReviews).where(inArray(submissionReviews.submissionId, subs.map(s => s.id))).orderBy(desc(submissionReviews.createdAt)) : [];
  const cred = current ? await db.select().from(credentials).where(eq(credentials.submissionId, current.id)).get() : undefined;
  const rubric = JSON.parse(mission.rubric) as string[];
  const canSubmit = !current || ["REVISION_REQUIRED", "FAILED", "VERIFICATION_DECLINED"].includes(current.status);
  const attemptsLeft = current?.status === "REVISION_REQUIRED" ? mission.maxAttempts - current.attempt : mission.maxAttempts;
  const stepIndex = current ? FLOW.indexOf(current.status === "RESUBMITTED" ? "SUBMITTED" : current.status) : -1;
  return <AppShell info={info} active="academy">
    <PageHead back={{ href: "/workspace/academy", label: "My learning" }} kicker={`Academy mission · ${mission.courseCode}`} title={mission.title} lede={mission.objective} actions={current && <Chip state={current.status} />} />
    <div className="app-steps" style={{ marginBottom: "1rem" }}>{FLOW.map((s, i) => <span key={s} className={i < stepIndex ? "done" : i === stepIndex ? "now" : ""}>{s.replace(/_/g, " ")}</span>)}</div>
    <div className="app-split">
      <div>
        <Panel title="Scenario"><p className="app-pre">{mission.scenario}</p></Panel>
        <Panel title="Instructions"><p className="app-pre">{mission.instructions}</p><h3 style={{ fontWeight: 800, margin: "1rem 0 .3rem" }}>Required output</h3><p className="app-pre">{mission.requiredOutput}</p></Panel>
        {canSubmit && attemptsLeft > 0 ? <Panel title={current?.status === "REVISION_REQUIRED" ? "Resubmit with the reviewer's changes" : "Submit your work"} sub={`${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining. A human assessor reviews every submission against the published rubric.`}>
          <form action={submitMission} className="app-form"><input type="hidden" name="missionId" value={mission.id} />
            <Field label="Your submission" hint="Explain what you did, the decisions you made and how you tested it."><textarea name="content" required minLength={40} maxLength={8000} rows={8} defaultValue={current?.status === "REVISION_REQUIRED" ? current.content : ""} /></Field>
            <Field label="Artifact link (optional)" hint="Repository, document, prototype or recording — https:// only."><input name="artifactUrl" type="url" defaultValue={current?.artifactUrl} /></Field>
            <div><Btn>{current?.status === "REVISION_REQUIRED" ? "Resubmit" : "Submit for review"}</Btn></div>
          </form>
        </Panel> : current && <Panel title="Your latest submission" sub={`Attempt ${current.attempt} · ${fmt(current.updatedAt)}`}><p className="app-pre">{current.content}</p>{current.artifactUrl && <p style={{ marginTop: ".6rem" }}><a href={current.artifactUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Artifact</a></p>}
          {current.status === "PASSED" && <form action={requestIndependentVerification} style={{ marginTop: "1rem" }}><input type="hidden" name="submissionId" value={current.id} /><Btn>Request independent verification</Btn><p className="app-note" style={{ marginTop: ".4rem" }}>A verifier who did not assess your work reviews the evidence. If verified, you receive a credential with a public verification link.</p></form>}
          {cred && <p style={{ marginTop: "1rem" }}><Chip state="VERIFIED" /> Credential <b>{cred.code}</b> · <a href={`/verify/${cred.code}`} style={{ textDecoration: "underline" }}>public verification page</a></p>}
        </Panel>}
      </div>
      <div>
        <Panel title="Rubric" sub="Each criterion is scored 0–4 by the assessor.">{<ol style={{ paddingLeft: "1.1rem", display: "grid", gap: ".4rem" }}>{rubric.map((r, i) => <li key={i} className="app-note">{r}</li>)}</ol>}</Panel>
        <Panel title="Feedback & history">
          <Timeline items={[...reviews.map(r => ({ at: r.createdAt, title: `${r.kind === "verification" ? "Verifier" : "Assessor"}: ${r.decision.replace(/_/g, " ").toLowerCase()}`, detail: r.feedback })), ...subs.map(s => ({ at: s.createdAt, title: "Submission opened", detail: `Latest attempt: ${s.attempt}` }))].sort((a, b) => b.at.getTime() - a.at.getTime())} />
        </Panel>
      </div>
    </div>
  </AppShell>;
}
