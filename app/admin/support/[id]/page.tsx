import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { organizations, supportTickets, ticketMessages, ticketMeta, userDirectory } from "../../../../db/schema";
import { Btn, Chip, Field, PageHead, Panel, fmt } from "../../../_app/kit";
import { AdminShell } from "../../shell";
import { adminContext } from "../../../../lib/platform";
import { PRIORITIES, slaState } from "../../../../lib/support";
import { nextStates } from "../../../../lib/workflow";
import { agentReply, assignToMe, updateTicket } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminTicket({ params }: { params: Promise<{ id: string }> }) {
  const { user, roles } = await adminContext("support");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const t = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).get();
  if (!t) notFound();
  const [meta, msgs, requester, org] = await Promise.all([
    db.select().from(ticketMeta).where(eq(ticketMeta.ticketId, id)).get(),
    db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, id)).orderBy(asc(ticketMessages.createdAt)),
    db.select().from(userDirectory).where(eq(userDirectory.userId, t.ownerId)).get(),
    t.orgId ? db.select().from(organizations).where(eq(organizations.id, t.orgId)).get() : Promise.resolve(undefined),
  ]);
  const wf = meta?.workflow ?? "NEW";
  const sla = slaState(t.createdAt, meta?.priority ?? "normal", meta?.firstResponseAt ?? null, meta?.resolvedAt ?? null);
  return <AdminShell roles={roles} email={user.email} active="support">
    <PageHead back={{ href: "/admin/support", label: "Support desk" }} kicker={`Ticket ${id.slice(0, 8).toUpperCase()} · ${meta?.division ?? "Platform"}`} title={t.topic} actions={<><Chip state={sla.state === "ok" ? "ACTIVE" : sla.state === "risk" ? "PENDING" : "FAILED"} text={sla.label} /><Chip state={wf} /></>} />
    <div className="app-split">
      <Panel title="Conversation">
        <div className="thread">
          <div className="msg"><small>{requester?.email ?? "Customer"} · {fmt(t.createdAt)}</small><p>{t.message}</p></div>
          {msgs.map(m => <div key={m.id} className={`msg ${m.internal ? "internal" : m.authorId === t.ownerId ? "" : "me"}`}><small>{m.internal ? "Internal note · " : ""}{m.authorId === t.ownerId ? requester?.email ?? "Customer" : m.authorLabel} · {fmt(m.createdAt)}</small><p>{m.body}</p></div>)}
        </div>
        {wf !== "CLOSED" && <form action={agentReply} className="app-form" style={{ marginTop: "1rem" }}><input type="hidden" name="id" value={t.id} /><Field label="Reply"><textarea name="body" required rows={4} /></Field><label className="app-check"><input type="checkbox" name="internal" /> Internal note (not visible to the customer)</label><label className="app-check"><input type="checkbox" name="waiting" /> Mark as waiting for customer</label><div><Btn>Send</Btn></div></form>}
      </Panel>
      <div>
        <Panel title="Context"><dl className="app-kv"><dt>Requester</dt><dd>{requester?.name || requester?.email || t.ownerId.slice(0, 10)}</dd><dt>Organization</dt><dd>{org?.name ?? "Individual"}</dd><dt>Created</dt><dd>{fmt(t.createdAt)}</dd><dt>First response</dt><dd>{fmt(meta?.firstResponseAt)}</dd><dt>Resolved</dt><dd>{fmt(meta?.resolvedAt)}</dd><dt>Assignee</dt><dd>{meta?.assigneeEmail || "Unassigned"}</dd></dl>
          {meta?.assigneeId !== user.userId && <form action={assignToMe} style={{ marginTop: ".8rem" }}><input type="hidden" name="id" value={t.id} /><Btn kind="secondary">Assign to me</Btn></form>}
        </Panel>
        <Panel title="Triage">
          <form action={updateTicket} className="app-form"><input type="hidden" name="id" value={t.id} />
            <Field label="Priority"><select name="priority" defaultValue={meta?.priority ?? "normal"}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Division"><select name="division" defaultValue={meta?.division ?? "Platform"}>{["Platform", "Academy", "Studio", "Business AI", "Talent", "Jobs"].map(d => <option key={d}>{d}</option>)}</select></Field>
            <Field label="Status"><select name="workflow" defaultValue={wf}><option value={wf}>{wf.replace(/_/g, " ").toLowerCase()} (current)</option>{nextStates("ticket", wf).map(s => <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>)}</select></Field>
            <div><Btn>Save</Btn></div>
          </form>
        </Panel>
      </div>
    </div>
  </AdminShell>;
}
