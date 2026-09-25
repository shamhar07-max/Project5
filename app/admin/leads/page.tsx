import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { Btn, Chip, Empty, PageHead, Panel, fmt } from "../../_app/kit";
import { AdminShell } from "../shell";
import { adminContext } from "../../../lib/platform";
import { leadTimings, leadTopics, type LeadTopic } from "../../../lib/leads";
import { updateLeadStatus } from "./actions";

export const dynamic = "force-dynamic";
const STATUSES = ["New", "Contacted", "Routed", "Closed"];

export default async function LeadsAdmin() {
  const { user, roles } = await adminContext("leads");
  const rows = await getDb().select().from(leads).orderBy(desc(leads.createdAt)).limit(300);
  return <AdminShell roles={roles} email={user.email} active="leads">
    <PageHead kicker="Admin · Channel requests" title="WhatsApp, web & mobile requests" lede="Every request from the guided composer, with its reference code. Update the status as each one is contacted and routed." />
    <Panel>{rows.length ? <div className="app-rows">{rows.map(l => <div key={l.id} className="app-row" style={{ alignItems: "flex-start" }}>
      <div className="app-row-main"><strong><code>{l.reference}</code> · {leadTopics[l.topic as LeadTopic] ?? l.topic}{l.intent ? ` · ${l.intent}` : ""}</strong><small>{l.name}{l.company ? ` · ${l.company}` : ""} · {l.contact} · via {l.channel}{l.timing ? ` · ${leadTimings[l.timing] ?? l.timing}` : ""} · {fmt(l.createdAt)}</small><p className="app-pre" style={{ marginTop: ".3rem" }}>{l.message}</p></div>
      <Chip state={l.status === "New" ? "NEW" : l.status === "Closed" ? "CLOSED" : "ACTIVE"} text={l.status} />
      <div className="app-inline">{STATUSES.filter(s => s !== l.status).map(s => <form key={s} action={updateLeadStatus}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value={s} /><Btn kind="ghost">{s}</Btn></form>)}</div>
    </div>)}</div> : <Empty title="No requests yet" />}</Panel>
  </AdminShell>;
}
