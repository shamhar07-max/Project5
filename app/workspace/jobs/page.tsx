import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { jobApplications, jobTracks } from "../../../db/schema";
import { AppShell, Btn, Chip, Empty, Field, PageHead, Panel, Stat, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { can } from "../../../lib/platform";
import { createJobTrack, removeJobTrack, statuses, updateJobTrack } from "./actions";

export const dynamic = "force-dynamic";

export default async function Jobs() {
  const { ctx, info } = await loadApp();
  const db = getDb();
  const [tracks, apps] = await Promise.all([
    db.select().from(jobTracks).where(eq(jobTracks.ownerId, ctx.user.userId)).orderBy(desc(jobTracks.updatedAt)),
    db.select().from(jobApplications).where(eq(jobApplications.candidateId, ctx.user.userId)),
  ]);
  const employer = ctx.orgId && can(ctx.role, "jobs.manage");
  return <AppShell info={info} active="jobs">
    <PageHead kicker="Jobs" title="More than applications." lede="Apply to DigitalBurj-listed roles with a structured application, and keep a private tracker for roles elsewhere. Hiring decisions remain with employers." actions={<><Link className="app-btn app-btn-primary" href="/jobs/board">Browse open roles</Link>{employer && <Link className="app-btn app-btn-secondary" href="/workspace/jobs/employer">Employer console</Link>}</>} />
    <div className="app-grid app-grid-3" style={{ marginBottom: "1rem" }}>
      <Stat label="My applications" value={apps.length} href="/workspace/jobs/applications" />
      <Stat label="In interview" value={apps.filter(a => a.stage === "INTERVIEW").length} href="/workspace/jobs/applications" />
      <Stat label="Tracked elsewhere" value={tracks.length} />
    </div>
    <Panel title="Private tracker" sub="For roles outside DigitalBurj. Statuses are self-reported and visible only to you.">
      <form action={createJobTrack} className="app-form"><div className="app-form-row"><Field label="Role"><input name="roleTitle" required maxLength={120} /></Field><Field label="Employer"><input name="employer" required maxLength={120} /></Field><Field label="Link"><input name="sourceUrl" type="url" /></Field></div><Field label="Notes"><textarea name="notes" maxLength={1000} rows={2} /></Field><div><Btn>Track role</Btn></div></form>
      <div className="app-rows" style={{ marginTop: "1rem" }}>{tracks.map(t => <div key={t.id} className="app-row"><div className="app-row-main"><strong>{t.roleTitle} — {t.employer}</strong><small>{fmt(t.updatedAt)}{t.notes ? ` · ${t.notes.slice(0, 80)}` : ""}</small></div><Chip state={t.status.startsWith("Offer") ? "SENT" : t.status === "Rejected" ? "REJECTED" : "ACTIVE"} text={t.status} />
        <form action={updateJobTrack} className="app-inline"><input type="hidden" name="id" value={t.id} /><select name="status" defaultValue={t.status} style={{ width: "auto" }} aria-label="Status">{statuses.map(s => <option key={s}>{s}</option>)}</select><Btn kind="ghost">Update</Btn></form>
        <form action={removeJobTrack}><input type="hidden" name="id" value={t.id} /><Btn kind="ghost">Remove</Btn></form></div>)}{!tracks.length && <Empty title="Nothing tracked yet" />}</div>
    </Panel>
  </AppShell>;
}
