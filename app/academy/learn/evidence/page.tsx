import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { BadgeCheck, CircleDashed, ShieldAlert, Trophy } from "lucide-react";
import { getDb } from "../../../../db";
import { academyPassport, academyProgress } from "../../../../db/schema";
import { requireAcademyAccount } from "../../../../lib/academy/auth";
import { accessFor } from "../../../../lib/academy/access";
import { CATALOG, courseByCode } from "../../../../lib/academy/catalog";
import { canAccessCourse, hasFeature } from "../../../../lib/academy/plans";
import { PassportForm } from "../../_components/passport-form";

export const metadata = { title: "Evidence & Failure Passport · DigitalBurj Academy" };

export default async function Evidence({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course } = await searchParams;
  const account = await requireAcademyAccount("/academy/learn/evidence");
  const { plan } = await accessFor(account.id);
  const db = getDb();
  const [entries, progress] = await Promise.all([
    db.select().from(academyPassport).where(eq(academyPassport.accountId, account.id)).orderBy(desc(academyPassport.createdAt)),
    db.select().from(academyProgress).where(eq(academyProgress.accountId, account.id)),
  ]);
  const lessons = progress.reduce((s, p) => s + (JSON.parse(p.lessons) as string[]).length, 0);
  const missions = progress.filter(p => (JSON.parse(p.stages) as string[]).length === 12);
  const levels = [
    { l: "L1", t: "Guided basics", ok: lessons > 0, how: lessons > 0 ? `${lessons} lessons completed` : "Complete your first lesson" },
    { l: "L2", t: "Scenario capability", ok: missions.length > 0, how: missions.length ? `${missions.length} mission${missions.length > 1 ? "s" : ""} with all 12 stages recorded` : "Record all twelve stages of a mission" },
    { l: "L3", t: "Published assessment", ok: false, how: hasFeature(plan, "assessment") ? "Submit an evidence pack for rubric review in the DigitalBurj workspace" : "Assessment is included in Professional" },
    { l: "L4", t: "Production delivery", ok: false, how: "Separate claim — needs real production delivery evidence" },
    { l: "L5", t: "Repeated verified delivery", ok: false, how: "Separate claim — repeated, independently verified delivery" },
  ];
  const courses = CATALOG.filter(c => canAccessCourse(plan, c) || progress.some(p => p.courseCode === c.code)).map(c => ({ code: c.code, title: c.title }));
  return <>
    <div><span className="a-eyebrow">Evidence centre</span><h1 className="a-h2" style={{ fontSize: "2.2rem", marginTop: ".5rem" }}>Evidence & Failure Passport</h1><p className="a-muted" style={{ marginTop: ".4rem", maxWidth: "46rem", lineHeight: 1.6 }}>Evidence is the proof behind a learning or capability claim. Failed tests, corrections and reviewer comments stay part of your record — privately. Nothing here is shared unless you choose to.</p></div>
    <section className="a-card">
      <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}><Trophy size={19} color="#fbbf24" /><h2 className="a-h3">Capability Record</h2></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: ".8rem", marginTop: "1rem" }}>
        {levels.map(x => <div key={x.l} className="a-glass" style={{ padding: "1rem", display: "grid", gap: ".45rem", borderColor: x.ok ? "#34d39966" : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong className="a-mono">{x.l}</strong>{x.ok ? <BadgeCheck size={18} color="#34d399" /> : <CircleDashed size={18} className="a-muted" />}</div>
          <p style={{ fontWeight: 750 }}>{x.t}</p><p className="a-muted" style={{ fontSize: ".78rem", lineHeight: 1.5 }}>{x.how}</p>
        </div>)}
      </div>
      <p className="a-muted" style={{ fontSize: ".78rem", marginTop: "1rem" }}>Completion record, assessed submission, independently verified capability and actual workplace experience are shown separately. Assessed missions and credentials are handled in <Link href="/workspace/academy" style={{ textDecoration: "underline" }}>the DigitalBurj workspace</Link>.</p>
    </section>
    <div className="a-two">
      <section className="a-card">
        <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}><ShieldAlert size={19} color="#a78bfa" /><h2 className="a-h3">Failure Passport</h2><span className="a-chip" style={{ marginLeft: "auto" }}>{entries.length} entries</span></div>
        {entries.length ? <div className="a-list" style={{ marginTop: ".6rem" }}>{entries.map(e => <div key={e.id} style={{ display: "grid", gap: ".3rem", alignItems: "start" }}>
          <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", alignItems: "center" }}><span className="a-chip a-chip-violet">{e.courseCode}</span><span className="a-chip">{e.stage}</span><span className="a-muted" style={{ fontSize: ".75rem", marginLeft: "auto" }}>{e.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>
          <p style={{ fontWeight: 650 }}>{e.what}</p>
          <p className="a-muted" style={{ fontSize: ".86rem" }}><strong style={{ color: "var(--tx-2)" }}>Cause:</strong> {e.cause}</p>
          <p className="a-muted" style={{ fontSize: ".86rem" }}><strong style={{ color: "#6ee7b7" }}>Fix:</strong> {e.fix}</p>
        </div>)}</div> : <p className="a-muted" style={{ marginTop: ".8rem" }}>No entries yet. When something breaks during a mission, record what happened, why, and how you fixed it.</p>}
      </section>
      <section className="a-card"><h2 className="a-h3" style={{ marginBottom: "1rem" }}>Add an entry</h2>{courses.length ? <PassportForm courses={courses} initialCourse={course && courseByCode(course) ? course : courses[0].code} /> : <p className="a-muted">Unlock a unit to start recording.</p>}</section>
    </div>
  </>;
}
