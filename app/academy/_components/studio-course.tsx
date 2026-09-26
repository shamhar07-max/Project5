"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Circle, Eye, FileText, GripVertical, HelpCircle, ListChecks, PlayCircle, Plus, Trash2 } from "lucide-react";
import { courseChecks, courseMinutes, draftCourse, uid, type CourseInput, type CourseOutline, type Lecture, type LectureType } from "../../../lib/academy/studio";
import { ExportButton, GenerateButtons, SaveButton, StudioHeader, download, slug, useStudio, type StudioProps } from "./studio-kit";

const DEFAULT: CourseInput = { topic: "Excel for Small Business", audience: "small business owners and office staff", level: "Beginner", category: "Office Productivity", sections: 7, hours: 4 };
const TYPE_ICON: Record<LectureType, typeof PlayCircle> = { video: PlayCircle, article: FileText, quiz: HelpCircle, assignment: ListChecks };
const hm = (m: number) => `${Math.floor(m / 60)}h ${m % 60}m`;
const lines = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);

export function CourseStudio(props: StudioProps<{ input: CourseInput; course: CourseOutline }>) {
  const s = useStudio("course", props);
  const [input, setInput] = useState<CourseInput>(props.initial?.input ?? DEFAULT);
  const [c, setC] = useState<CourseOutline>(props.initial?.course ?? draftCourse(DEFAULT));
  const [drag, setDrag] = useState<{ s: number; l: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const up = (fn: (x: CourseOutline) => void) => { setC(x => { const y = structuredClone(x); fn(y); return y; }); s.setDirty(true); };
  const checks = courseChecks(c);
  const score = Math.round((checks.filter(x => x.ok).length / checks.length) * 100);
  const minutes = courseMinutes(c);
  const lectures = c.sections.flatMap(x => x.lectures);

  function drop(si: number, li: number) {
    if (!drag) return;
    up(x => { const [m] = x.sections[drag.s].lectures.splice(drag.l, 1); x.sections[si].lectures.splice(li, 0, m); });
    setDrag(null); setOver(null);
  }
  function csv() {
    const rows = [["Section", "Lecture", "Type", "Minutes", "Free preview"], ...c.sections.flatMap((sec, i) => sec.lectures.map(l => [`${i + 1}. ${sec.title}`, l.title, l.type, String(l.minutes), l.preview ? "yes" : "no"]))];
    download(`${slug(c.title)}-curriculum.csv`, rows.map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n"), "text/csv");
  }
  function fromClaude(d: unknown) {
    const x = d as Partial<CourseOutline> & { sections?: { title: string; lectures: Omit<Lecture, "id">[] }[] };
    if (!Array.isArray(x.sections) || !x.sections.length) return;
    setC({ ...draftCourse(input), ...x, category: input.category, level: input.level, price: "Tier 3", sections: x.sections.map(sec => ({ id: uid("s"), title: sec.title, lectures: sec.lectures.map(l => ({ ...l, id: uid("l") })) })) } as CourseOutline);
  }

  return <>
    <StudioHeader eyebrow="Creator Studio · Course Studio" title={c.title}>
      <SaveButton onClick={() => s.save(c.title, { input, course: c })} saving={s.saving} dirty={s.dirty} quota={props.quota} used={props.used} hasId={!!s.id} />
      <button type="button" className="a-btn a-btn-glass a-btn-sm" onClick={() => setPreview(p => !p)}><Eye size={15} />{preview ? "Edit" : "Landing preview"}</button>
      <ExportButton label="JSON" canExport={props.canExport} onClick={() => download(`${slug(c.title)}.json`, JSON.stringify(c, null, 2), "application/json")} />
      <ExportButton label="CSV" canExport={props.canExport} onClick={csv} />
    </StudioHeader>
    <div className="a-studio">
      <div style={{ display: "grid", gap: "1rem", alignContent: "start" }} className="a-studio-form">
        <form className="a-card" style={{ display: "grid", gap: ".8rem" }} onSubmit={e => e.preventDefault()}>
          <p className="a-eyebrow">Course brief</p>
          <label className="a-field"><span>Topic</span><input className="a-input" value={input.topic} onChange={e => setInput({ ...input, topic: e.target.value })} /></label>
          <label className="a-field"><span>Target learners</span><input className="a-input" value={input.audience} onChange={e => setInput({ ...input, audience: e.target.value })} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
            <label className="a-field"><span>Level</span><select className="a-input" value={input.level} onChange={e => setInput({ ...input, level: e.target.value })}>{["Beginner", "Intermediate", "Expert", "All levels"].map(x => <option key={x}>{x}</option>)}</select></label>
            <label className="a-field"><span>Category</span><input className="a-input" value={input.category} onChange={e => setInput({ ...input, category: e.target.value })} /></label>
            <label className="a-field"><span>Sections</span><input className="a-input" type="number" min={3} max={12} value={input.sections} onChange={e => setInput({ ...input, sections: +e.target.value })} /></label>
            <label className="a-field"><span>Video hours</span><input className="a-input" type="number" min={1} max={40} value={input.hours} onChange={e => setInput({ ...input, hours: +e.target.value })} /></label>
          </div>
          <GenerateButtons canAI={props.canAI} aiConfigured={props.aiConfigured} drafting={s.drafting}
            onTemplate={() => { setC(draftCourse(input)); s.setSource("template"); s.setDirty(true); s.toast("Outline generated"); }}
            onClaude={() => s.claude({ ...input }, fromClaude)} />
        </form>
        <div className="a-card" style={{ display: "grid", gap: ".7rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><p style={{ fontWeight: 750 }}>Publish readiness</p><strong style={{ color: score === 100 ? "#34d399" : "#fbbf24" }}>{score}%</strong></div>
          <div className="a-meter"><i style={{ width: `${score}%` }} /></div>
          <ul style={{ display: "grid", gap: ".45rem", fontSize: ".84rem" }}>{checks.map(x => <li key={x.label} style={{ display: "flex", gap: ".5rem", alignItems: "flex-start" }}>{x.ok ? <CheckCircle2 size={16} color="#34d399" style={{ flex: "none" }} /> : <Circle size={16} className="a-muted" style={{ flex: "none" }} />}<span style={{ flex: 1 }}>{x.label}<br /><small className="a-muted">{x.detail}</small></span></li>)}</ul>
          <p className="a-muted" style={{ fontSize: ".72rem", lineHeight: 1.5 }}>Checks are modelled on common course-marketplace minimums; always confirm the current rules of the marketplace you publish on.</p>
        </div>
      </div>

      {preview ? <article className="a-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "2rem", background: "linear-gradient(135deg, #1c1d1f, #2d2f31)", display: "grid", gap: ".8rem" }}>
          <p className="a-muted" style={{ fontSize: ".8rem" }}>{c.category} › {c.level}</p>
          <h2 className="a-h2" style={{ fontSize: "2rem" }}>{c.title}</h2><p style={{ fontSize: "1.05rem", color: "#d1d7dc" }}>{c.subtitle}</p>
          <p className="a-muted" style={{ fontSize: ".85rem" }}>{c.sections.length} sections · {lectures.length} lectures · {hm(minutes)} total length</p>
        </div>
        <div style={{ padding: "1.6rem 2rem", display: "grid", gap: "1.4rem" }}>
          <div className="a-card"><h3 className="a-h3">What you&apos;ll learn</h3><ul className="a-check" style={{ gridTemplateColumns: "1fr 1fr", marginTop: ".8rem" }}>{c.outcomes.map(o => <li key={o}><CheckCircle2 size={15} />{o}</li>)}</ul></div>
          <div><h3 className="a-h3">Course content</h3><div style={{ display: "grid", gap: ".5rem", marginTop: ".8rem" }}>{c.sections.map(sec => <details key={sec.id} className="a-sec-block"><summary className="a-sec-head" style={{ cursor: "pointer" }}><strong style={{ flex: 1 }}>{sec.title}</strong><small className="a-muted">{sec.lectures.length} lectures · {sec.lectures.reduce((a, l) => a + l.minutes, 0)}min</small></summary>{sec.lectures.map(l => { const I = TYPE_ICON[l.type]; return <div key={l.id} className="a-lec" style={{ gridTemplateColumns: "20px 1fr auto auto" }}><I size={15} /><span>{l.title}</span>{l.preview ? <span style={{ color: "#c4b5fd", fontSize: ".8rem" }}>Preview</span> : <span />}<span className="a-muted" style={{ fontSize: ".8rem" }}>{l.minutes}:00</span></div>; })}</details>)}</div></div>
          <div><h3 className="a-h3">Requirements</h3><ul style={{ listStyle: "disc", paddingLeft: "1.2rem", marginTop: ".5rem", display: "grid", gap: ".3rem" }} className="a-muted">{c.requirements.map(r => <li key={r}>{r}</li>)}</ul></div>
          <div><h3 className="a-h3">Description</h3><p className="a-muted" style={{ marginTop: ".5rem", lineHeight: 1.7 }}>{c.promo}</p></div>
          <div><h3 className="a-h3">Who this course is for</h3><ul style={{ listStyle: "disc", paddingLeft: "1.2rem", marginTop: ".5rem", display: "grid", gap: ".3rem" }} className="a-muted">{c.audience.map(r => <li key={r}>{r}</li>)}</ul></div>
        </div>
      </article> : <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}>
        <div className="a-card" style={{ display: "grid", gap: ".8rem" }}>
          <label className="a-field"><span>Course title <small>({c.title.length}/60)</small></span><input className="a-input" value={c.title} maxLength={80} onChange={e => up(x => { x.title = e.target.value; })} /></label>
          <label className="a-field"><span>Subtitle <small>({c.subtitle.length}/160)</small></span><input className="a-input" value={c.subtitle} maxLength={200} onChange={e => up(x => { x.subtitle = e.target.value; })} /></label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: ".7rem" }}>
            <label className="a-field"><span>Learning outcomes <small>(one per line)</small></span><textarea className="a-input" rows={5} value={c.outcomes.join("\n")} onChange={e => up(x => { x.outcomes = lines(e.target.value); })} /></label>
            <label className="a-field"><span>Requirements</span><textarea className="a-input" rows={5} value={c.requirements.join("\n")} onChange={e => up(x => { x.requirements = lines(e.target.value); })} /></label>
            <label className="a-field"><span>Who it&apos;s for</span><textarea className="a-input" rows={5} value={c.audience.join("\n")} onChange={e => up(x => { x.audience = lines(e.target.value); })} /></label>
          </div>
          <label className="a-field"><span>Description</span><textarea className="a-input" rows={3} value={c.promo} onChange={e => up(x => { x.promo = e.target.value; })} /></label>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".5rem" }}><h2 className="a-h3">Curriculum</h2><span className="a-muted" style={{ fontSize: ".85rem" }}>{c.sections.length} sections · {lectures.length} lectures · {hm(minutes)}</span></div>
        {c.sections.map((sec, si) => <div key={sec.id} className="a-sec-block">
          <div className="a-sec-head">
            <span className="a-mono a-muted" style={{ fontSize: ".72rem" }}>S{si + 1}</span>
            <input className="a-editable" style={{ fontWeight: 750 }} value={sec.title} onChange={e => up(x => { x.sections[si].title = e.target.value; })} aria-label={`Section ${si + 1} title`} />
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={si === 0} onClick={() => up(x => { [x.sections[si - 1], x.sections[si]] = [x.sections[si], x.sections[si - 1]]; })} aria-label="Move section up"><ArrowUp size={14} /></button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={si === c.sections.length - 1} onClick={() => up(x => { [x.sections[si + 1], x.sections[si]] = [x.sections[si], x.sections[si + 1]]; })} aria-label="Move section down"><ArrowDown size={14} /></button>
            <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => up(x => { x.sections.splice(si, 1); })} aria-label="Delete section"><Trash2 size={14} /></button>
          </div>
          {sec.lectures.map((l, li) => { const I = TYPE_ICON[l.type]; const key = `${si}-${li}`; return <div key={l.id} className="a-lec" draggable onDragStart={() => setDrag({ s: si, l: li })} onDragOver={e => { e.preventDefault(); setOver(key); }} onDragLeave={() => setOver(o => o === key ? null : o)} onDrop={() => drop(si, li)} data-drag={over === key ? "over" : undefined}>
            <GripVertical size={15} className="grip" aria-hidden="true" />
            <I size={16} color="#a78bfa" />
            <input className="a-editable" value={l.title} onChange={e => up(x => { x.sections[si].lectures[li].title = e.target.value; })} aria-label="Lecture title" />
            <select className="a-editable hide-sm" value={l.type} onChange={e => up(x => { x.sections[si].lectures[li].type = e.target.value as LectureType; })} aria-label="Lecture type" style={{ width: 104 }}>{(["video", "article", "quiz", "assignment"] as LectureType[]).map(t => <option key={t} style={{ background: "#0b1120" }}>{t}</option>)}</select>
            <label className="hide-sm" style={{ display: "flex", gap: ".3rem", alignItems: "center", fontSize: ".75rem" }} title="Free preview"><input type="checkbox" checked={l.preview} onChange={e => up(x => { x.sections[si].lectures[li].preview = e.target.checked; })} style={{ accentColor: "#8b5cf6" }} />Preview</label>
            <span style={{ display: "flex", gap: ".25rem", alignItems: "center" }}><input className="a-editable" type="number" min={1} max={240} value={l.minutes} onChange={e => up(x => { x.sections[si].lectures[li].minutes = Math.max(1, +e.target.value); })} aria-label="Minutes" style={{ width: 52 }} /><small className="a-muted">min</small><button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => up(x => { x.sections[si].lectures.splice(li, 1); })} aria-label="Delete lecture" style={{ minHeight: 28, padding: "0 .4rem" }}><Trash2 size={13} /></button></span>
          </div>; })}
          <div style={{ padding: ".5rem 1rem" }} onDragOver={e => e.preventDefault()} onDrop={() => drop(si, sec.lectures.length)}><button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => up(x => { x.sections[si].lectures.push({ id: uid("l"), title: "New lecture", type: "video", minutes: 5, preview: false }); })}><Plus size={14} />Lecture</button></div>
        </div>)}
        <button type="button" className="a-btn a-btn-glass" onClick={() => up(x => { x.sections.push({ id: uid("s"), title: "New section", lectures: [] }); })}><Plus size={16} />Add section</button>
      </div>}
    </div>
    {s.toastEl}
  </>;
}
