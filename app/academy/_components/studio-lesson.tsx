"use client";
import { useState } from "react";
import { Copy, FileDown, Printer } from "lucide-react";
import { draftLessonPlan, type Framework, type LessonInput, type LessonPlanDoc } from "../../../lib/academy/studio";
import { ExportButton, GenerateButtons, SaveButton, StudioHeader, download, slug, useStudio, type StudioProps } from "./studio-kit";

const FRAMEWORKS: Framework[] = ["5E", "Gradual release", "Direct instruction", "Project-based", "Flipped"];
const DEFAULT: LessonInput = { subject: "Science", topic: "Photosynthesis", level: "Grade 7", minutes: 60, framework: "5E", classSize: 26, needs: "2 EAL learners, 1 student with dyslexia", standard: "" };

/** Editable text: commits on blur so typing never fights React. */
function E({ v, on, block }: { v: string; on: (s: string) => void; block?: boolean }) {
  const Tag = block ? "div" : "span";
  return <Tag contentEditable suppressContentEditableWarning onBlur={e => { const t = e.currentTarget.textContent ?? ""; if (t !== v) on(t); }} style={{ outline: "none", borderRadius: 4 }} className="a-doc-edit">{v}</Tag>;
}

function toMarkdown(p: LessonPlanDoc) {
  const list = (xs: string[]) => xs.map(x => `- ${x}`).join("\n");
  return `# ${p.title}\n\n**Subject:** ${p.subject} · **Level:** ${p.level} · **Duration:** ${p.minutes} min · **Framework:** ${p.framework}\n\n## Learning objectives\n${list(p.objectives)}\n\n## Success criteria\n${list(p.successCriteria)}\n\n## Key vocabulary\n${p.vocabulary.join(", ")}\n\n## Materials\n${list(p.materials)}\n\n## Prior knowledge\n${p.priorKnowledge}\n\n## Lesson sequence\n| Phase | Min | Teacher | Students | Check |\n|---|---|---|---|---|\n${p.phases.map(x => `| ${x.name} | ${x.minutes} | ${x.teacher} | ${x.students} | ${x.check} |`).join("\n")}\n\n## Differentiation\n**Support**\n${list(p.differentiation.support)}\n\n**Extension**\n${list(p.differentiation.extension)}\n\n**Language learners**\n${list(p.differentiation.language)}\n\n## Assessment\n**Formative**\n${list(p.assessment.formative)}\n\n**Exit ticket**\n${list(p.assessment.exitTicket)}\n\n## Homework\n${p.homework}\n\n## Teacher reflection\n${list(p.reflection)}\n`;
}

