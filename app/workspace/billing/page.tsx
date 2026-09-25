import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "../../../db";
import { invoices } from "../../../db/schema";
import { AppShell, Chip, Denied, Empty, PageHead, Panel, Stat, fmt, money } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { can } from "../../../lib/platform";

export const dynamic = "force-dynamic";

export default async function Billing() {
  const { ctx, info } = await loadApp();
  if (ctx.orgId && !can(ctx.role, "billing.view")) return <AppShell info={info} active="billing"><PageHead kicker="Billing" title="Invoices" /><Denied>Only the organization owner, admins and billing managers can see this organization&apos;s invoices.</Denied></AppShell>;
  const rows = await getDb().select().from(invoices).where(and(ne(invoices.status, "draft"), ctx.orgId ? eq(invoices.orgId, ctx.orgId) : and(eq(invoices.customerEmail, ctx.user.email.toLowerCase()), isNull(invoices.orgId)))).orderBy(desc(invoices.createdAt));
  const due = rows.filter(r => r.status === "issued");
  const currency = rows[0]?.currency ?? "AED";
  return <AppShell info={info} active="billing">
    <PageHead kicker="Billing" title="Invoices & payments" lede="Invoices issued by DigitalBurj to this context. Online card payment is not connected yet; pay by the bank details on the invoice and our finance team records the payment." />
    <div className="app-grid app-grid-3" style={{ marginBottom: "1rem" }}>
      <Stat label="Outstanding" value={money(due.reduce((n, r) => n + r.amountMinor, 0), currency)} hint={`${due.length} invoice${due.length === 1 ? "" : "s"}`} />
      <Stat label="Paid" value={rows.filter(r => r.status === "paid").length} />
      <Stat label="All invoices" value={rows.length} />
    </div>
    <Panel>
      {rows.length ? <table className="app-table"><thead><tr><th>Number</th><th>Description</th><th>Division</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>
        {rows.map(r => { const lines = JSON.parse(r.lines || "[]") as { item: string; amountMinor: number }[]; return <tr key={r.id}><td><b>{r.number}</b></td><td>{r.description}{lines.length > 1 && <ul className="app-note">{lines.map((l, i) => <li key={i}>{l.item} — {money(l.amountMinor, r.currency)}</li>)}</ul>}</td><td>{r.division}</td><td>{money(r.amountMinor, r.currency)}</td><td>{fmt(r.dueAt, false)}</td><td><Chip state={r.status} />{r.paidAt && <div className="app-note">Paid {fmt(r.paidAt, false)}</div>}</td></tr>; })}
      </tbody></table> : <Empty title="No invoices">Invoices appear here once DigitalBurj issues one to you or your organization.</Empty>}
    </Panel>
  </AppShell>;
}
