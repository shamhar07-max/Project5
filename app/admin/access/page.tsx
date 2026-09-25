import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { staffRoles, userDirectory } from "../../../db/schema";
import { Btn, Chip, Empty, Field, PageHead, Panel, fmt } from "../../_app/kit";
import { AdminShell, Tabs } from "../shell";
import { adminContext, bootstrapStaffEmails, STAFF_ROLES } from "../../../lib/platform";
import { grantRole, revokeRole, setSuspension } from "./actions";

export const dynamic = "force-dynamic";

export default async function Access({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { user, roles } = await adminContext("access");
  const tab = (await searchParams).tab ?? "staff";
  const db = getDb();
  const [staff, users] = await Promise.all([db.select().from(staffRoles).orderBy(desc(staffRoles.createdAt)), db.select().from(userDirectory).orderBy(desc(userDirectory.lastSeenAt)).limit(300)]);
  return <AdminShell roles={roles} email={user.email} active="access">
    <PageHead kicker="Admin · Identity & access" title="Least privilege, fully audited" lede="Grant only the roles a person needs. Every grant, revocation and suspension records who did it and why." />
    <Tabs base="/admin/access" active={tab} tabs={[["staff", `Staff roles (${staff.length})`], ["users", `Users (${users.length})`]]} />
    {tab === "staff" && <div className="app-split">
      <Panel title="Staff roles">
        <p className="app-note" style={{ marginBottom: ".6rem" }}>Bootstrap Super Admins from DIGITALBURJ_STAFF_EMAILS: {bootstrapStaffEmails().join(", ") || "none"}.</p>
        {staff.length ? <div className="app-rows">{staff.map(s => <div key={s.id} className="app-row"><div className="app-row-main"><strong>{s.email}</strong><small>Granted {fmt(s.createdAt, false)}</small></div><Chip state="ACTIVE" text={STAFF_ROLES[s.role as keyof typeof STAFF_ROLES] ?? s.role} /><form action={revokeRole} className="app-inline"><input type="hidden" name="id" value={s.id} /><input name="reason" required minLength={5} placeholder="Reason" style={{ width: 150 }} /><Btn kind="danger">Revoke</Btn></form></div>)}</div> : <Empty title="No roles granted yet" />}
      </Panel>
      <Panel title="Grant a role"><form action={grantRole} className="app-form"><Field label="Email"><input name="email" type="email" required /></Field><Field label="Role"><select name="role">{Object.entries(STAFF_ROLES).filter(([k]) => k !== "super_admin" || roles.has("super_admin")).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field><Field label="Reason"><input name="reason" required minLength={5} /></Field><div><Btn>Grant</Btn></div></form></Panel>
    </div>}
    {tab === "users" && <Panel title="People who have signed in">{users.length ? <table className="app-table"><thead><tr><th>Person</th><th>First seen</th><th>Last seen</th><th>Status</th><th /></tr></thead><tbody>{users.map(u => <tr key={u.userId}><td><b>{u.name || u.email}</b><div className="app-note">{u.email}</div></td><td>{fmt(u.firstSeenAt, false)}</td><td>{fmt(u.lastSeenAt)}</td><td>{u.suspendedAt ? <Chip state="REJECTED" text={`Suspended · ${u.suspendedReason}`} /> : <Chip state="ACTIVE" />}</td><td>{u.userId !== user.userId && <form action={setSuspension} className="app-inline"><input type="hidden" name="userId" value={u.userId} /><input type="hidden" name="suspend" value={u.suspendedAt ? "0" : "1"} /><input name="reason" required minLength={5} placeholder="Reason" style={{ width: 140 }} /><Btn kind={u.suspendedAt ? "secondary" : "danger"}>{u.suspendedAt ? "Reinstate" : "Suspend"}</Btn></form>}</td></tr>)}</tbody></table> : <Empty title="Nobody has signed in yet" />}</Panel>}
  </AdminShell>;
}
