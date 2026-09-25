import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { auditLog } from "../../../db/schema";
import { AppShell, Chip, Empty, PageHead, Panel, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { can } from "../../../lib/platform";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { ctx, info } = await loadApp();
  const orgWide = !!ctx.orgId && can(ctx.role, "org.manage");
  const events = await getDb().select().from(auditLog).where(orgWide ? eq(auditLog.orgId, ctx.orgId!) : and(eq(auditLog.actorId, ctx.user.userId), ctx.orgId ? eq(auditLog.orgId, ctx.orgId) : isNull(auditLog.orgId))).orderBy(desc(auditLog.createdAt)).limit(150);
  const denied = events.filter(e => e.decision === "deny");
  return <AppShell info={info} active="security">
    <PageHead kicker="Security center" title="Activity & access" lede={orgWide ? "Every allowed and denied action in this organization, newest first." : "Your recent actions in this context, including anything that was denied."} />
    <div className="app-split">
      <Panel title="Activity log">
        {events.length ? <table className="app-table"><thead><tr><th>When</th><th>Action</th><th>Resource</th><th>Result</th></tr></thead><tbody>{events.map(e => <tr key={e.id}><td>{fmt(e.createdAt)}</td><td>{e.action}</td><td>{e.resource}</td><td><Chip state={e.decision === "allow" ? "ACTIVE" : "REJECTED"} text={e.decision === "allow" ? "Allowed" : `Denied${e.reason ? ` · ${e.reason}` : ""}`} /></td></tr>)}</tbody></table> : <Empty title="No recorded activity yet" />}
      </Panel>
      <div>
        <Panel title="Sign-in & sessions">
          <p className="app-note">Sign-in, multi-factor authentication, sessions and devices are handled by the hosting identity provider (Sign in with ChatGPT). A dedicated DigitalBurj identity service (id.digitalburj.com) with MFA, passkeys and session management is specified in the blueprint and needs an identity provider decision before it can be built.</p>
        </Panel>
        <Panel title="Denied attempts"><p style={{ fontSize: "2rem", fontWeight: 800 }}>{denied.length}</p><p className="app-note">Permission-denied events in the list shown.</p></Panel>
      </div>
    </div>
  </AppShell>;
}
