import Link from "next/link";
import { and, eq, isNull, desc } from "drizzle-orm";
import { workspaceContext } from "../access";
import { getDb } from "../../../db";
import { auditLog } from "../../../db/schema";

export const dynamic = "force-dynamic";
export default async function SecurityPage() {
  const ctx = await workspaceContext();
  const orgWide = !!ctx.orgId && ctx.role === "org_owner";
  const events = await getDb().select().from(auditLog).where(orgWide ? eq(auditLog.orgId, ctx.orgId!) : and(eq(auditLog.actorId, ctx.user.userId), ctx.orgId ? eq(auditLog.orgId, ctx.orgId) : isNull(auditLog.orgId))).orderBy(desc(auditLog.createdAt)).limit(100);
  return <main className="min-h-screen bg-[#f2f5f7] text-[#10273c]"><header className="bg-[#10273c] px-6 py-5 text-white"><div className="mx-auto max-w-4xl"><Link href="/workspace" className="font-bold">← Workspace</Link></div></header><div className="mx-auto max-w-4xl px-6 py-12"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#e31b23]">Security centre</p><h1 className="mt-2 text-4xl font-bold">Activity log</h1><p className="mt-3 text-[#52677a]">{orgWide ? "Recent organization actions." : "Your recent actions in this workspace."} Access and sign-in security are managed by ChatGPT.</p><div className="mt-8 overflow-x-auto border border-[#d7e0e7] bg-white"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-[#e9eff3]"><tr><th className="p-4">When</th><th className="p-4">Action</th><th className="p-4">Result</th></tr></thead><tbody>{events.map(e=><tr key={e.id} className="border-t border-[#e3e9ed]"><td className="p-4">{e.createdAt.toLocaleString("en-AE")}</td><td className="p-4">{e.action}</td><td className="p-4 capitalize">{e.decision}</td></tr>)}</tbody></table>{!events.length && <p className="p-6 text-[#52677a]">No recorded activity yet.</p>}</div></div></main>;
}
