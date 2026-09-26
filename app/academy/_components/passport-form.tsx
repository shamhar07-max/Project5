"use client";
import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { addPassportAction } from "../actions";
import { STAGES } from "../../../lib/academy/curriculum";

export function PassportForm({ courses, initialCourse }: { courses: { code: string; title: string }[]; initialCourse?: string }) {
  const [state, action, pending] = useActionState(addPassportAction, null);
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.fields?.ok) form.current?.reset(); }, [state]);
  return <form ref={form} action={action} style={{ display: "grid", gap: ".8rem" }}>
    {state?.error && <div className="a-alert a-alert-error"><AlertCircle size={17} />{state.error}</div>}
    {state?.fields?.ok && <div className="a-alert a-alert-ok">Recorded in your Failure Passport.</div>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
      <label className="a-field"><span>Unit</span><select className="a-input" name="course" defaultValue={initialCourse}>{courses.map(c => <option key={c.code} value={c.code}>{c.code} · {c.title}</option>)}</select></label>
      <label className="a-field"><span>Stage</span><select className="a-input" name="stage" defaultValue="BREAK">{STAGES.map(s => <option key={s}>{s}</option>)}</select></label>
    </div>
    <label className="a-field"><span>What broke or went wrong?</span><textarea className="a-input" name="what" rows={2} required minLength={5} maxLength={500} /></label>
    <label className="a-field"><span>Cause</span><textarea className="a-input" name="cause" rows={2} required maxLength={500} /></label>
    <label className="a-field"><span>Fix or lesson learned</span><textarea className="a-input" name="fix" rows={2} required maxLength={500} /></label>
    <button className="a-btn a-btn-violet" disabled={pending} style={{ width: "fit-content" }}>{pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}Add entry</button>
  </form>;
}
