import Link from "next/link";
import { Btn, Chip, Empty, Field, PageHead, Panel, Stat, fmt } from "../../_app/kit";
import { AdminShell } from "../shell";
import { adminContext } from "../../../lib/platform";
import { COMPONENTS, IMPACTS, componentStatus } from "../../../lib/status";
import { nextStates } from "../../../lib/workflow";
import { declareIncident, postUpdate } from "./actions";

export const dynamic = "force-dynamic";

export default async function StatusAdmin() {
  const { user, roles } = await adminContext("status");
  const { status, checks, recent, updates } = await componentStatus();
  const resolved = recent.filter(i => i.resolvedAt && i.kind === "incident");
  const mttr = resolved.length ? Math.round(resolved.reduce((a, i) => a + (i.resolvedAt!.getTime() - i.startsAt.getTime()), 0) / resolved.length / 60000) : null;
  const open = recent.filter(i => !["RESOLVED", "COMPLETED"].includes(i.status));
  return <AdminShell roles={roles} email={user.email} active="status">
    <PageHead kicker="Admin · Status & reliability" title="Incidents & maintenance" lede="Detect → triage → communicate → resolve → verify. Updates publish immediately to the public status page." actions={<Link className="app-btn app-btn-secondary" href="/status">Public page</Link>} />
    <div className="app-grid app-grid-4" style={{ marginBottom: "1rem" }}><Stat label="Database check" value={checks.database.ok ? `${checks.database.ms} ms` : "Failing"} /><Stat label="File storage check" value={checks.storage.ok ? `${checks.storage.ms} ms` : "Failing"} /><Stat label="Incidents (90 days)" value={recent.filter(i => i.kind === "incident").length} /><Stat label="Mean time to resolve" value={mttr === null ? "—" : `${mttr} min`} /></div>
    <div className="app-split">
      <div>
        <Panel title={`Open (${open.length})`}>{open.length ? <div className="app-rows">{open.map(i => <div key={i.id} className="app-row" style={{ alignItems: "flex-start" }}><div className="app-row-main"><strong>{i.title}</strong><small>{i.kind} · {i.impact} · {i.components} · since {fmt(i.startsAt)}</small>{updates.filter(u => u.incidentId === i.id).slice(0, 3).map(u => <p key={u.id} className="app-note">{u.status}: {u.body}</p>)}
          <form action={postUpdate} className="app-form" style={{ marginTop: ".5rem" }}><input type="hidden" name="id" value={i.id} /><div className="app-inline"><select name="status" defaultValue={i.status} style={{ width: "auto" }}><option value={i.status}>{i.status.toLowerCase()} (no change)</option>{nextStates("incident", i.status).map(s => <option key={s} value={s}>{s.toLowerCase()}</option>)}</select><input name="body" required minLength={5} placeholder="Update for customers" style={{ flex: 1 }} /><Btn kind="secondary">Post</Btn></div></form></div><Chip state={i.status} /></div>)}</div> : <Empty title="No open incidents" />}</Panel>
        <Panel title="Component status">{Object.entries(status).map(([c, s]) => <div key={c} className="app-row"><div className="app-row-main"><strong>{c}</strong></div><Chip state={s === "OPERATIONAL" ? "OPERATIONAL" : s} text={s.toLowerCase()} /></div>)}</Panel>
      </div>
      <Panel title="Declare">
        <form action={declareIncident} className="app-form">
          <div className="app-form-row"><Field label="Type"><select name="kind"><option value="incident">Incident</option><option value="maintenance">Scheduled maintenance</option></select></Field><Field label="Impact (incidents)"><select name="impact">{IMPACTS.filter(i => i !== "MAINTENANCE").map(i => <option key={i}>{i}</option>)}</select></Field></div>
          <Field label="Title"><input name="title" required minLength={5} /></Field>
          <Field label="Maintenance start (optional)"><input name="startsAt" type="datetime-local" /></Field>
          <fieldset className="app-inline" style={{ border: 0, padding: 0 }}><legend className="app-note">Affected components</legend>{COMPONENTS.map(c => <label key={c} className="app-check" style={{ marginRight: ".6rem" }}><input type="checkbox" name={`c:${c}`} /> {c}</label>)}</fieldset>
          <Field label="First update"><textarea name="body" required minLength={10} rows={3} placeholder="What customers are experiencing and what we are doing" /></Field>
          <div><Btn>Publish</Btn></div>
        </form>
      </Panel>
    </div>
  </AdminShell>;
}
