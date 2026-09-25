import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { requireChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { talentProfiles, talentEvidence } from "../../../db/schema";
import { saveTalentProfile, addTalentEvidence, removeTalentEvidence } from "./actions";

export const dynamic = "force-dynamic";
const control = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-red-500";
export default async function TalentPage() {
  const user = await requireChatGPTUser("/workspace/talent");
  const db = getDb();
  const [profile, evidence] = await Promise.all([
    db.select().from(talentProfiles).where(eq(talentProfiles.ownerId, user.userId)).get(),
    db.select().from(talentEvidence).where(eq(talentEvidence.ownerId, user.userId)).orderBy(desc(talentEvidence.createdAt)),
  ]);
  return <main className="min-h-screen bg-[#f2f5f7] px-5 py-12 text-[#10273c]"><div className="mx-auto max-w-5xl">
    <Link href="/workspace" className="text-sm font-semibold text-red-700">← Workspace</Link>
    <div className="mt-8 rounded-3xl bg-[#10273c] p-8 text-white md:p-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">DigitalBurj Talent</p><h1 className="mt-4 text-4xl font-bold tracking-tight">Your capability record</h1><p className="mt-4 max-w-2xl text-slate-300">Document what you have built and the skills behind it. This record is private and self-reported. An assessment or verification process must happen separately before any capability is called verified.</p></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-bold">Your profile</h2><form action={saveTalentProfile} className="mt-5 grid gap-4"><label className="text-sm font-semibold">Professional headline<input name="headline" required maxLength={120} defaultValue={profile?.headline} className={control} placeholder="Full-stack engineer"/></label><label className="text-sm font-semibold">Location<input name="location" maxLength={100} defaultValue={profile?.location} className={control} placeholder="City, country"/></label><label className="text-sm font-semibold">Availability<select name="availability" defaultValue={profile?.availability || "Not specified"} className={control}>{["Not specified", "Open to work", "Open to projects", "Unavailable"].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-sm font-semibold">About your work<textarea name="summary" maxLength={1200} rows={5} defaultValue={profile?.summary} className={control}/></label><button className="rounded-full bg-[#e31b23] px-6 py-3 font-bold text-white transition hover:bg-red-700">Save profile</button></form></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-2xl font-bold">Add work evidence</h2><p className="mt-2 text-sm text-slate-600">Describe a real project or skill you can substantiate later. Entries start as private declarations.</p><form action={addTalentEvidence} className="mt-5 grid gap-4"><label className="text-sm font-semibold">Project or work title<input name="title" required maxLength={120} className={control}/></label><label className="text-sm font-semibold">Capability demonstrated<input name="capability" required maxLength={80} className={control} placeholder="React development, product research…"/></label><label className="text-sm font-semibold">What you did<textarea name="description" required minLength={20} maxLength={1000} rows={6} className={control}/></label><button className="rounded-full bg-[#10273c] px-6 py-3 font-bold text-white transition hover:bg-slate-700">Add private evidence</button></form></section></div>
    <section className="mt-8"><h2 className="text-2xl font-bold">Evidence ({evidence.length})</h2><div className="mt-4 grid gap-4 md:grid-cols-2">{evidence.length ? evidence.map(item=><article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-red-700">{item.status} · {item.visibility}</p><h3 className="mt-3 text-xl font-bold">{item.title}</h3><p className="mt-1 text-sm font-semibold text-slate-600">{item.capability}</p><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.description}</p><form action={removeTalentEvidence} className="mt-5 border-t pt-4"><input type="hidden" name="id" value={item.id}/><button className="text-sm font-semibold text-red-700">Remove evidence</button></form></article>) : <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">No evidence recorded yet.</p>}</div></section>
  </div></main>;
}
