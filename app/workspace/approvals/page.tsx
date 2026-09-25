import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "../../../db";
import { approvals } from "../../../db/schema";
import { AppShell, Btn, Chip, Empty, Field, PageHead, Panel, fmt } from "../../_app/kit";
import { approvalScope, loadApp } from "../../_app/shell";
import { decideApproval } from "../platform-actions";

export const dynamic = "force-dynamic";

export default async function Approvals() {
  const { ctx, info } = await loadApp();
  const db = getDb();
  const [pending, decided] = await Promise.all([
    db.select().from(approvals).where(and(approvalScope(ctx), eq(approvals.status, "pending"))).orderBy(desc(approvals.createdAt)),
    db.select().from(approvals).where(and(approvalScope(ctx), ne(approvals.status, "pending"))).orderBy(desc(approvals.decidedAt)).limit(30),
  ]);
  return <AppShell info={info} active="approvals">
    <PageHead kicker="Approval center" title="Decisions waiting on you" lede="Studio milestones and change requests, Business AI automations and hiring offers. Nothing proceeds until the authorized person decides." />
    <Panel title={`Pending (${pending.length})`}>
      {pending.length ? <div className="app-rows">{pending.map(a => <div key={a.id} className="app-row" style={{ alignItems: "flex-start" }}>
        <div className="app-row-main"><strong>{a.title}</strong><small>{a.division} · requested {fmt(a.createdAt)}</small>{a.detail && <p className="app-pre" style={{ marginTop: ".5rem" }}>{a.detail}</p>}</div>
        <form action={decideApproval} className="app-form" style={{ minWidth: 260 }}>
          <input type="hidden" name="id" value={a.id} />
          <Field label="Note (required to reject)"><input name="note" maxLength={500} placeholder="Optional when approving" /></Field>
          <div className="app-inline"><Btn name="decision" value="approve">Approve</Btn><Btn kind="danger" name="decision" value="reject">Reject</Btn></div>
        </form>
      </div>)}</div> : <Empty title="No pending approvals">{ctx.orgId ? "Approvals appear here for roles that can decide them (owner, admin, Studio client owner, Business AI owner, hiring manager)." : "Approvals for your personal projects appear here."}</Empty>}
    </Panel>
    <Panel title="Recently decided">
      {decided.length ? <div className="app-rows">{decided.map(a => <div key={a.id} className="app-row"><div className="app-row-main"><strong>{a.title}</strong><small>{a.division} · {fmt(a.decidedAt)}{a.decisionNote ? ` · “${a.decisionNote}”` : ""}</small></div><Chip state={a.status === "approved" ? "APPROVED" : "REJECTED"} /></div>)}</div> : <Empty title="No decisions yet" />}
    </Panel>
  </AppShell>;
}
