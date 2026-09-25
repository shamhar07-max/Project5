import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../db";
import { applicationEvents, interviews, jobApplications, jobListings, offers } from "../../../../db/schema";
import { AppShell, Btn, Chip, Empty, PageHead, Panel, Timeline, fmt } from "../../../_app/kit";
import { loadApp } from "../../../_app/shell";
import { respondToOffer, withdrawApplication } from "../recruit-actions";

export const dynamic = "force-dynamic";
const FLOW = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED"];

export default async function MyApplications() {
  const { ctx, info } = await loadApp();
  const db = getDb();
  const apps = await db.select().from(jobApplications).where(eq(jobApplications.candidateId, ctx.user.userId)).orderBy(desc(jobApplications.updatedAt));
  const ids = apps.map(a => a.id);
  const [jobs, events, ivs, ofs] = ids.length ? await Promise.all([
    db.select().from(jobListings).where(inArray(jobListings.id, apps.map(a => a.jobId))),
    db.select().from(applicationEvents).where(inArray(applicationEvents.applicationId, ids)),
    db.select().from(interviews).where(inArray(interviews.applicationId, ids)),
    db.select().from(offers).where(inArray(offers.applicationId, ids)),
  ]) : [[], [], [], []];
  return <AppShell info={info} active="jobs">
    <PageHead back={{ href: "/workspace/jobs", label: "Jobs" }} kicker="Jobs · My applications" title="Where every application stands" lede="Applied → review → shortlist → assessment → interview → final review → offer → hired. Employers decide; we show every step." />
    {apps.length ? apps.map(a => { const j = jobs.find(x => x.id === a.jobId); const idx = FLOW.indexOf(a.stage); const offer = ofs.find(o => o.applicationId === a.id && ["SENT", "ACCEPTED", "DECLINED"].includes(o.status)); const upcoming = ivs.filter(i => i.applicationId === a.id); return <Panel key={a.id} title={`${j?.title ?? "Role"} — ${j?.company ?? ""}`} sub={`Applied ${fmt(a.createdAt, false)} · ${a.shareProfile ? "Capability Passport shared" : "Passport not shared"}`} actions={<Chip state={a.stage} />}>
      <div className="app-steps">{FLOW.map((s, i) => <span key={s} className={idx >= 0 && i < idx ? "done" : i === idx ? "now" : ""}>{s.replace(/_/g, " ")}</span>)}</div>
      {upcoming.length > 0 && <div className="app-rows" style={{ marginTop: ".8rem" }}>{upcoming.map(i => <div key={i.id} className="app-row"><div className="app-row-main"><strong>Interview · {i.mode}</strong><small>{fmt(i.scheduledAt)} (Dubai time) · with {i.interviewer}</small></div></div>)}</div>}
      {offer && <div className="app-panel app-panel-info" style={{ marginTop: ".8rem" }}><strong>Offer</strong><p className="app-pre" style={{ marginTop: ".4rem" }}>{offer.terms}</p>{offer.status === "SENT" ? <form action={respondToOffer} className="app-inline" style={{ marginTop: ".6rem" }}><input type="hidden" name="offerId" value={offer.id} /><Btn name="decision" value="accept">Accept offer</Btn><Btn kind="danger" name="decision" value="decline">Decline</Btn></form> : <Chip state={offer.status} />}</div>}
      <details className="app-more" style={{ marginTop: ".8rem" }}><summary>History</summary><Timeline items={events.filter(e => e.applicationId === a.id).sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime()).map(e => ({ at: e.createdAt, title: e.toStage.replace(/_/g, " ").toLowerCase(), detail: e.note }))} /></details>
      {!["HIRED", "REJECTED", "WITHDRAWN"].includes(a.stage) && <form action={withdrawApplication} style={{ marginTop: ".6rem" }}><input type="hidden" name="id" value={a.id} /><Btn kind="ghost">Withdraw application</Btn></form>}
    </Panel>; }) : <Panel><Empty title="No applications yet"><Link href="/jobs/board">Browse open roles</Link></Empty></Panel>}
  </AppShell>;
}
