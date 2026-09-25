import Link from "next/link";
import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "../../db";
import { engagements, organizations } from "../../db/schema";
import { STAGES } from "../../lib/delivery";
import { Chip, Empty, PageHead, Panel, Stat, fmt } from "../_app/kit";
import { AdminShell } from "./shell";
import { adminContext } from "../../lib/platform";

const copy = {
  studio: { title: "Studio pipeline", lede: "Qualify, validate and decide BUILD / RESHAPE / STOP, then plan milestones, manage change requests and release readiness." },
  business: { title: "Business AI engagements", lede: "Diagnose, baseline and redesign, then run governed automation with measured before/after results." },
};

export async function PipelinePage({ section, stage }: { section: "studio" | "business"; stage?: string }) {
  const { user, roles } = await adminContext(section);
  const db = getDb();
  const [all, orgs] = await Promise.all([
    db.select().from(engagements).where(and(eq(engagements.service, section), ne(engagements.stage, "Draft"))).orderBy(desc(engagements.updatedAt)),
    db.select().from(organizations),
  ]);
  const shown = stage ? all.filter(e => e.stage === stage) : all;
  const counts = STAGES[section].filter(s => s !== "Draft").map(s => [s, all.filter(e => e.stage === s).length] as const).filter(([, n]) => n > 0);
  return <AdminShell roles={roles} email={user.email} active={section}>
    <PageHead kicker={`Admin · ${section === "studio" ? "Studio" : "Business AI"}`} title={copy[section].title} lede={copy[section].lede} />
    {counts.length > 0 && <div className="app-grid app-grid-4" style={{ marginBottom: "1rem" }}>{counts.map(([s, n]) => <Stat key={s} label={s} value={n} href={`/admin/${section}?stage=${encodeURIComponent(s)}`} />)}</div>}
    <Panel title={stage ? `${stage} (${shown.length})` : `All active (${shown.length})`} actions={stage && <Link className="app-btn app-btn-ghost" href={`/admin/${section}`}>Clear filter</Link>}>
      {shown.length ? <div className="app-rows">{shown.map(e => <Link key={e.id} href={`/admin/engagements/${e.id}`} className="app-row"><div className="app-row-main"><strong>{e.title}</strong><small>{orgs.find(o => o.id === e.orgId)?.name ?? "Individual client"} · updated {fmt(e.updatedAt)}</small></div><Chip state={e.stage} text={e.stage} /></Link>)}</div> : <Empty title="Nothing here yet">Engagements appear once a client requests discovery.</Empty>}
    </Panel>
  </AdminShell>;
}
