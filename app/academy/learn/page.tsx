import Link from "next/link";
import type { CSSProperties } from "react";
import { and, desc, eq, gte } from "drizzle-orm";
import { ArrowRight, BookOpen, CheckCircle2, Clapperboard, FileText, Flame, LayoutTemplate, Lock, PartyPopper, Presentation, Sparkles, Target, Trophy } from "lucide-react";
import { getDb } from "../../../db";
import { academyActivity, academyCreations, academyOrders, academyPassport, academyProgress } from "../../../db/schema";
import { requireAcademyAccount } from "../../../lib/academy/auth";
import { accessFor } from "../../../lib/academy/access";
import { CATALOG, PATHWAYS, courseByCode } from "../../../lib/academy/catalog";
import { allLessons, courseDetail, STAGES } from "../../../lib/academy/curriculum";
import { TOOL_META, canAccessCourse, canUseTool, planById, type StudioTool } from "../../../lib/academy/plans";
import { ActivityChart } from "../_components/activity-chart";

export const metadata = { title: "My learning · DigitalBurj Academy" };

const TOOL_ICON: Record<StudioTool, typeof FileText> = { video: Clapperboard, lesson: FileText, course: LayoutTemplate, slides: Presentation };
const ROUTE_START: Record<string, string> = { "Technology": "DB-00", "Professional workplace": "PF-01", "Teaching & content creation": "DB-01", "International readiness": "PF-01" };

