import Link from "next/link";
import { cookies } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { organizations, memberships } from "../../../db/schema";
import { createOrganization, inviteMember, acceptInvitation, switchOrganization } from "./actions";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const user = await requireChatGPTUser("/workspace/organizations");
  const db = getDb();
  const mine = await db.select().from(memberships).where(eq(memberships.email, user.email.toLowerCase()));
  const active = mine.filter(m => m.status === "active" && m.userId === user.userId);
  const invites = mine.filter(m => m.status === "invited");
  const orgs = mine.length ? await db.select().from(organizations).where(inArray(organizations.id, mine.map(m => m.orgId))) : [];
  const selectedId = (await cookies()).get("db_org")?.value;
  const selected = active.find(m => m.orgId === selectedId);
  const members = selected ? await db.select().from(memberships).where(eq(memberships.orgId, selected.orgId)) : [];
  return <main className="min-h-screen bg-[#f2f5f7] text-[#10273c]"><header className="bg-[#10273c] px-6 py-5 text-white"><div className="mx-auto flex max-w-5xl items-center justify-between"><Link href="/workspace" className="font-bold">← Workspace</Link><span className="font-extrabold">DIGITAL<span className="text-[#ff555b]">BURJ</span></span></div></header><div className="mx-auto max-w-5xl px-6 py-12"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#e31b23]">Account context</p><h1 className="mt-2 text-4xl font-bold">Organizations</h1><p className="mt-3 text-[#52677a]">Work as an individual or switch to an organization you belong to.</p>
    <section className="mt-9 grid gap-4 md:grid-cols-2"><form action={switchOrganization} className="border border-[#d7e0e7] bg-white p-6"><h2 className="text-xl font-bold">Individual workspace</h2><p className="mt-2 text-[#52677a]">Your personal goals and records.</p><input type="hidden" name="orgId" value=""/><button className="mt-5 bg-[#10273c] px-5 py-3 font-bold text-white">{!selected ? "Current context" : "Switch to individual"}</button></form>{active.map(m => { const org = orgs.find(o => o.id === m.orgId); return <form action={switchOrganization} key={m.id} className="border border-[#d7e0e7] bg-white p-6"><h2 className="text-xl font-bold">{org?.name || "Organization"}</h2><p className="mt-2 capitalize text-[#52677a]">{m.role.replace("_", " ")}</p><input type="hidden" name="orgId" value={m.orgId}/><button className="mt-5 bg-[#10273c] px-5 py-3 font-bold text-white">{selected?.orgId === m.orgId ? "Current context" : "Switch to organization"}</button></form> })}</section>
    {!!invites.length && <section className="mt-10"><h2 className="text-2xl font-bold">Invitations</h2><div className="mt-4 space-y-3">{invites.map(m=><form action={acceptInvitation} key={m.id} className="flex flex-wrap items-center justify-between gap-4 border border-[#d7e0e7] bg-white p-5"><span>{orgs.find(o=>o.id===m.orgId)?.name} invited you as a member</span><input type="hidden" name="id" value={m.id}/><button className="font-bold text-[#a91620]">Accept invitation</button></form>)}</div></section>}
    {selected?.role === "org_owner" && <section className="mt-10 border border-[#d7e0e7] bg-white p-6"><h2 className="text-2xl font-bold">Members</h2><div className="mt-4 space-y-2">{members.map(m=><p key={m.id} className="flex justify-between border-b border-[#e3e9ed] py-2"><span>{m.email}</span><span className="capitalize text-[#52677a]">{m.status} · {m.role.replace("_"," ")}</span></p>)}</div><form action={inviteMember} className="mt-7 flex flex-wrap gap-3"><input type="hidden" name="orgId" value={selected.orgId}/><label className="flex-1 text-sm font-bold">Invite a member<input name="email" type="email" required placeholder="colleague@example.com" className="mt-2 block w-full border border-[#b9cad5] p-3 font-normal"/></label><button className="self-end bg-[#10273c] px-5 py-3 font-bold text-white">Create invitation</button></form><p className="mt-3 text-sm text-[#52677a]">The person can accept after they have access to this private site and sign in with the same email. Email delivery is not connected yet.</p></section>}
    <section className="mt-10 border border-[#d7e0e7] bg-white p-6"><h2 className="text-2xl font-bold">Create an organization</h2><p className="mt-2 text-[#52677a]">You will be its owner. Business verification and paid seats are not enabled yet.</p><form action={createOrganization} className="mt-5 flex flex-wrap gap-3"><label className="flex-1 text-sm font-bold">Organization name<input name="name" required minLength={2} maxLength={100} className="mt-2 block w-full border border-[#b9cad5] p-3 font-normal"/></label><button className="self-end bg-[#10273c] px-5 py-3 font-bold text-white">Create organization</button></form></section>
  </div></main>;
}
