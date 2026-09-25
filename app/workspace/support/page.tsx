import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { supportTickets, ticketMeta } from "../../../db/schema";
import { AppShell, Btn, Chip, Empty, Field, PageHead, Panel, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { TOPICS } from "../../../lib/support";
import { createTicket } from "./actions";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const { ctx, info } = await loadApp();
  const db = getDb();
  const tickets = await db.select().from(supportTickets).where(eq(supportTickets.ownerId, ctx.user.userId)).orderBy(desc(supportTickets.createdAt));
  const metas = tickets.length ? await db.select().from(ticketMeta).where(inArray(ticketMeta.ticketId, tickets.map(t => t.id))) : [];
  return <AppShell info={info} active="support">
    <PageHead kicker="Support" title="How can we help?" lede={<>Tickets keep your context (division, organization and resource) so the right team answers. Try the <Link href="/support" style={{ textDecoration: "underline" }}>knowledge base</Link> for instant answers.</>} />
    <div className="app-split">
      <Panel title="Your tickets">{tickets.length ? <div className="app-rows">{tickets.map(t => { const m = metas.find(x => x.ticketId === t.id); return <Link key={t.id} href={`/workspace/support/${t.id}`} className="app-row"><div className="app-row-main"><strong>{t.topic}</strong><small>{t.message.slice(0, 110)} · {fmt(t.createdAt)}</small></div><Chip state={m?.workflow ?? "NEW"} text={t.status} /></Link>; })}</div> : <Empty title="No tickets yet" />}</Panel>
      <Panel title="New ticket">
        <form action={createTicket} className="app-form">
          <Field label="Topic"><select name="topic" required defaultValue="">{["", ...Object.keys(TOPICS)].map(t => <option key={t} value={t} disabled={!t}>{t || "Choose a topic"}</option>)}</select></Field>
          <Field label="What happened?"><textarea name="message" required minLength={10} maxLength={2000} rows={5} /></Field>
          <label className="app-check"><input type="checkbox" name="urgent" /> This is blocking my work</label>
          <div><Btn>Create ticket</Btn></div>
        </form>
      </Panel>
    </div>
  </AppShell>;
}