/** Midnight at the start of an n-day window ending today. */
function windowStart(days: number) {
  const d = new Date(Date.now() - (days - 1) * 86_400_000);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string; activated?: string }> }) {
  const sp = await searchParams;
  const account = await requireAcademyAccount("/academy/learn");
  const { plan, daysLeft } = await accessFor(account.id);
  const db = getDb();
  const since = windowStart(14);
  const [progress, creations, activity, recent, passport, pending] = await Promise.all([
    db.select().from(academyProgress).where(eq(academyProgress.accountId, account.id)).orderBy(desc(academyProgress.updatedAt)),
    db.select({ id: academyCreations.id, tool: academyCreations.tool, title: academyCreations.title, updatedAt: academyCreations.updatedAt }).from(academyCreations).where(eq(academyCreations.accountId, account.id)).orderBy(desc(academyCreations.updatedAt)),
    db.select().from(academyActivity).where(and(eq(academyActivity.accountId, account.id), gte(academyActivity.createdAt, since))),
    db.select().from(academyActivity).where(eq(academyActivity.accountId, account.id)).orderBy(desc(academyActivity.createdAt)).limit(7),
    db.select({ id: academyPassport.id }).from(academyPassport).where(eq(academyPassport.accountId, account.id)),
    db.select().from(academyOrders).where(and(eq(academyOrders.accountId, account.id), eq(academyOrders.status, "payment_pending"))),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(since.getTime() + i * 86_400_000); return { key: d.toDateString(), day: d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }), label: d.toLocaleDateString("en-GB", { day: "numeric" }), n: 0 }; });
  for (const a of activity) { const d = days.find(x => x.key === a.createdAt.toDateString()); if (d) d.n++; }
  let streak = 0; for (let i = days.length - 1; i >= 0 && days[i].n > 0; i--) streak++;
  const stagesDone = progress.reduce((s, p) => s + (JSON.parse(p.stages) as string[]).length, 0);
  const lessonsDone = progress.reduce((s, p) => s + (JSON.parse(p.lessons) as string[]).length, 0);
  const unlocked = CATALOG.filter(c => canAccessCourse(plan, c));
  const current = progress[0] ? courseDetail(progress[0].courseCode) : null;
  const currentLessons = current ? allLessons(current) : [];
  const currentDone = current ? (JSON.parse(progress[0].lessons) as string[]).length : 0;
  const currentStages = current ? (JSON.parse(progress[0].stages) as string[]) : [];
  const nextLesson = current ? currentLessons.find(l => !(JSON.parse(progress[0].lessons) as string[]).includes(l.id)) : null;
  const startCode = ROUTE_START[account.route] ?? "DB-00";
  const start = courseByCode(canAccessCourse(plan, courseByCode(startCode)!) ? startCode : unlocked[0]?.code ?? "DB-00")!;
  const pathway = PATHWAYS.find(p => p.includes.includes(current?.code ?? start.code)) ?? PATHWAYS[0];

  return <>
    {sp.activated && planById[sp.activated as keyof typeof planById] && <div className="a-alert a-alert-ok"><PartyPopper size={18} />{planById[sp.activated as keyof typeof planById].name} is active on your account. Everything it includes is now unlocked.</div>}
    {sp.welcome && <div className="a-alert a-alert-info"><Sparkles size={18} />Welcome to DigitalBurj Academy, {account.name.split(" ")[0]}. You&apos;re on Explorer — start with {start.code} {start.title}, or try the Lesson Plan tool.</div>}
    {pending.length > 0 && <div className="a-alert a-alert-warn"><Lock size={18} />You have {pending.length} order{pending.length > 1 ? "s" : ""} awaiting payment confirmation. <Link href="/academy/learn/account" style={{ textDecoration: "underline", marginLeft: 4 }}>View</Link></div>}

    <section className="a-card" style={{ padding: "clamp(1.3rem, 3vw, 2rem)", background: "radial-gradient(100% 140% at 100% 0%, #8b5cf633, transparent 55%), radial-gradient(80% 120% at 0% 100%, #e1061322, transparent 50%), #0b1120", display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "center" }}>
      <div style={{ display: "grid", gap: ".6rem" }}>
        <span className="a-eyebrow">{plan.name}{daysLeft !== null ? ` · ${daysLeft} days left` : ""}</span>
        <h1 className="a-h2" style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.6rem)" }}>Welcome back, {account.name.split(" ")[0]}.</h1>
        <p className="a-muted">Route: {account.route || "Technology"} · {account.availability || "flexible"} a week{account.goal ? ` · Goal: ${account.goal}` : ""}</p>
      </div>
      <div style={{ display: "flex", gap: ".8rem", alignItems: "center" }} className="a-glass"><div style={{ padding: ".9rem 1.1rem", display: "flex", gap: ".6rem", alignItems: "center" }}><Flame size={22} color="#fb923c" /><div><strong style={{ fontSize: "1.4rem" }}>{streak}</strong><p className="a-muted" style={{ fontSize: ".72rem" }}>day streak</p></div></div></div>
    </section>

    <section className="a-kpis">
      {[[BookOpen, "Units unlocked", unlocked.length, `of ${CATALOG.length}`], [CheckCircle2, "Lessons completed", lessonsDone, "across all units"], [Target, "Mission stages", stagesDone, "12 per mission"], [Sparkles, "Studio projects", creations.length, plan.toolQuota ? `${plan.toolQuota} per tool` : "unlimited"]].map(([I, t, v, s], i) => { const Icon = I as typeof BookOpen; return <div key={t as string} className="a-card a-kpi" data-reveal="up" style={{ "--i": i } as CSSProperties}><div style={{ display: "flex", justifyContent: "space-between" }}><span className="a-muted" style={{ fontSize: ".82rem", fontWeight: 650 }}>{t as string}</span><Icon size={17} color="#a78bfa" /></div><strong>{v as number}</strong><span className="a-muted" style={{ fontSize: ".75rem" }}>{s as string}</span></div>; })}
    </section>

    <div className="a-two">
      <div style={{ display: "grid", gap: "1.25rem" }}>
        <section className="a-card" style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}><h2 className="a-h3">Continue learning</h2>{current && <span className="a-chip">{current.code}</span>}</div>
          {current ? <>
            <div><p style={{ fontWeight: 800, fontSize: "1.2rem" }}>{current.title}</p><p className="a-muted" style={{ fontSize: ".88rem", marginTop: ".2rem" }}>Next: {nextLesson ? nextLesson.title : "All lessons complete — finish your mission"}</p></div>
            <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem" }} className="a-muted"><span>{currentDone}/{currentLessons.length} lessons</span><span>{currentStages.length}/12 stages</span></div><div className="a-meter" style={{ marginTop: ".4rem" }}><i style={{ width: `${Math.round(((currentDone + currentStages.length) / (currentLessons.length + 12)) * 100)}%` }} /></div></div>
            <div style={{ display: "flex", gap: ".25rem", flexWrap: "wrap" }}>{STAGES.map(s => <span key={s} className={`a-chip ${currentStages.includes(s) ? "a-chip-green" : ""}`} style={{ fontSize: ".58rem" }}>{s}</span>)}</div>
            <Link href={`/academy/learn/courses/${current.code}`} className="a-btn a-btn-primary" style={{ width: "fit-content" }}>Resume <ArrowRight size={16} /></Link>
          </> : <>
            <p className="a-muted">Recommended for your route: <strong style={{ color: "var(--tx)" }}>{start.code} · {start.title}</strong></p>
            <Link href={`/academy/learn/courses/${start.code}`} className="a-btn a-btn-primary" style={{ width: "fit-content" }}>Start {start.code} <ArrowRight size={16} /></Link>
          </>}
        </section>
        <section className="a-card">
          <h2 className="a-h3">Learning activity</h2>
          <p className="a-muted" style={{ fontSize: ".8rem", margin: ".2rem 0 .8rem" }}>Actions per day, last 14 days</p>
          <ActivityChart data={days.map(({ day, label, n }) => ({ day, label, n }))} />
        </section>
        <section className="a-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 className="a-h3">Creator Studio</h2><Link href="/academy/learn/studio" className="a-btn a-btn-ghost a-btn-sm">Open <ArrowRight size={14} /></Link></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: ".7rem", marginTop: "1rem" }}>
            {(Object.keys(TOOL_META) as StudioTool[]).map(t => { const Icon = TOOL_ICON[t]; const ok = canUseTool(plan, t); return <Link key={t} href={ok ? TOOL_META[t].href : "/academy/pricing"} className={`a-glass ${ok ? "" : "a-locked"}`} style={{ padding: "1rem", display: "grid", gap: ".5rem" }}><div style={{ display: "flex", justifyContent: "space-between" }}><Icon size={20} color="#a78bfa" />{!ok && <Lock size={14} className="a-muted" />}</div><strong style={{ fontSize: ".9rem" }}>{TOOL_META[t].short}</strong><span className="a-muted" style={{ fontSize: ".72rem" }}>{ok ? `${creations.filter(c => c.tool === t).length} saved` : "Upgrade to unlock"}</span></Link>; })}
          </div>
        </section>
      </div>
      <div style={{ display: "grid", gap: "1.25rem" }}>
        <section className="a-card">
          <h2 className="a-h3">Your pathway</h2>
          <p className="a-muted" style={{ fontSize: ".85rem", marginTop: ".2rem" }}>{pathway.name} — {pathway.outcome}</p>
          <ol style={{ display: "grid", gap: ".5rem", marginTop: "1rem" }}>{pathway.includes.map((code, i) => { const c = courseByCode(code)!; const ok = canAccessCourse(plan, c); const p = progress.find(x => x.courseCode === code); return <li key={code}><Link href={`/academy/learn/courses/${code}`} style={{ display: "flex", gap: ".7rem", alignItems: "center", padding: ".6rem", borderRadius: 12, border: "1px solid var(--line)" }}><span className="a-icon-tile" style={{ width: 30, height: 30, borderRadius: 9, fontSize: ".72rem", fontWeight: 800 }}>{i + 1}</span><span style={{ flex: 1, fontSize: ".86rem", fontWeight: 650 }}>{c.title}</span>{ok ? (p ? <span className="a-chip a-chip-violet">In progress</span> : <span className="a-chip">Open</span>) : <Lock size={14} className="a-muted" />}</Link></li>; })}</ol>
        </section>
        <section className="a-card">
          <h2 className="a-h3">Recent activity</h2>
          {recent.length ? <div className="a-list" style={{ marginTop: ".5rem" }}>{recent.map(r => <div key={r.id} style={{ fontSize: ".85rem" }}><span className="a-chip" style={{ fontSize: ".6rem" }}>{r.kind}</span><span style={{ flex: 1 }}>{r.detail}</span><span className="a-muted" style={{ fontSize: ".72rem", whiteSpace: "nowrap" }}>{r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></div>)}</div> : <p className="a-muted" style={{ marginTop: ".6rem", fontSize: ".88rem" }}>Nothing yet — complete a lesson to get started.</p>}
        </section>
        <section className="a-card" style={{ display: "grid", gap: ".6rem" }}>
          <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}><Trophy size={18} color="#fbbf24" /><h2 className="a-h3">Evidence</h2></div>
          <p className="a-muted" style={{ fontSize: ".85rem" }}>{passport.length} Failure Passport entr{passport.length === 1 ? "y" : "ies"} · {progress.filter(p => (JSON.parse(p.stages) as string[]).length === 12).length} mission{progress.length === 1 ? "" : "s"} complete</p>
          <Link href="/academy/learn/evidence" className="a-btn a-btn-glass a-btn-sm" style={{ width: "fit-content" }}>Open evidence centre</Link>
        </section>
      </div>
    </div>
  </>;
}
