"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, ClipboardList, FileCheck2, Lightbulb, Lock, PlayCircle, Target, Wrench } from "lucide-react";
import type { CourseDetail, Lesson } from "../../../lib/academy/curriculum";
import { STAGES } from "../../../lib/academy/curriculum";
import { toggleLessonAction, toggleStageAction } from "../actions";
import { Toast } from "./app-shell";

type Props = { detail: CourseDetail; allowed: boolean; missions: boolean; upgradeName: string; upgradeId: string; missionUpgradeName: string; initialLessons: string[]; initialStages: string[]; stageHelp: Record<string, string> };

export function Player({ detail: d, allowed, missions, upgradeName, upgradeId, missionUpgradeName, initialLessons, initialStages, stageHelp }: Props) {
  const lessons = d.modules.flatMap(m => m.lessons);
  const freeId = lessons[0]?.id;
  const [done, setDone] = useState<string[]>(initialLessons);
  const [stages, setStages] = useState<string[]>(initialStages);
  const [view, setView] = useState<string>(() => lessons.find(l => !initialLessons.includes(l.id))?.id ?? "mission");
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const lesson = lessons.find(l => l.id === view) ?? null;
  const canOpen = (l: Lesson) => allowed || l.id === freeId;
  const idx = lesson ? lessons.indexOf(lesson) : lessons.length;
  const pct = Math.round(((done.length + stages.length) / (lessons.length + 12)) * 100);

  function markLesson(id: string, v: boolean) {
    start(async () => {
      try { setDone(await toggleLessonAction(d.code, id, v)); if (v) setToast("Lesson completed"); }
      catch (e) { setToast(e instanceof Error ? e.message : "Could not save"); }
    });
  }
  function markStage(s: string, v: boolean) {
    start(async () => {
      try { setStages(await toggleStageAction(d.code, s, v)); if (v) setToast(`${s} complete`); }
      catch (e) { setToast(e instanceof Error ? e.message : "Could not save"); }
    });
  }

  return <>
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
      <div>
        <Link href="/academy/learn/courses" className="a-muted" style={{ fontSize: ".82rem" }}>← My courses</Link>
        <div style={{ display: "flex", gap: ".4rem", marginTop: ".6rem", flexWrap: "wrap" }}><span className="a-chip a-chip-violet">{d.code}</span><span className="a-chip">{d.family}</span><span className="a-chip">{d.level}</span>{!d.authored && <span className="a-chip a-chip-amber">Outline — full materials in production</span>}</div>
        <h1 className="a-h2" style={{ fontSize: "clamp(1.6rem, 3vw, 2.3rem)", marginTop: ".6rem" }}>{d.title}</h1>
      </div>
      <div style={{ minWidth: 220 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: ".78rem" }} className="a-muted"><span>Progress</span><span>{pct}%</span></div><div className="a-meter" style={{ marginTop: ".4rem" }}><i style={{ width: `${pct}%` }} /></div></div>
    </div>

    {!allowed && <div className="a-alert a-alert-warn"><Lock size={18} style={{ flex: "none" }} /><span>You&apos;re previewing this unit. The first lesson is free; the rest of the unit and its mission are included from <strong>{upgradeName}</strong>. <Link href={`/academy/checkout?plan=${upgradeId}`} style={{ textDecoration: "underline" }}>Upgrade</Link></span></div>}

    <div className="a-player">
      <nav className="a-card a-toc" aria-label="Unit contents">
        {d.modules.map((m, mi) => <div key={m.id}>
          <h4>Module {mi + 1} · {m.title}</h4>
          {m.lessons.map(l => <button key={l.id} type="button" aria-current={view === l.id} onClick={() => canOpen(l) ? setView(l.id) : setToast(`Included from ${upgradeName}`)}>
            {done.includes(l.id) ? <CheckCircle2 size={16} color="#34d399" style={{ flex: "none", marginTop: 2 }} /> : canOpen(l) ? <Circle size={16} style={{ flex: "none", marginTop: 2 }} /> : <Lock size={15} style={{ flex: "none", marginTop: 2 }} />}
            <span style={{ flex: 1 }}>{l.title}<br /><small className="a-muted">{l.kind} · {l.minutes} min</small></span>
          </button>)}
        </div>)}
        <h4>Practical mission</h4>
        <button type="button" aria-current={view === "mission"} onClick={() => setView("mission")}><Target size={16} style={{ flex: "none", marginTop: 2 }} /><span style={{ flex: 1 }}>{d.mission.title}<br /><small className="a-muted">{stages.length}/12 stages</small></span></button>
      </nav>

      <div style={{ display: "grid", gap: "1.2rem", minWidth: 0 }}>
        {lesson ? <article className="a-card" style={{ padding: "clamp(1.3rem, 3vw, 2.2rem)" }}>
          <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }} className="a-muted">{lesson.kind === "watch" ? <PlayCircle size={16} /> : lesson.kind === "practice" ? <Wrench size={16} /> : <BookOpen size={16} />}<span style={{ fontSize: ".8rem", textTransform: "capitalize" }}>{lesson.kind} · {lesson.minutes} minutes</span></div>
          <h2 className="a-h2" style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)", marginTop: ".6rem" }}>{lesson.title}</h2>
          <p className="a-lede" style={{ marginTop: ".4rem" }}>{lesson.summary}</p>
          {lesson.kind === "watch" && <div className="a-stage16" style={{ marginTop: "1.2rem", display: "grid", placeItems: "center", background: "radial-gradient(100% 100% at 100% 0%, #2e1065, #070b16 60%)" }}><div style={{ textAlign: "center", padding: "1rem" }}><PlayCircle size={46} color="#a78bfa" /><p style={{ fontWeight: 700, marginTop: ".5rem" }}>Video lesson in production</p><p className="a-muted" style={{ fontSize: ".85rem" }}>Read the transcript below in the meantime.</p></div></div>}
          <div className="a-lesson-body">{lesson.body.map((p, i) => <p key={i}>{p}</p>)}</div>
          <div className="a-glass" style={{ marginTop: "1.5rem", padding: "1.1rem 1.2rem" }}><p style={{ fontWeight: 750, display: "flex", gap: ".5rem", alignItems: "center" }}><Lightbulb size={17} color="#fbbf24" />Key points</p><ul className="a-check" style={{ marginTop: ".7rem" }}>{lesson.keyPoints.map(k => <li key={k}><CheckCircle2 size={15} />{k}</li>)}</ul></div>
          {lesson.check && <Quiz key={lesson.id} check={lesson.check} />}
          <div style={{ display: "flex", justifyContent: "space-between", gap: ".6rem", flexWrap: "wrap", marginTop: "1.6rem" }}>
            <button type="button" className="a-btn a-btn-glass" disabled={idx === 0} onClick={() => setView(lessons[idx - 1].id)}><ArrowLeft size={16} />Previous</button>
            <div style={{ display: "flex", gap: ".6rem" }}>
              <button type="button" className={`a-btn ${done.includes(lesson.id) ? "a-btn-glass" : "a-btn-violet"}`} disabled={pending} onClick={() => markLesson(lesson.id, !done.includes(lesson.id))}>{done.includes(lesson.id) ? <><CheckCircle2 size={16} />Completed</> : "Mark complete"}</button>
              <button type="button" className="a-btn a-btn-primary" onClick={() => { const n = lessons[idx + 1]; if (!n) setView("mission"); else if (canOpen(n)) setView(n.id); else setToast(`Included from ${upgradeName}`); }}>Next <ArrowRight size={16} /></button>
            </div>
          </div>
        </article> : mission()}
      </div>
    </div>
    <Toast msg={toast} onDone={() => setToast(null)} />
  </>;

  function mission() {
    const next = STAGES.find(s => !stages.includes(s));
    return <article className="a-card" style={{ padding: "clamp(1.3rem, 3vw, 2.2rem)", display: "grid", gap: "1.3rem" }}>
      <div><p className="a-eyebrow">Practical mission</p><h2 className="a-h2" style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)", marginTop: ".5rem" }}>{d.mission.title}</h2><p className="a-lede" style={{ marginTop: ".5rem" }}>{d.mission.scenario}</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
        <div className="a-glass" style={{ padding: "1rem" }}><p style={{ fontWeight: 750, display: "flex", gap: ".4rem", alignItems: "center" }}><FileCheck2 size={16} />Deliverables</p><ul className="a-check" style={{ marginTop: ".6rem" }}>{d.mission.deliverables.map(x => <li key={x}><CheckCircle2 size={15} />{x}</li>)}</ul></div>
        <div className="a-glass" style={{ padding: "1rem" }}><p style={{ fontWeight: 750, display: "flex", gap: ".4rem", alignItems: "center" }}><ClipboardList size={16} />Constraints</p><ul className="a-check" style={{ marginTop: ".6rem" }}>{d.mission.constraints.map(x => <li key={x}><Lock size={14} />{x}</li>)}</ul></div>
      </div>
      <div><p style={{ fontWeight: 750 }}>Rubric</p><div style={{ display: "grid", gap: ".55rem", marginTop: ".6rem" }}>{d.mission.rubric.map(([t, w]) => <div key={t}><div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem" }}><span>{t}</span><strong>{w}%</strong></div><div className="a-meter" style={{ marginTop: ".3rem" }}><i style={{ width: `${w * 2.5}%` }} /></div></div>)}</div></div>
      {missions ? <div style={{ display: "grid", gap: ".8rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}><p style={{ fontWeight: 750 }}>Stage tracker · {stages.length}/12</p>{next && <span className="a-muted" style={{ fontSize: ".82rem" }}>Next: <strong style={{ color: "var(--tx)" }}>{next}</strong> — {stageHelp[next]}</span>}</div>
        <div className="a-stages">{STAGES.map((s, i) => <button key={s} type="button" className="a-stage" data-done={stages.includes(s)} aria-pressed={stages.includes(s)} disabled={pending} title={stageHelp[s]} onClick={() => markStage(s, !stages.includes(s))}><span>{stages.includes(s) ? "✓" : String(i + 1).padStart(2, "0")}</span>{s}</button>)}</div>
        {stages.length === 12 && <div className="a-alert a-alert-ok"><CheckCircle2 size={18} />All twelve stages recorded. Assemble your evidence pack — assessment by a reviewer is a separate step.</div>}
        <p className="a-muted" style={{ fontSize: ".8rem" }}>Something broke along the way? Record it in your <Link href={`/academy/learn/evidence?course=${d.code}`} style={{ textDecoration: "underline" }}>Failure Passport</Link> — useful failures are part of your evidence.</p>
      </div> : <div className="a-alert a-alert-warn"><Lock size={18} style={{ flex: "none" }} />Mission tracking for this unit is included from {allowed ? missionUpgradeName : upgradeName}.<Link href="/academy/pricing" style={{ textDecoration: "underline", marginLeft: 4 }}>Compare packages</Link></div>}
      <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap" }}>{d.tools.map(t => <span key={t} className="a-chip">{t}</span>)}</div>
    </article>;
  }
}

function Quiz({ check }: { check: NonNullable<Lesson["check"]> }) {
  const [pick, setPick] = useState<number | null>(null);
  return <div style={{ marginTop: "1.5rem", display: "grid", gap: ".7rem" }}>
    <p style={{ fontWeight: 750 }}>Knowledge check</p>
    <p>{check.q}</p>
    <div className="a-quiz" style={{ display: "grid", gap: ".5rem" }}>{check.options.map((o, i) => <button key={o} type="button" data-state={pick === null ? undefined : i === check.answer ? (pick === i || pick !== null ? "right" : undefined) : pick === i ? "wrong" : undefined} onClick={() => setPick(i)} aria-pressed={pick === i}><span className="a-mono a-muted">{String.fromCharCode(65 + i)}</span>{o}</button>)}</div>
    {pick !== null && <div className={`a-alert ${pick === check.answer ? "a-alert-ok" : "a-alert-warn"}`} role="status">{pick === check.answer ? "Correct. " : "Not quite. "}{check.why}</div>}
  </div>;
}
