import Link from "next/link";
import Image from "next/image";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { workspaceContext } from "./access";
import { getDb } from "../../db";
import { records } from "../../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { createRecord, updateRecord, deleteRecord } from "./actions";
import { GraduationCap, Layers3, BrainCircuit, BadgeCheck, BriefcaseBusiness, LayoutDashboard } from "lucide-react";

export const dynamic = "force-dynamic";
const modules = [
  { key: "academy", title: "Academy", icon: GraduationCap, description: "Courses, practical missions and learning evidence.", prompt: "Add a learning goal or mission" },
  { key: "studio", title: "Studio", icon: Layers3, description: "Product ideas, projects, milestones and reviews.", prompt: "Add a product project" },
  { key: "business", title: "Business AI", icon: BrainCircuit, description: "Business challenges and improvement initiatives.", prompt: "Add an improvement initiative" },
  { key: "talent", title: "Verified Talent", icon: BadgeCheck, description: "Experience, capability and assessment evidence.", prompt: "Add a portfolio evidence item" },
  { key: "jobs", title: "Jobs", icon: BriefcaseBusiness, description: "Opportunities and application tracking.", prompt: "Add an opportunity to track" },
];

export default async function Workspace({ searchParams }: { searchParams: Promise<{ module?: string }> }) {
  const { user, orgId, role } = await workspaceContext();
  const requested = (await searchParams).module;
  const active = modules.find(m => m.key === requested);
  let items: typeof records.$inferSelect[] = [];
  let unavailable = false;
  try { items = await getDb().select().from(records).where(orgId ? eq(records.orgId, orgId) : and(eq(records.ownerId, user.userId), isNull(records.orgId))).orderBy(desc(records.createdAt)); }
  catch (error) { console.error("Workspace records unavailable", error); unavailable = true; }
  const shown = active ? items.filter(item => item.module === active.key) : items;
  return <div className="min-h-screen bg-[#f2f5f7] text-[#10273c] lg:grid lg:grid-cols-[260px_1fr]">
    <aside className="bg-[#10273c] text-white lg:min-h-screen"><div className="border-b border-white/20 px-6 py-6"><Link href="/" className="workspace-brand" aria-label="DigitalBurj home"><Image src="/brand/db-iconmark.png" width={46} height={46} alt="" unoptimized/><span>DigitalBurj</span></Link><p className="mt-2 text-xs font-semibold uppercase tracking-[.15em] text-[#9eb2c0]">Your workspace</p></div><nav aria-label="Workspace" className="flex gap-1 overflow-x-auto p-3 lg:block">
      <Link href="/workspace" className={`flex shrink-0 items-center gap-3 border-l-4 px-4 py-3 text-sm font-semibold ${!active ? "border-[#e31b23] bg-white/10":"border-transparent hover:bg-white/10"}`}><LayoutDashboard size={19}/> Overview</Link>
      <Link href="/workspace/organizations" className="flex shrink-0 items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-semibold hover:bg-white/10">Organizations</Link>
      <Link href="/workspace/intake" className="flex shrink-0 items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-semibold hover:bg-white/10">Enquiries</Link>
      <Link href="/workspace/support" className="flex shrink-0 items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-semibold hover:bg-white/10">Support</Link>
      <Link href="/workspace/messages" className="flex shrink-0 items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-semibold hover:bg-white/10">Messages</Link>
      <Link href="/workspace/files" className="flex shrink-0 items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-semibold hover:bg-white/10">Files</Link>
      <Link href="/workspace/security" className="flex shrink-0 items-center gap-3 border-l-4 border-transparent px-4 py-3 text-sm font-semibold hover:bg-white/10">Security centre</Link>
      {modules.map(m=><Link key={m.key} href={m.key==="academy"?"/workspace/academy":m.key==="studio"?"/workspace/engagements?service=studio":m.key==="business"?"/workspace/engagements?service=business":`/workspace/${m.key}`} className={`flex shrink-0 items-center gap-3 border-l-4 px-4 py-3 text-sm font-semibold ${active?.key===m.key ? "border-[#e31b23] bg-white/10":"border-transparent hover:bg-white/10"}`}><m.icon size={19}/>{m.title}</Link>)}
    </nav></aside>
    <main className="min-w-0"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d8e1e7] bg-white px-6 py-5 lg:px-10"><span className="font-semibold">DigitalBurj / {active?.title || "Overview"}</span><div className="flex items-center gap-4 text-sm"><span className="max-w-[180px] truncate text-[#52677a]">{user.displayName}</span><a href={chatGPTSignOutPath("/")} className="font-bold text-[#ad1720]">Sign out</a></div></header><div className="mx-auto max-w-6xl px-6 py-9 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#e31b23]">{orgId ? "Organization workspace" : "Individual workspace"} · {active ? active.title : "Overview"}</p><h1 className="mt-2 text-4xl font-bold tracking-[-.05em]">{active?.title || `Welcome, ${user.fullName?.split(" ")[0] || "there"}.`}</h1><p className="mt-3 max-w-2xl text-[#52677a]">{active?.description || "Track your goals and work across DigitalBurj services."}</p>
      {!active && <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(m=><Link href={m.key==="academy"?"/workspace/academy":m.key==="studio"?"/workspace/engagements?service=studio":m.key==="business"?"/workspace/engagements?service=business":`/workspace/${m.key}`} key={m.key} className="group border border-[#d7e0e7] bg-white p-6 hover:border-[#e31b23]"><m.icon size={28} className="text-[#e31b23]"/><h2 className="mt-7 text-xl font-bold">{m.title} <span className="float-right">↗</span></h2><p className="mt-2 text-sm leading-6 text-[#52677a]">{m.description}</p><p className="mt-5 text-sm font-bold">{["academy","studio","business"].includes(m.key)?"Open service →":`${items.filter(x=>x.module===m.key).length} saved items`}</p></Link>)}</div>}
      {active && role !== "guest" && <section className="mt-9 border border-[#d7e0e7] bg-white p-6"><h2 className="text-xl font-bold">{active.prompt}</h2><form action={createRecord} className="mt-5 grid gap-4"><input type="hidden" name="module" value={active.key}/><label className="text-sm font-bold">Title<input name="title" required maxLength={120} placeholder="Give this item a clear name" className="mt-2 block w-full border border-[#b9cad5] p-3 font-normal focus:outline-[#e31b23]"/></label><label className="text-sm font-bold">Details<textarea name="description" maxLength={1000} rows={3} placeholder="What are you working on?" className="mt-2 block w-full border border-[#b9cad5] p-3 font-normal focus:outline-[#e31b23]"/></label><button className="w-fit bg-[#10273c] px-6 py-3 font-bold text-white">Save item</button></form></section>}
      <section className="mt-9"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{active ? "Saved items" : "Recent activity"}</h2><span className="text-sm text-[#52677a]">{shown.length} items</span></div>{unavailable ? <p className="mt-5 border border-[#e31b23] bg-white p-5">Your records are temporarily unavailable. Please try again shortly.</p> : shown.length === 0 ? <p className="mt-5 border border-dashed border-[#b9cad5] bg-white p-8 text-[#52677a]">{active ? "No items yet. Add your first one above." : "No activity yet. Choose a service to start tracking your work."}</p> : <div className="mt-5 space-y-3">{shown.map(item=><article key={item.id} className="border border-[#d7e0e7] bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#e31b23]">{modules.find(m=>m.key===item.module)?.title}</p><h3 className="mt-2 text-lg font-bold">{item.title}</h3>{item.description && <p className="mt-2 whitespace-pre-wrap text-[#52677a]">{item.description}</p>}</div><span className="border border-[#b9cad5] px-3 py-1 text-sm">{item.status}</span></div>{role !== "guest" && (item.ownerId === user.userId || role === "org_owner") && <div className="mt-5 flex flex-wrap gap-4 border-t border-[#e3e9ed] pt-4 text-sm"><form action={updateRecord}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="status" value={item.status==="Complete"?"In progress":"Complete"}/><button className="font-bold text-[#10273c]">{item.status==="Complete"?"Reopen":"Mark complete"}</button></form><form action={deleteRecord}><input type="hidden" name="id" value={item.id}/><button className="font-bold text-[#ad1720]">Delete</button></form></div>}</article>)}</div>}</section>
    </div></main>
  </div>;
}