export function LessonStudio(props: StudioProps<{ input: LessonInput; plan: LessonPlanDoc }>) {
  const s = useStudio("lesson", props);
  const [input, setInput] = useState<LessonInput>(props.initial?.input ?? DEFAULT);
  const [plan, setPlan] = useState<LessonPlanDoc>(props.initial?.plan ?? draftLessonPlan(DEFAULT));
  const set = <K extends keyof LessonInput>(k: K, v: LessonInput[K]) => setInput(i => ({ ...i, [k]: v }));
  const edit = (fn: (p: LessonPlanDoc) => LessonPlanDoc) => { setPlan(p => fn(structuredClone(p))); s.setDirty(true); };
  const total = plan.phases.reduce((a, x) => a + x.minutes, 0);

  function fromClaude(d: unknown) {
    const x = d as Partial<LessonPlanDoc>;
    const base = draftLessonPlan(input);
    setPlan({ ...base, ...x, subject: input.subject, level: input.level, minutes: input.minutes, framework: input.framework, phases: Array.isArray(x.phases) && x.phases.length ? x.phases : base.phases } as LessonPlanDoc);
  }

  return <>
    <StudioHeader eyebrow="Creator Studio · AnyLessonPlan" title={plan.title}>
      <SaveButton onClick={() => s.save(plan.title, { input, plan })} saving={s.saving} dirty={s.dirty} quota={props.quota} used={props.used} hasId={!!s.id} />
      <button type="button" className="a-btn a-btn-glass a-btn-sm" onClick={() => window.print()}><Printer size={15} />Print / PDF</button>
      <ExportButton label="Markdown" canExport={props.canExport} onClick={() => download(`${slug(plan.title)}.md`, toMarkdown(plan), "text/markdown")} />
      <ExportButton label="Word" canExport={props.canExport} onClick={() => download(`${slug(plan.title)}.doc`, `<html><meta charset="utf-8"><body>${document.getElementById("lesson-doc")?.innerHTML ?? ""}</body></html>`, "application/msword")} />
      <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => { navigator.clipboard?.writeText(toMarkdown(plan)); s.toast("Copied as Markdown"); }}><Copy size={15} />Copy</button>
    </StudioHeader>
    <div className="a-studio">
      <form className="a-card a-studio-form a-no-print" onSubmit={e => e.preventDefault()}>
        <p className="a-eyebrow">Lesson brief</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
          <label className="a-field"><span>Subject</span><input className="a-input" value={input.subject} onChange={e => set("subject", e.target.value)} /></label>
          <label className="a-field"><span>Level / grade</span><input className="a-input" value={input.level} onChange={e => set("level", e.target.value)} /></label>
        </div>
        <label className="a-field"><span>Topic</span><input className="a-input" value={input.topic} onChange={e => set("topic", e.target.value)} placeholder="e.g. Fractions on a number line" /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
          <label className="a-field"><span>Minutes</span><input className="a-input" type="number" min={20} max={240} value={input.minutes} onChange={e => set("minutes", +e.target.value)} /></label>
          <label className="a-field"><span>Class size</span><input className="a-input" type="number" min={1} max={200} value={input.classSize} onChange={e => set("classSize", +e.target.value)} /></label>
        </div>
        <label className="a-field"><span>Framework</span><select className="a-input" value={input.framework} onChange={e => set("framework", e.target.value as Framework)}>{FRAMEWORKS.map(f => <option key={f}>{f}</option>)}</select></label>
        <label className="a-field"><span>Learner needs <small>(optional)</small></span><textarea className="a-input" rows={2} value={input.needs} onChange={e => set("needs", e.target.value)} /></label>
        <label className="a-field"><span>Standard / curriculum reference <small>(optional)</small></span><input className="a-input" value={input.standard} onChange={e => set("standard", e.target.value)} placeholder="e.g. NGSS MS-LS1-6" /></label>
        <GenerateButtons canAI={props.canAI} aiConfigured={props.aiConfigured} drafting={s.drafting}
          onTemplate={() => { setPlan(draftLessonPlan(input)); s.setSource("template"); s.setDirty(true); s.toast("Draft generated"); }}
          onClaude={() => s.claude({ ...input }, fromClaude)} />
      </form>

      <article className="a-doc" id="lesson-doc">
        <p style={{ font: "700 .7rem var(--f-mono)", letterSpacing: ".16em", color: "#e10613" }}>DIGITALBURJ ACADEMY · LESSON PLAN</p>
        <h2 style={{ marginTop: ".4rem" }}><E v={plan.title} on={t => edit(p => ({ ...p, title: t }))} /></h2>
        <div className="a-doc-meta"><span>{plan.subject}</span><span>{plan.level}</span><span>{plan.minutes} minutes</span><span>{plan.framework}</span>{input.standard && <span>{input.standard}</span>}</div>
        {total !== plan.minutes && <p style={{ marginTop: ".6rem", color: "#b45309", fontSize: ".82rem" }}>Phase timings add up to {total} min (lesson is {plan.minutes} min).</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 2rem" }}>
          <div><h3>Learning objectives</h3><ul>{plan.objectives.map((o, i) => <li key={i}><E v={o} on={t => edit(p => { p.objectives[i] = t; return p; })} /></li>)}</ul></div>
          <div><h3>Success criteria</h3><ul>{plan.successCriteria.map((o, i) => <li key={i}><E v={o} on={t => edit(p => { p.successCriteria[i] = t; return p; })} /></li>)}</ul></div>
          <div><h3>Key vocabulary</h3><p>{plan.vocabulary.join(" · ")}</p><h3>Prior knowledge</h3><p><E v={plan.priorKnowledge} on={t => edit(p => ({ ...p, priorKnowledge: t }))} /></p></div>
          <div><h3>Materials</h3><ul>{plan.materials.map((o, i) => <li key={i}><E v={o} on={t => edit(p => { p.materials[i] = t; return p; })} /></li>)}</ul></div>
        </div>
        <h3>Lesson sequence</h3>
        <div style={{ overflowX: "auto" }}><table><thead><tr><th>Phase</th><th>Min</th><th>Teacher</th><th>Students</th><th>Check for understanding</th></tr></thead>
          <tbody>{plan.phases.map((x, i) => <tr key={i}><td style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{x.name}</td>
            <td><input type="number" min={1} value={x.minutes} onChange={e => edit(p => { p.phases[i].minutes = Math.max(1, +e.target.value); return p; })} style={{ width: 52, border: "1px solid #e5e7eb", borderRadius: 6, padding: "2px 4px" }} aria-label={`${x.name} minutes`} /></td>
            <td><E v={x.teacher} on={t => edit(p => { p.phases[i].teacher = t; return p; })} /></td><td><E v={x.students} on={t => edit(p => { p.phases[i].students = t; return p; })} /></td><td><E v={x.check} on={t => edit(p => { p.phases[i].check = t; return p; })} /></td></tr>)}</tbody></table></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 2rem" }}>
          <div><h3>Support</h3><ul>{plan.differentiation.support.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
          <div><h3>Extension</h3><ul>{plan.differentiation.extension.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
          <div><h3>Language learners</h3><ul>{plan.differentiation.language.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 2rem" }}>
          <div><h3>Formative assessment</h3><ul>{plan.assessment.formative.map((o, i) => <li key={i}>{o}</li>)}</ul></div>
          <div><h3>Exit ticket</h3><ol style={{ paddingLeft: "1.1rem", listStyle: "decimal", display: "grid", gap: ".35rem" }}>{plan.assessment.exitTicket.map((o, i) => <li key={i}><E v={o} on={t => edit(p => { p.assessment.exitTicket[i] = t; return p; })} /></li>)}</ol></div>
        </div>
        <h3>Homework</h3><p><E v={plan.homework} on={t => edit(p => ({ ...p, homework: t }))} /></p>
        <h3>Teacher reflection</h3><ul>{plan.reflection.map((o, i) => <li key={i}>{o}</li>)}</ul>
        <p style={{ marginTop: "2rem", fontSize: ".72rem", color: "#9ca3af" }}>Generated with DigitalBurj Academy AnyLessonPlan · {s.source === "claude" ? "Claude draft" : "template draft"}, reviewed by the teacher. <FileDown size={11} style={{ display: "inline" }} /></p>
      </article>
    </div>
    {s.toastEl}
  </>;
}
