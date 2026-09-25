import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { invoices, organizations } from "../../../db/schema";
import { Btn, Chip, Empty, Field, PageHead, Panel, Stat, fmt, money } from "../../_app/kit";
import { AdminShell } from "../shell";
import { adminContext } from "../../../lib/platform";
import { nextStates } from "../../../lib/workflow";
import { createInvoice, setInvoiceStatus } from "./actions";

export const dynamic = "force-dynamic";

export default async function Finance() {
  const { user, roles } = await adminContext("finance");
  const db = getDb();
  const [rows, orgs] = await Promise.all([db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(300), db.select().from(organizations)]);
  const sum = (s: string) => rows.filter(r => r.status === s).reduce((a, b) => a + b.amountMinor, 0);
  const cur = rows[0]?.currency ?? "AED";
  return <AdminShell roles={roles} email={user.email} active="finance">
    <PageHead kicker="Admin · Finance" title="Invoices & payments" lede="Issue invoices, record payments received by bank transfer, void or refund with a reason. Card payment and tax calculation need a payment provider and tax review before launch." />
    <div className="app-grid app-grid-4" style={{ marginBottom: "1rem" }}><Stat label="Receivable" value={money(sum("issued"), cur)} /><Stat label="Collected" value={money(sum("paid"), cur)} /><Stat label="Refunded" value={money(sum("refunded"), cur)} /><Stat label="Drafts" value={rows.filter(r => r.status === "draft").length} /></div>
    <div className="app-split">
      <Panel title="Invoices">{rows.length ? <table className="app-table"><thead><tr><th>Number</th><th>Customer</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td><b>{r.number}</b><div className="app-note">{r.division} · {r.description}</div></td><td>{r.orgId ? orgs.find(o => o.id === r.orgId)?.name : r.customerEmail}<div className="app-note">due {fmt(r.dueAt, false)}</div></td><td>{money(r.amountMinor, r.currency)}</td><td><Chip state={r.status} />{r.statusReason && <div className="app-note">{r.statusReason}</div>}</td><td>{nextStates("invoice", r.status).length > 0 && <form action={setInvoiceStatus} className="app-inline"><input type="hidden" name="id" value={r.id} /><input name="reason" placeholder="Reference / reason" style={{ width: 150 }} />{nextStates("invoice", r.status).map(s => <Btn key={s} kind={s === "void" || s === "refunded" ? "danger" : "secondary"} name="to" value={s}>{s === "issued" ? "Issue" : s === "paid" ? "Mark paid" : s === "void" ? "Void" : "Refund"}</Btn>)}</form>}</td></tr>)}</tbody></table> : <Empty title="No invoices yet" />}</Panel>
      <Panel title="New invoice">
        <form action={createInvoice} className="app-form">
          <Field label="Organization (optional)"><select name="orgId" defaultValue=""><option value="">Individual customer</option>{orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></Field>
          <Field label="Customer email" hint="Required for individuals; must match their sign-in email."><input name="customerEmail" type="email" /></Field>
          <div className="app-form-row"><Field label="Division"><select name="division">{["Academy", "Studio", "Business AI", "Talent", "Jobs", "Platform"].map(d => <option key={d}>{d}</option>)}</select></Field><Field label="Currency"><select name="currency">{["AED", "USD", "SAR", "EUR", "GBP"].map(c => <option key={c}>{c}</option>)}</select></Field><Field label="Due date"><input name="dueAt" type="date" /></Field></div>
          <Field label="Description"><input name="description" required /></Field>
          <Field label="Line items" hint="One per line: Item | amount"><textarea name="lines" required rows={4} placeholder={"Discovery workshop | 4500\nValidation report | 2500"} /></Field>
          <div><Btn>Create draft</Btn></div>
        </form>
      </Panel>
    </div>
  </AdminShell>;
}
