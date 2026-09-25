import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { supportTickets, ticketMeta } from "../../../db/schema";
import { Chip, Empty, PageHead, Panel, Stat, fmt, withinHours } from "../../_app/kit";
import { AdminShell, Tabs } from "../shell";
import { adminContext } from "../../../lib/platform";
import { slaState } from "../../../lib/support";

export const dynamic = "force-dynamic";

export default async function SupportDesk({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { user, roles } = await adminContext("support");
  const tab = (await searchParams).tab ?? "open";
  const db = getDb();
  const [tickets, metas] = await Promise.all([db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt)).limit(400), db.select().from(ticketMeta)]);
  const rows = tickets.map(t => { const m = metas.find(x => x.ticketId === t.id); const wf = m?.workflow ?? "NEW"; return { t, m, wf, sla: slaState(t.createdAt, m?.priority ?? "normal", m?.firstResponseAt ?? null, m?.resolvedAt ?? null) }; });
  const open = rows.filter(r => !["RESOLVED", "CLOSED"].includes(r.wf));
  const lists: Record<string, typeof rows> = { open, mine: open.filter(r => r.m?.assigneeId === user.userId), unassigned: open.filter(r => !r.m?.assigneeId), risk: open.filter(r => r.sla.state !== "ok"), waiting: open.filter(r => r.wf === "WAITING_FOR_CUSTOMER"), resolved: rows.filter(r => ["RESOLVED", "CLOSED"].includes(r.wf)) };
  const shown = lists[tab] ?? open;
  const today = rows.filter(r => withinHours(r.m?.resolvedAt, 24)).length;
  return <AdminShell roles={roles} email={user.email} active="support">
    <PageHead kicker="Admin · Support desk" title="Agent dashboard" lede="Tickets keep requester, organization and division context. Targets depend on priority: urgent 1h/8h, high 4h/24h, normal 24h/72h, low 48h/120h." />
    <div className="app-grid app-grid-4" style={{ marginBottom: "1rem" }}><Stat label="Open" value={open.length} /><Stat label="Unassigned" value={lists.unassigned.length} /><Stat label="SLA risk / breached" value={lists.risk.length} /><Stat label="Resolved today" value={today} /></div>
    <Tabs base="/admin/support" active={tab} tabs={[["open", "All open"], ["mine", `Assigned to me (${lists.mine.length})`], ["unassigned", "Unassigned"], ["risk", "SLA risk"], ["waiting", "Waiting for customer"], ["resolved", "Resolved"]]} />
    <Panel>{shown.length ? <div className="app-rows">{shown.map(({ t, m, wf, sla }) => <Link key={t.id} href={`/admin/support/${t.id}`} className="app-row"><div className="app-row-main"><strong>{t.topic}</strong><small>{m?.division ?? "Platform"} · {m?.priority ?? "normal"} · {fmt(t.createdAt)} · {m?.assigneeEmail || "unassigned"}</small></div>{sla.state !== "ok" && <Chip state={sla.state === "breached" ? "FAILED" : "PENDING"} text={sla.label} />}<Chip state={wf} /></Link>)}</div> : <Empty title="Nothing in this view" />}</Panel>
  </AdminShell>;
}
