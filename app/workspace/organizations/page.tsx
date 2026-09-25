import { cookies } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { employerVerifications, memberships, organizations } from "../../../db/schema";
import { AppShell, Btn, Chip, Empty, Field, PageHead, Panel } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { can, ORG_ROLES } from "../../../lib/platform";
import { acceptInvitation, changeRole, createOrganization, inviteMember, removeMember, requestEmployerVerification, switchOrganization } from "./actions";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const { ctx, info } = await loadApp();
  const user = ctx.user;
  const db = getDb();
  const mine = await db.select().from(memberships).where(eq(memberships.email, user.email.toLowerCase()));
  const active = mine.filter(m => m.status === "active" && m.userId === user.userId);
  const invites = mine.filter(m => m.status === "invited");
  const orgs = mine.length ? await db.select().from(organizations).where(inArray(organizations.id, mine.map(m => m.orgId))) : [];
  const selectedId = (await cookies()).get("db_org")?.value;
  const selected = active.find(m => m.orgId === selectedId);
  const manage = selected ? can(selected.role, "org.manage") : false;
  const [members, verification] = selected ? await Promise.all([
    db.select().from(memberships).where(eq(memberships.orgId, selected.orgId)),
    db.select().from(employerVerifications).where(eq(employerVerifications.orgId, selected.orgId)).get(),
  ]) : [[], undefined];
  const assignable = Object.entries(ORG_ROLES).filter(([k]) => k !== "org_owner" && (k !== "admin" || selected?.role === "org_owner"));
  return <AppShell info={info} active="organizations">
    <PageHead kicker="Identity & organizations" title="Organizations" lede="Work as an individual or inside an organization. Switching context changes which records you can see and change everywhere." />
    {invites.length > 0 && <Panel title="Invitations" tone="info">{invites.map(i => <form key={i.id} action={acceptInvitation} className="app-row"><input type="hidden" name="id" value={i.id} /><div className="app-row-main"><strong>{orgs.find(o => o.id === i.orgId)?.name ?? "Organization"}</strong><small>Role: {ORG_ROLES[i.role as keyof typeof ORG_ROLES] ?? i.role}</small></div><Btn>Accept</Btn></form>)}</Panel>}
    <div className="app-grid app-grid-3" style={{ marginBottom: "1rem" }}>
      <form action={switchOrganization} className="app-panel"><input type="hidden" name="orgId" value="" /><h2 style={{ fontWeight: 800 }}>Personal workspace</h2><p className="app-note" style={{ margin: ".4rem 0 1rem" }}>Your own learning, profile and projects.</p><Btn kind={!selected ? "primary" : "secondary"} disabled={!selected}>{!selected ? "Current context" : "Switch here"}</Btn></form>
      {active.map(m => <form key={m.id} action={switchOrganization} className="app-panel"><input type="hidden" name="orgId" value={m.orgId} /><h2 style={{ fontWeight: 800 }}>{orgs.find(o => o.id === m.orgId)?.name ?? "Organization"}</h2><p className="app-note" style={{ margin: ".4rem 0 1rem" }}>{ORG_ROLES[m.role as keyof typeof ORG_ROLES] ?? m.role}</p><Btn kind={selected?.orgId === m.orgId ? "primary" : "secondary"} disabled={selected?.orgId === m.orgId}>{selected?.orgId === m.orgId ? "Current context" : "Switch here"}</Btn></form>)}
    </div>
    {selected && <div className="app-split">
      <Panel title="Members & roles" sub={manage ? "Owners can grant admin; owners and admins manage other roles. An organization always keeps at least one owner." : "Only owners and admins can change membership."}>
        <div className="app-rows">{members.map(m => <div key={m.id} className="app-row">
          <div className="app-row-main"><strong>{m.email}</strong><small>{m.status === "invited" ? "Invitation pending" : "Active"}</small></div>
          {manage && m.userId !== user.userId ? <>
            <form action={changeRole} className="app-inline"><input type="hidden" name="membershipId" value={m.id} /><select name="role" defaultValue={m.role} aria-label={`Role for ${m.email}`} style={{ width: "auto" }}>{Object.entries(ORG_ROLES).filter(([k]) => selected.role === "org_owner" || !["org_owner", "admin"].includes(k) || k === m.role).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><Btn kind="secondary">Save</Btn></form>
            <form action={removeMember}><input type="hidden" name="membershipId" value={m.id} /><Btn kind="ghost">Remove</Btn></form>
          </> : <Chip state="ACTIVE" text={ORG_ROLES[m.role as keyof typeof ORG_ROLES] ?? m.role} />}
        </div>)}</div>
        {manage && <form action={inviteMember} className="app-form" style={{ marginTop: "1rem" }}><input type="hidden" name="orgId" value={selected.orgId} /><div className="app-form-row"><Field label="Invite by email"><input name="email" type="email" required placeholder="colleague@example.com" /></Field><Field label="Role"><select name="role" defaultValue="member">{assignable.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div><div><Btn>Create invitation</Btn></div><p className="app-note">They accept after signing in with the same email. Email delivery is not connected yet, so share the link to DigitalBurj with them.</p></form>}
      </Panel>
      <div>
        <Panel title="Employer verification" sub="Verified employers can publish jobs and search consenting Talent profiles.">
          {verification ? <p><Chip state={verification.status === "VERIFIED" ? "VERIFIED" : verification.status === "REJECTED" ? "REJECTED" : "PENDING"} /> <span className="app-note">{verification.companyName}{verification.note ? ` · ${verification.note}` : ""}</span></p> : <p className="app-note">Not requested yet.</p>}
          {manage && verification?.status !== "VERIFIED" && <form action={requestEmployerVerification} className="app-form" style={{ marginTop: ".8rem" }}><input type="hidden" name="orgId" value={selected.orgId} /><Field label="Registered company name"><input name="companyName" required defaultValue={verification?.companyName ?? orgs.find(o => o.id === selected.orgId)?.name} /></Field><Field label="Website"><input name="website" placeholder="https://" defaultValue={verification?.website} /></Field><Field label="Trade licence / registration number"><input name="registration" defaultValue={verification?.registration} /></Field><div><Btn kind="secondary">{verification ? "Resubmit" : "Request verification"}</Btn></div></form>}
        </Panel>
      </div>
    </div>}
    <Panel title="Create an organization">
      <form action={createOrganization} className="app-inline"><input name="name" required minLength={2} maxLength={100} placeholder="Organization name" aria-label="Organization name" style={{ flex: 1 }} /><Btn>Create</Btn></form>
      {!active.length && <Empty title="You are not in an organization yet">Create one to invite colleagues, share projects and hire.</Empty>}
    </Panel>
  </AppShell>;
}
