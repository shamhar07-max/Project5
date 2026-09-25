import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { supportTickets, ticketMessages, ticketMeta } from "../../../../db/schema";
import { AppShell, Btn, Chip, Field, PageHead, Panel, fmt } from "../../../_app/kit";
import { loadApp } from "../../../_app/shell";
import { replyAsCustomer } from "../actions";

export const dynamic = "force-dynamic";

export default async function Ticket({ params }: { params: Promise<{ id: string }> }) {
  const { ctx, info } = await loadApp();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const t = await db.select().from(supportTickets).where(and(eq(supportTickets.id, id), eq(supportTickets.ownerId, ctx.user.userId))).get();
  if (!t) notFound();
  const [meta, msgs] = await Promise.all([db.select().from(ticketMeta).where(eq(ticketMeta.ticketId, id)).get(), db.select().from(ticketMessages).where(and(eq(ticketMessages.ticketId, id), eq(ticketMessages.internal, false))).orderBy(asc(ticketMessages.createdAt))]);
  return <AppShell info={info} active="support">
    <PageHead back={{ href: "/workspace/support", label: "Support" }} kicker={`Ticket · ${meta?.division ?? "Platform"} · ref ${id.slice(0, 8).toUpperCase()}`} title={t.topic} actions={<Chip state={meta?.workflow ?? "NEW"} text={t.status} />} />
    <Panel>
      <div className="thread">
        <div className="msg me"><small>You · {fmt(t.createdAt)}</small><p>{t.message}</p></div>
        {msgs.map(m => <div key={m.id} className={`msg ${m.authorId === ctx.user.userId ? "me" : ""}`}><small>{m.authorId === ctx.user.userId ? "You" : `${m.authorLabel} · DigitalBurj`} · {fmt(m.createdAt)}</small><p>{m.body}</p></div>)}
      </div>
      {meta?.workflow !== "CLOSED" && <form action={replyAsCustomer} className="app-form" style={{ marginTop: "1rem" }}><input type="hidden" name="ticketId" value={t.id} /><Field label={meta?.workflow === "RESOLVED" ? "Reply to reopen" : "Reply"}><textarea name="body" required minLength={2} rows={3} /></Field><div><Btn>Send</Btn></div></form>}
    </Panel>
  </AppShell>;
}
