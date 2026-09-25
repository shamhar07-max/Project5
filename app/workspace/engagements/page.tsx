import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { engagements, enquiries } from "../../../db/schema";
import { workspaceContext } from "../access";
import { startEngagement } from "./actions";

export const dynamic = "force-dynamic";
export default async function EngagementsPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const ctx = await workspaceContext();
  const service = (await searchParams).service === "business" ? "business" : "studio";
  const db = getDb();
  const filter = ctx.orgId ? eq(engagements.orgId, ctx.orgId) : and(eq(engagements.ownerId, ctx.user.userId), isNull(engagements.orgId));
  const enquiryFilter = ctx.orgId ? eq(enquiries.orgId, ctx.orgId) : and(eq(enquiries.ownerId, ctx.user.userId), isNull(enquiries.orgId));
  const [briefs, intake] = await Promise.all([
    db.select().from(engagements).where(and(filter, eq(engagements.service, service))).orderBy(desc(engagements.updatedAt)),
    db.select().from(enquiries).where(and(enquiryFilter, eq(enquiries.service, service))).orderBy(desc(enquiries.createdAt)),
  ]);
  const unstarted = intake.filter(item => !briefs.some(brief => brief.enquiryId === item.id));
  return <main className="min-h-screen bg-[#f2f5f8] text-[#102b4c]"><header className="bg-[#102b4c] px-6 py-6 text-white"><div className="mx-auto max-w-6xl"><Link href="/workspace" className="text-sm font-bold text-[#9ce2ea]">← Workspace</Link><p className="mt-6 text-xs font-bold uppercase tracking-[.15em] text-[#9ce2ea]">{ctx.orgId ? "Organization" : "Personal"} workspace / {service === "studio" ? "Studio" : "Business AI"}</p><h1 className="mt-2 text-4xl font-bold tracking-[-.055em]">{service === "studio" ? "Product discovery" : "Operational diagnosis"}</h1><p className="mt-3 max-w-2xl text-[#cbd9e3]">{service === "studio" ? "Record the problem, assumptions, requirements and quality considerations before a build decision." : "Map the current operation, capture measured or estimated baselines and identify controls before automation."}</p></div></header>
    <div className="mx-auto max-w-6xl px-6 py-10"><nav className="mb-8 flex flex-wrap gap-3" aria-label="Engagement service"><Link href="/workspace/engagements?service=studio" aria-current={service === "studio" ? "page" : undefined} className={`rounded-full px-5 py-3 text-sm font-bold ${service === "studio" ? "bg-[#102b4c] text-white" : "bg-white text-[#102b4c]"}`}>Studio</Link><Link href="/workspace/engagements?service=business" aria-current={service === "business" ? "page" : undefined} className={`rounded-full px-5 py-3 text-sm font-bold ${service === "business" ? "bg-[#102b4c] text-white" : "bg-white text-[#102b4c]"}`}>Business AI</Link></nav>
      <div className="grid gap-7 lg:grid-cols-[1.3fr_.7fr]"><section><h2 className="text-2xl font-bold">Working briefs</h2>{briefs.length ? <div className="mt-5 grid gap-4">{briefs.map(brief => <Link key={brief.id} href={`/workspace/engagements/${brief.id}`} className="group rounded-2xl border border-[#d6e1e9] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-[#be2135]">{brief.stage}</p><h3 className="mt-2 text-xl font-bold">{brief.title}</h3></div><span className="text-[#d20e22]">Open ↗</span></div><p className="mt-4 text-sm text-[#657789]">Updated {brief.updatedAt.toLocaleDateString("en-AE")}</p></Link>)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-[#b8c9d5] bg-white p-8 text-[#526a7d]">No working briefs yet. Start from one of your enquiries.</p>}</section>
      <aside className="h-fit rounded-2xl border border-[#d6e1e9] bg-white p-6"><h2 className="text-xl font-bold">Start from an enquiry</h2><p className="mt-2 text-sm leading-6 text-[#536a7b]">A working brief is a private client draft. It does not create a contract or approve a project.</p>{unstarted.length ? <div className="mt-5 grid gap-3">{unstarted.map(item => <form key={item.id} action={startEngagement} className="rounded-xl border border-[#d9e4eb] p-4"><input type="hidden" name="enquiryId" value={item.id}/><p className="font-bold">{item.projectName}</p><p className="mt-1 text-xs text-[#657789]">Enquiry received {item.createdAt.toLocaleDateString("en-AE")}</p>{ctx.role !== "guest" && <button className="mt-3 rounded-full bg-[#102b4c] px-4 py-2 text-sm font-bold text-white">Open working brief ↗</button>}</form>)}</div> : <p className="mt-5 text-sm text-[#657789]">Your existing enquiries already have briefs, or you have not sent one yet.</p>}<Link href={`/workspace/intake?service=${service}`} className="mt-6 inline-block text-sm font-bold text-[#b9192c] underline underline-offset-4">Send a new enquiry →</Link></aside></div>
    </div></main>;
}
