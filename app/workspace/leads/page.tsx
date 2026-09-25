import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { workspaceContext } from "../access";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { leadTimings, leadTopics, staffEmails, type LeadTopic } from "../../../lib/leads";
import { updateLeadStatus } from "./actions";

export const dynamic = "force-dynamic";
const statuses = ["New", "Contacted", "Routed", "Closed"];

export default async function LeadsPage() {
  const ctx = await workspaceContext();
  const staff = staffEmails().includes(ctx.user.email.toLowerCase());
  let rows: typeof leads.$inferSelect[] = [];
  let unavailable = false;
  try {
    const q = getDb().select().from(leads);
    rows = await (staff ? q : q.where(eq(leads.ownerId, ctx.user.userId))).orderBy(desc(leads.createdAt)).limit(200);
  } catch (error) { console.error("Leads unavailable", error); unavailable = true; }
  return <main className="min-h-screen bg-[#f2f5f7] text-[#10273c]"><header className="bg-[#10273c] px-6 py-5 text-white"><div className="mx-auto max-w-5xl"><Link href="/workspace" className="font-bold">← Workspace</Link></div></header>
    <div className="mx-auto max-w-5xl px-6 py-12">
      <p className="text-sm font-bold uppercase tracking-[.16em] text-[#e31b23]">Channel requests</p>
      <h1 className="mt-2 text-4xl font-bold">{staff ? "All WhatsApp, web and mobile requests" : "Requests you started"}</h1>
      <p className="mt-3 max-w-2xl text-[#52677a]">{staff ? "You are listed as DigitalBurj staff. Update the status as each request is contacted and routed." : "Requests you sent from the WhatsApp composer while signed in appear here with their reference code."}</p>
      {unavailable && <p className="mt-6 border border-[#f3c1c4] bg-white p-5 text-[#9b1c24]">Requests could not be loaded right now.</p>}
      <div className="mt-8 space-y-3">
        {rows.map(l => <article key={l.id} className="border border-[#d7e0e7] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold"><span className="mr-2 rounded bg-[#10273c] px-2 py-1 font-mono text-xs text-white">{l.reference}</span>{leadTopics[l.topic as LeadTopic] ?? l.topic}{l.intent && ` · ${l.intent}`}</h2><span className="text-sm font-semibold">{l.status}</span></div>
          <p className="mt-3 whitespace-pre-wrap text-[#304356]">{l.message}</p>
          <p className="mt-3 text-sm text-[#52677a]">{l.name}{l.company && ` · ${l.company}`}{staff && ` · ${l.contact}`} · via {l.channel}{l.timing && ` · ${leadTimings[l.timing] ?? l.timing}`} · {l.createdAt.toLocaleString("en-AE")}</p>
          {staff && <div className="mt-4 flex flex-wrap gap-2">{statuses.map(s => <form key={s} action={updateLeadStatus}><input type="hidden" name="id" value={l.id}/><input type="hidden" name="status" value={s}/><button disabled={s === l.status} className="border border-[#b9cad5] px-3 py-1.5 text-sm font-semibold disabled:bg-[#10273c] disabled:text-white">{s}</button></form>)}</div>}
        </article>)}
        {!rows.length && !unavailable && <p className="border border-dashed border-[#b9cad5] bg-white p-6 text-[#52677a]">No requests yet. <Link href="/connect/whatsapp" className="font-bold text-[#e31b23]">Start one →</Link></p>}
      </div>
    </div>
  </main>;
}
