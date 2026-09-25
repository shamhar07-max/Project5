import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { AppShell, Chip, Empty, PageHead, Panel, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { leadTopics, type LeadTopic } from "../../../lib/leads";

export const dynamic = "force-dynamic";

export default async function MyRequests() {
  const { ctx, info } = await loadApp();
  const rows = await getDb().select().from(leads).where(eq(leads.ownerId, ctx.user.userId)).orderBy(desc(leads.createdAt)).limit(100);
  return <AppShell info={info} active="intake">
    <PageHead kicker="Channel requests" title="Requests you started" lede={<>Requests sent from the <Link href="/connect/whatsapp" style={{ textDecoration: "underline" }}>WhatsApp composer</Link> while signed in, with their reference codes.</>} />
    <Panel>{rows.length ? <div className="app-rows">{rows.map(l => <div key={l.id} className="app-row"><div className="app-row-main"><strong><code>{l.reference}</code> · {leadTopics[l.topic as LeadTopic] ?? l.topic}</strong><small>{fmt(l.createdAt)} · {l.message.slice(0, 120)}</small></div><Chip state={l.status === "Closed" ? "CLOSED" : "ACTIVE"} text={l.status} /></div>)}</div> : <Empty title="No requests yet" />}</Panel>
  </AppShell>;
}
