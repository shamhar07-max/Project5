import Link from "next/link";
import { and, eq, isNull, desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { files } from "../../../db/schema";
import { workspaceContext } from "../access";

export const dynamic = "force-dynamic";
export default async function FilesPage() {
  const ctx = await workspaceContext();
  const items = await getDb().select().from(files).where(ctx.orgId ? eq(files.orgId, ctx.orgId) : and(eq(files.ownerId, ctx.user.userId), isNull(files.orgId))).orderBy(desc(files.createdAt));
  return <main className="min-h-screen bg-[#f2f5f7] text-[#10273c]"><header className="bg-[#10273c] px-6 py-5 text-white"><div className="mx-auto max-w-4xl"><Link href="/workspace" className="font-bold">← Workspace</Link></div></header><div className="mx-auto max-w-4xl px-6 py-12"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#e31b23]">Files</p><h1 className="mt-2 text-4xl font-bold">Workspace documents</h1><p className="mt-3 text-[#52677a]">Files in your {ctx.orgId ? "organization" : "individual"} workspace. PDFs, images and text, up to 5 MB each.</p>{ctx.role !== "guest" && <form action="/workspace/files/upload" method="post" encType="multipart/form-data" className="mt-8 flex flex-wrap items-end gap-4 border border-[#d7e0e7] bg-white p-6"><label className="flex-1 font-bold">Choose a file<input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.txt" required className="mt-2 block w-full text-sm font-normal"/></label><button className="bg-[#10273c] px-5 py-3 font-bold text-white">Upload document</button></form>}<section className="mt-10"><h2 className="text-2xl font-bold">Saved files</h2>{items.length ? <ul className="mt-4 space-y-3">{items.map(item=><li key={item.id} className="flex flex-wrap items-center justify-between gap-3 border border-[#d7e0e7] bg-white p-5"><div><p className="font-bold">{item.name}</p><p className="mt-1 text-sm text-[#52677a]">{(item.size / 1024).toFixed(1)} KB · {item.createdAt.toLocaleDateString("en-AE")}</p></div><a href={`/workspace/files/${item.id}`} className="font-bold text-[#ad1720]">Download</a></li>)}</ul> : <p className="mt-4 border border-dashed border-[#b9cad5] bg-white p-6 text-[#52677a]">No documents yet.</p>}</section></div></main>;
}
