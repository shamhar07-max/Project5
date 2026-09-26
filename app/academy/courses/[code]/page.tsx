import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock, FileCheck2, Gauge, Lock, PlayCircle, Target, Wrench } from "lucide-react";
import { PublicFrame } from "../../_components/chrome";
import { courseDetail, lessonMinutes, STAGES } from "../../../../lib/academy/curriculum";
import { PLANS, canAccessCourse, cheapestPlanFor } from "../../../../lib/academy/plans";
import { PATHWAYS } from "../../../../lib/academy/catalog";
import { getAcademyAccount } from "../../../../lib/academy/auth";
import { accessFor } from "../../../../lib/academy/access";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const d = courseDetail((await params).code);
  return { title: d ? `${d.code} ${d.title} · DigitalBurj Academy` : "Unit not found" };
}

export default async function CoursePage({ params }: { params: Promise<{ code: string }> }) {
  const d = courseDetail((await params).code);
  if (!d) notFound();
  const account = await getAcademyAccount().catch(() => null);
  const access = account ? await accessFor(account.id) : null;
  const unlocked = access ? canAccessCourse(access.plan, d) : false;
  const min = cheapestPlanFor(p => canAccessCourse(p, d));
  const plans = PLANS.filter(p => canAccessCourse(p, d));
  const paths = PATHWAYS.filter(p => p.includes.includes(d.code));
  const cta = !account ? { href: `/academy/register?next=/academy/learn/courses/${d.code}`, label: "Register free to start" } : unlocked ? { href: `/academy/learn/courses/${d.code}`, label: "Open in my learning" } : { href: `/academy/checkout?plan=${min.id}`, label: `Unlock with ${min.name}` };
  return <PublicFrame active="/academy/catalogue">
    <section className="a-hero" style={{ paddingBottom: "3rem" }}>
      <div className="a-aurora" aria-hidden="true" style={{ opacity: .45 }}><i /><i /><i /></div>
      <div className="a-shell a-two" style={{ position: "relative", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "1.2rem" }}>
          <Link href="/academy/catalogue" className="a-muted" style={{ fontSize: ".85rem" }}>← Catalogue</Link>
          <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}><span className="a-chip a-chip-violet">{d.code}</span><span className="a-chip">{d.family}</span><span className="a-chip">{d.level}</span><span className={`a-chip ${d.authored ? "a-chip-green" : "a-chip-amber"}`}>{d.authored ? "Full lessons available" : `${d.maturity} · outline`}</span></div>
          <h1 className="a-h1" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>{d.title}</h1>
          <p className="a-lede">{d.purpose}</p>
          <div style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap" }} className="a-muted">
            <span style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}><Clock size={16} />{d.hours} learning hours</span>
            <span style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}><BookOpen size={16} />{d.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons · {lessonMinutes(d)} min core</span>
            <span style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}><Gauge size={16} />Prerequisite: {d.prereq}</span>
          </div>
        </div>
        <aside className="a-card a-beam" style={{ display: "grid", gap: "1rem", position: "sticky", top: 90 }}>
          <p className="a-eyebrow">Access</p>
          {unlocked ? <div className="a-alert a-alert-ok"><CheckCircle2 size={18} style={{ flex: "none" }} />Included in your {access!.plan.name} package.</div> : <div className="a-alert a-alert-info"><Lock size={18} style={{ flex: "none" }} /><span>Included from <strong>{min.name}</strong>. The first lesson is free for everyone.</span></div>}
          <Link href={cta.href} className="a-btn a-btn-primary a-btn-block a-btn-lg">{cta.label} <ArrowRight size={17} /></Link>
          <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap" }}>{plans.map(p => <span key={p.id} className="a-chip">{p.name}</span>)}</div>
          <p className="a-muted" style={{ fontSize: ".78rem", lineHeight: 1.5 }}>Completing this unit does not by itself establish independent verification, employment, a licence or accreditation.</p>
        </aside>
      </div>
    </section>

    <section className="a-sec" style={{ paddingTop: "1rem" }}>
      <div className="a-shell a-two">
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div className="a-card"><h2 className="a-h3" style={{ fontSize: "1.3rem", display: "flex", gap: ".5rem", alignItems: "center" }}><Target size={20} color="#a78bfa" />What you will be able to do</h2>
            <ul className="a-check" style={{ marginTop: "1rem" }}>{d.outcomes.map(o => <li key={o}><CheckCircle2 size={16} />{o}</li>)}</ul></div>
          <div className="a-card"><h2 className="a-h3" style={{ fontSize: "1.3rem" }}>Curriculum</h2>
            <div style={{ display: "grid", gap: ".8rem", marginTop: "1rem" }}>{d.modules.map((m, i) => <details key={m.id} open={i === 0} className="a-sec-block"><summary className="a-sec-head" style={{ cursor: "pointer" }}><strong style={{ flex: 1 }}>Module {i + 1} · {m.title}</strong><span className="a-muted" style={{ fontSize: ".8rem" }}>{m.lessons.length} lessons · {m.lessons.reduce((s, l) => s + l.minutes, 0)} min</span></summary>
              {m.lessons.map((l, k) => <div key={l.id} className="a-lec" style={{ gridTemplateColumns: "22px 1fr auto auto" }}>{l.kind === "watch" ? <PlayCircle size={16} /> : <BookOpen size={16} />}<span>{l.title}<br /><small className="a-muted">{l.summary}</small></span><span className="a-chip">{l.kind}</span>{i === 0 && k === 0 ? <span className="a-chip a-chip-green">Free</span> : <span className="a-muted" style={{ fontSize: ".8rem" }}>{l.minutes}m</span>}</div>)}
            </details>)}</div></div>
        </div>
        <div style={{ display: "grid", gap: "1.25rem" }}>
          <div className="a-card"><p className="a-eyebrow">Practical mission</p><h2 className="a-h3" style={{ fontSize: "1.25rem", marginTop: ".6rem" }}>{d.mission.title}</h2><p className="a-muted" style={{ marginTop: ".6rem", lineHeight: 1.6 }}>{d.mission.scenario}</p>
            <h3 style={{ fontWeight: 750, marginTop: "1.1rem", display: "flex", gap: ".4rem", alignItems: "center" }}><FileCheck2 size={16} />Deliverables</h3><ul className="a-check" style={{ marginTop: ".6rem" }}>{d.mission.deliverables.map(x => <li key={x}><CheckCircle2 size={15} />{x}</li>)}</ul>
            <h3 style={{ fontWeight: 750, marginTop: "1.1rem" }}>Rubric</h3>
            <div style={{ display: "grid", gap: ".55rem", marginTop: ".6rem" }}>{d.mission.rubric.map(([t, w]) => <div key={t}><div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem" }}><span>{t}</span><strong>{w}%</strong></div><div className="a-meter" style={{ marginTop: ".3rem" }}><i style={{ width: `${w * 2.5}%` }} /></div></div>)}</div>
          </div>
          <div className="a-card"><h3 style={{ fontWeight: 750, display: "flex", gap: ".4rem", alignItems: "center" }}><Wrench size={16} />Tools</h3><div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginTop: ".7rem" }}>{d.tools.map(t => <span key={t} className="a-chip">{t}</span>)}</div>
            <h3 style={{ fontWeight: 750, marginTop: "1.1rem" }}>Mission stages</h3><div style={{ display: "flex", gap: ".3rem", flexWrap: "wrap", marginTop: ".7rem" }}>{STAGES.map((s, i) => <span key={s} className="a-chip" style={{ "--i": i } as CSSProperties}>{s}</span>)}</div></div>
          {paths.length > 0 && <div className="a-card"><h3 style={{ fontWeight: 750 }}>Part of these pathways</h3><div className="a-list" style={{ marginTop: ".4rem" }}>{paths.map(p => <Link key={p.id} href={`/academy/pathways#${p.id}`}><span style={{ flex: 1, fontWeight: 650 }}>{p.name}</span><ArrowRight size={15} /></Link>)}</div></div>}
        </div>
      </div>
    </section>
  </PublicFrame>;
}
