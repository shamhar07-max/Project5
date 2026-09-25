import type { CSSProperties } from "react";
import { SiteHeader, SiteFooter } from "../site-shell";
import { SectionHead } from "../_ui/sections";
import { componentStatus } from "../../lib/status";

export const dynamic = "force-dynamic";
const tone = (s: string) => s === "OPERATIONAL" ? "ok" : s === "MAINTENANCE" ? "maint" : s === "DEGRADED PERFORMANCE" ? "warn" : "bad";
const pretty = (s: string) => s.toLowerCase().replace(/^\w/, c => c.toUpperCase());

export default async function Status() {
  const { status, overall, recent, updates, checkedAt } = await componentStatus();
  const active = recent.filter(i => !["RESOLVED", "COMPLETED"].includes(i.status));
  const history = recent.filter(i => ["RESOLVED", "COMPLETED"].includes(i.status));
  return <main className="site" style={{ "--a": "#10b981", "--b": "#22d3ee" } as CSSProperties}>
    <SiteHeader />
    <section className="band-tight page-top">
      <div className="wrap">
        <SectionHead index="●" kicker={`Status · checked ${checkedAt.toISOString().slice(11, 16)} UTC`} title={overall === "OPERATIONAL" ? <>All systems <em>operational.</em></> : <>{pretty(overall)} <em>in progress.</em></>}><p>Live checks of the database and file storage, plus incidents and maintenance declared by the DigitalBurj team.</p></SectionHead>
        {active.map(i => <div key={i.id} className={`status-incident st-${tone(i.kind === "maintenance" ? "MAINTENANCE" : i.impact)}`}><strong>{i.title}</strong><span>{pretty(i.status)} · {i.components}</span>{updates.filter(u => u.incidentId === i.id).map(u => <p key={u.id}><b>{pretty(u.status)}</b> · {u.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC — {u.body}</p>)}</div>)}
        <div className="status-grid">{Object.entries(status).map(([c, s]) => <div key={c} className={`status-row st-${tone(s)}`}><span>{c}</span><b>{pretty(s)}</b></div>)}</div>
        <h3 className="h3 subhead">Incident history (90 days)</h3>
        {history.length ? history.map(i => <details key={i.id} className="status-hist"><summary><b>{i.title}</b> · {i.createdAt.toISOString().slice(0, 10)} · {pretty(i.status)}{i.resolvedAt ? ` · ${Math.max(1, Math.round((i.resolvedAt.getTime() - i.startsAt.getTime()) / 60000))} min` : ""}</summary>{updates.filter(u => u.incidentId === i.id).map(u => <p key={u.id}><b>{pretty(u.status)}</b> — {u.body}</p>)}</details>) : <p className="app-note">No incidents in the last 90 days.</p>}
      </div>
    </section>
    <SiteFooter />
  </main>;
}
