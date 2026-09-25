import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { academyEnrollments, academyMissions, academySubmissions, missionSubmissions } from "../../../db/schema";
import { academyCourses, academyStages } from "../../academy-data";
import { AppShell, Btn, Chip, Empty, Field, PageHead, Panel, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { saveCourse, savePractice } from "./actions";

export const dynamic = "force-dynamic";

export default async function AcademyWorkspace({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { ctx, info } = await loadApp();
  const me = ctx.user.userId;
  const code = (await searchParams).course;
  const db = getDb();
  const [saved, drafts, subs] = await Promise.all([
    db.select().from(academyEnrollments).where(eq(academyEnrollments.ownerId, me)).orderBy(desc(academyEnrollments.createdAt)),
    db.select().from(academySubmissions).where(eq(academySubmissions.ownerId, me)).orderBy(desc(academySubmissions.createdAt)),
    db.select().from(missionSubmissions).where(eq(missionSubmissions.ownerId, me)).orderBy(desc(missionSubmissions.updatedAt)),
  ]);
  const selected = academyCourses.find(c => c.code === (code ?? saved[0]?.courseCode)) ?? academyCourses[0];
  const enrollment = saved.find(x => x.courseCode === selected.code);
  const courseMissions = await db.select().from(academyMissions).where(eq(academyMissions.published, true));
  const forCourse = courseMissions.filter(m => m.courseCode === selected.code);
  const forSaved = courseMissions.filter(m => saved.some(s => s.courseCode === m.courseCode));
  const missionTitles = subs.length ? await db.select({ id: academyMissions.id, title: academyMissions.title }).from(academyMissions).where(inArray(academyMissions.id, subs.map(s => s.missionId))) : [];
  const selectedDrafts = drafts.filter(d => d.enrollmentId === enrollment?.id);
  return <AppShell info={info} active="academy">
    <PageHead kicker="Academy · My learning" title="Learn it. Apply it. Prove it." lede="Save units, practise, submit missions for assessor review and request independent verification. Evidence stays private until you choose to share it." actions={<><Link className="app-btn app-btn-secondary" href="/workspace/academy/credentials">My credentials</Link><Link className="app-btn app-btn-primary" href="/academy/catalogue">Catalogue</Link></>} />
    <div className="app-split">
      <div>
        <Panel title="My missions" sub="Discover → submit → review → assess → verify → evidence.">
          {subs.length ? <div className="app-rows">{subs.map(s => <Link key={s.id} href={`/workspace/academy/missions/${s.missionId}`} className="app-row"><div className="app-row-main"><strong>{missionTitles.find(m => m.id === s.missionId)?.title ?? "Mission"}</strong><small>Attempt {s.attempt} · updated {fmt(s.updatedAt)}{s.score != null ? ` · score ${s.score}%` : ""}</small></div><Chip state={s.status} /></Link>)}</div> : <Empty title="No missions submitted yet">Open a mission below to start.</Empty>}
        </Panel>
        <Panel title={`${selected.code} · ${selected.title}`} sub={`${selected.family} · ${selected.level} · ${selected.hours} proposed hours · ${selected.maturity}`} actions={!enrollment && <form action={saveCourse}><input type="hidden" name="code" value={selected.code} /><Btn>Save unit</Btn></form>}>
          <h3 style={{ fontWeight: 800, marginBottom: ".5rem" }}>Missions for this unit</h3>
          {forCourse.length ? <div className="app-rows">{forCourse.map(m => <Link key={m.id} href={`/workspace/academy/missions/${m.id}`} className="app-row"><div className="app-row-main"><strong>{m.title}</strong><small>{m.objective}</small></div><Chip state={subs.find(s => s.missionId === m.id)?.status ?? "NEW"} text={subs.find(s => s.missionId === m.id) ? undefined : "Open"} /></Link>)}</div> : <Empty title="No published missions for this unit yet">Assessed missions are released by the Academy team as teaching material is completed.</Empty>}
          {enrollment && <>
            <h3 style={{ fontWeight: 800, margin: "1.4rem 0 .5rem" }}>Practice drafts</h3>
            <p className="app-note">Twelve-stage task model: {academyStages.join(" → ")}. Drafts are private and are not assessed.</p>
            <form action={savePractice} className="app-form" style={{ marginTop: ".8rem" }}><input type="hidden" name="enrollmentId" value={enrollment.id} /><Field label="What did you build, break, fix or test?"><textarea name="text" required minLength={20} maxLength={4000} rows={4} /></Field><Field label="Reflection"><textarea name="reflection" maxLength={2000} rows={2} /></Field><div><Btn kind="secondary">Save draft</Btn></div></form>
            <div className="app-rows">{selectedDrafts.map(d => <div key={d.id} className="app-row"><div className="app-row-main"><strong>{d.text.slice(0, 120)}</strong><small>{fmt(d.createdAt)} · {d.status}</small></div></div>)}</div>
          </>}
        </Panel>
      </div>
      <div>
        <Panel title="Saved units">
          {saved.length ? <div className="app-rows">{saved.map(s => { const c = academyCourses.find(x => x.code === s.courseCode); return <Link key={s.id} href={`/workspace/academy?course=${s.courseCode}`} className="app-row"><div className="app-row-main"><strong>{s.courseCode} · {c?.title}</strong><small>{forSaved.filter(m => m.courseCode === s.courseCode).length} missions</small></div></Link>; })}</div> : <Empty title="No saved units"><Link href="/academy/catalogue">Browse the catalogue</Link></Empty>}
        </Panel>
        <Panel title="Profile & consent" actions={<Link className="app-btn app-btn-ghost" href="/workspace/academy/profile">Edit</Link>}><p className="app-note">Your learning goal, route and whether verified learning evidence may be added to your Talent profile.</p></Panel>
      </div>
    </div>
  </AppShell>;
}
