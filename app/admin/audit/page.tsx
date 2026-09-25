import { and, desc, eq, like } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLog, userDirectory } from "../../../db/schema";
import { Btn, Chip, PageHead, Panel, fmt } from "../../_app/kit";
import { AdminShell } from "../shell";
import { adminContext } from "../../../lib/platform";

export const dynamic = "force-dynamic";

export default async function Audit({ searchParams }: { searchParams: Promise<{ action?: string; decision?: string }> }) {
  const { user, roles } = await adminContext("audit");
  const sp = await searchParams;
  const db = getDb();
  const action = (sp.action ?? "").replace(/[^a-z0-9._]/gi, "").slice(0, 60);
  const rows = await db.select().from(auditLog).where(and(action ? like(auditLog.action, `${action}%`) : undefined, sp.decision === "deny" ? eq(auditLog.decision, "deny") : undefined)).orderBy(desc(auditLog.createdAt)).limit(300);
  const people = await db.select().from(userDirectory);
  const who = (id: string) => people.find(p => p.userId === id)?.email ?? id.slice(0, 10);
  return <AdminShell roles={roles} email={user.email} active="audit">
    <PageHead kicker="Admin · Audit" title="Audit log" lede="Append-only record of privileged and business-critical actions, including denied attempts." />
    <Panel><form className="app-inline"><input name="action" defaultValue={action} placeholder="Action prefix, e.g. academy. or staff.role" style={{ flex: 1 }} /><select name="decision" defaultValue={sp.decision ?? ""} style={{ width: "auto" }}><option value="">All decisions</option><option value="deny">Denied only</option></select><Btn>Filter</Btn></form></Panel>
    <Panel><table className="app-table"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Resource</th><th>Decision</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{fmt(r.createdAt)}</td><td>{who(r.actorId)}</td><td><code>{r.action}</code>{r.reason && <div className="app-note">{r.reason}</div>}</td><td>{r.resource}{r.resourceId ? ` · ${r.resourceId.slice(0, 12)}` : ""}</td><td><Chip state={r.decision === "allow" ? "ACTIVE" : "REJECTED"} text={r.decision} /></td></tr>)}</tbody></table></Panel>
  </AdminShell>;
}
