import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { applicationEvents, employerVerifications, interviews, jobApplications, jobListings, offers, talentSettings } from "../../../../db/schema";
import { AppShell, Btn, Chip, Denied, Empty, Field, PageHead, Panel, Stat, fmt } from "../../../_app/kit";
import { loadApp } from "../../../_app/shell";
import { can } from "../../../../lib/platform";
import { nextStates } from "../../../../lib/workflow";
import { createOffer, moveApplication, recordInterviewFeedback, saveListing, scheduleInterview, setListingStatus } from "../recruit-actions";

export const dynamic = "force-dynamic";
const days = (ms: number) => `${(ms / 86400000).toFixed(1)} d`;

export default async function Employer({ searchParams }: { searchParams: Promise<{ job?: string }> }) {
  const { ctx, info } = await loadApp();
  if (!ctx.orgId || !can(ctx.role, "jobs.manage")) return <AppShell info={info} active="jobs"><PageHead kicker="Jobs · Employer" title="Recruitment" /><Denied>Switch to an organization where you are an owner, admin, recruiter or hiring manager.</Denied></AppShell>;
  const db = getDb();
  const [listings, verification] = await Promise.all([
    db.select().from(jobListings).where(eq(jobListings.orgId, ctx.orgId)).orderBy(desc(jobListings.createdAt)),
    db.select().from(employerVerifications).where(eq(employerVerifications.orgId, ctx.orgId)).get(),
  ]);
  const jobId = (await searchParams).job;
  const job = listings.find(l => l.id === jobId);
  const apps = listings.length ? await db.select().from(jobApplications).where(and(eq(jobApplications.orgId, ctx.orgId), inArray(jobApplications.jobId, listings.map(l => l.id)))).orderBy(desc(jobApplications.updatedAt)) : [];
  const appIds = apps.map(a => a.id);
  const [events, ivs, ofs, passports] = appIds.length ? await Promise.all([
    db.select().from(applicationEvents).where(inArray(applicationEvents.applicationId, appIds)),
    db.select().from(interviews).where(inArray(interviews.applicationId, appIds)),
    db.select().from(offers).where(inArray(offers.applicationId, appIds)),
    db.select().from(talentSettings).where(inArray(talentSettings.ownerId, apps.filter(a => a.shareProfile).map(a => a.candidateId).concat(["-"]))),
  ]) : [[], [], [], []];
  // Employer reports (Domain 06 §9).
  const hired = apps.filter(a => a.stage === "HIRED");
  const firstReview = apps.map(a => events.filter(e => e.applicationId === a.id && e.fromStage === "APPLIED").map(e => e.createdAt.getTime() - a.createdAt.getTime())[0]).filter((v): v is number => v !== undefined);
  const toHire = hired.map(a => (events.find(e => e.applicationId === a.id && e.toStage === "HIRED")?.createdAt.getTime() ?? a.updatedAt.getTime()) - a.createdAt.getTime());
  const sentOffers = ofs.filter(o => ["SENT", "ACCEPTED", "DECLINED"].includes(o.status));
  const avg = (xs: number[]) => xs.length ? days(xs.reduce((a, b) => a + b, 0) / xs.length) : "—";
  const shown = job ? apps.filter(a => a.jobId === job.id) : [];
  return <AppShell info={info} active="jobs">
    <PageHead back={{ href: "/workspace/jobs", label: "Jobs" }} kicker={`Employer console · ${info.context}`} title="Recruitment" lede="Publish roles, move candidates through a transparent pipeline, schedule interviews and release offers only after approval." actions={<Chip state={verification?.status === "VERIFIED" ? "VERIFIED" : "PENDING"} text={verification?.status === "VERIFIED" ? "Verified employer" : "Not yet verified"} />} />
    <div className="app-grid app-grid-4" style={{ marginBottom: "1rem" }}>
      <Stat label="Open roles" value={listings.filter(l => l.status === "PUBLISHED").length} />
      <Stat label="Applications" value={apps.length} />
      <Stat label="Avg. time to first review" value={avg(firstReview)} />
      <Stat label="Time to hire · offer acceptance" value={`${avg(toHire)} · ${sentOffers.length ? Math.round(ofs.filter(o => o.status === "ACCEPTED").length / sentOffers.length * 100) + "%" : "—"}`} />
    </div>
    <div className="app-split">
      <div>
        {job ? <Panel title={`Pipeline · ${job.title}`} sub={`${shown.length} applications`} actions={<Link className="app-btn app-btn-ghost" href="/workspace/jobs/employer">All roles</Link>}>
          {shown.length ? <div className="app-rows">{shown.map(a => { const next = nextStates("application", a.stage).filter(s => !["WITHDRAWN", "HIRED", "OFFER"].includes(s)); const pass = passports.find(p => p.ownerId === a.candidateId); const aIv = ivs.filter(i => i.applicationId === a.id); const offer = ofs.filter(o => o.applicationId === a.id).at(-1); return <div key={a.id} className="app-row" style={{ alignItems: "flex-start" }}>
            <div className="app-row-main"><strong>{a.candidateName}</strong><small>{a.candidateEmail} · applied {fmt(a.createdAt, false)}{a.assessmentConsent ? " · consents to assessment" : ""}</small>
              {a.coverNote && <details className="app-more"><summary>Cover note & answers</summary><p className="app-pre">{a.coverNote}</p>{a.answers && <p className="app-pre" style={{ marginTop: ".4rem" }}>{a.answers}</p>}</details>}
              {a.shareProfile && pass && <p><Link href={`/talent/p/${pass.slug}`} style={{ textDecoration: "underline" }}>Capability Passport</Link></p>}
              {aIv.map(i => <div key={i.id} className="app-note" style={{ marginTop: ".3rem" }}>Interview {fmt(i.scheduledAt)} · {i.mode} · {i.interviewer}{i.rating ? ` · ${i.rating}/5` : ""}{!i.feedback && <form action={recordInterviewFeedback} className="app-inline" style={{ marginTop: ".3rem" }}><input type="hidden" name="interviewId" value={i.id} /><input name="feedback" placeholder="Feedback" required minLength={10} /><select name="rating" style={{ width: 70 }}>{[1, 2, 3, 4, 5].map(v => <option key={v}>{v}</option>)}</select><Btn kind="ghost">Save</Btn></form>}</div>)}
              {offer && <p className="app-note" style={{ marginTop: ".3rem" }}>Offer: <Chip state={offer.status} /></p>}
              <details className="app-more" style={{ marginTop: ".4rem" }}><summary>Actions</summary>
                {next.length > 0 && <form action={moveApplication} className="app-inline"><input type="hidden" name="id" value={a.id} /><input name="note" placeholder="Note to candidate (optional)" />{next.map(s => <Btn key={s} kind={s === "REJECTED" ? "danger" : "secondary"} name="to" value={s}>{s.replace(/_/g, " ").toLowerCase()}</Btn>)}</form>}
                {["SHORTLISTED", "ASSESSMENT", "INTERVIEW"].includes(a.stage) && <form action={scheduleInterview} className="app-inline" style={{ marginTop: ".5rem" }}><input type="hidden" name="id" value={a.id} /><input name="scheduledAt" type="datetime-local" required /><select name="mode" style={{ width: "auto" }}><option>Video call</option><option>Phone</option><option>In person</option></select><input name="interviewer" placeholder="Interviewer" required /><Btn kind="secondary">Schedule interview</Btn></form>}
                {["INTERVIEW", "FINAL_REVIEW"].includes(a.stage) && !ofs.some(o => o.applicationId === a.id && ["PENDING_APPROVAL", "SENT"].includes(o.status)) && <form action={createOffer} className="app-form" style={{ marginTop: ".5rem" }}><input type="hidden" name="id" value={a.id} /><Field label="Offer terms" hint="An owner or hiring manager must approve before the candidate sees it."><textarea name="terms" required minLength={20} rows={3} /></Field><div><Btn>Submit offer for approval</Btn></div></form>}
              </details>
            </div><Chip state={a.stage} />
          </div>; })}</div> : <Empty title="No applications yet" />}
        </Panel> : <Panel title="Roles">{listings.length ? <div className="app-rows">{listings.map(l => <div key={l.id} className="app-row"><Link href={`/workspace/jobs/employer?job=${l.id}`} className="app-row-main"><strong>{l.title}</strong><small>{l.location} · {l.workArrangement} · {apps.filter(a => a.jobId === l.id).length} applications</small></Link><Chip state={l.status === "PUBLISHED" ? "ACTIVE" : l.status} text={l.status.toLowerCase()} />
          <form action={setListingStatus} className="app-inline"><input type="hidden" name="jobId" value={l.id} />{l.status !== "PUBLISHED" && <Btn kind="secondary" name="status" value="PUBLISHED" disabled={verification?.status !== "VERIFIED"}>Publish</Btn>}{l.status === "PUBLISHED" && <Btn kind="ghost" name="status" value="CLOSED">Close</Btn>}</form></div>)}</div> : <Empty title="No roles yet" />}</Panel>}
      </div>
      <Panel title="Create a role" sub="Blueprint create-job workflow: basics, description, requirements, skills, compensation, arrangement, questions.">
        {verification?.status !== "VERIFIED" && <p className="app-note" style={{ marginBottom: ".6rem" }}>You can draft now; publishing unlocks once DigitalBurj verifies this organization (Organizations → Employer verification).</p>}
        <form action={saveListing} className="app-form">
          <Field label="Job title"><input name="title" required /></Field>
          <div className="app-form-row"><Field label="Location"><input name="location" required placeholder="Dubai, UAE" /></Field><Field label="Arrangement"><select name="workArrangement"><option>On-site</option><option>Hybrid</option><option>Remote</option></select></Field><Field label="Type"><select name="employmentType"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></Field></div>
          <Field label="Role description"><textarea name="description" required minLength={40} rows={4} /></Field>
          <Field label="Requirements"><textarea name="requirements" required minLength={10} rows={3} /></Field>
          <div className="app-form-row"><Field label="Skills"><input name="skills" placeholder="Comma-separated" /></Field><Field label="Compensation"><input name="salaryRange" placeholder="AED 12,000–15,000 / month" /></Field></div>
          <Field label="Application questions (optional)"><textarea name="questions" rows={2} /></Field>
          <div><Btn>Save as draft</Btn></div>
        </form>
      </Panel>
    </div>
  </AppShell>;
}
