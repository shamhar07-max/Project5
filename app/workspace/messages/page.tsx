import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { workspaceContext } from "../access";
import { getDb } from "../../../db";
import { messages } from "../../../db/schema";
import { postMessage } from "./actions";

export const dynamic = "force-dynamic";
export default async function MessagesPage() {
  const ctx = await workspaceContext();
  const list = ctx.orgId ? await getDb().select().from(messages).where(eq(messages.orgId, ctx.orgId)).orderBy(desc(messages.createdAt)).limit(100) : [];
  return <main className="min-h-screen bg-[#f2f5f7] text-[#10273c]"><header className="bg-[#10273c] px-6 py-5 text-white"><div className="mx-auto max-w-4xl"><Link href="/workspace" className="font-bold">← Workspace</Link></div></header><div className="mx-auto max-w-4xl px-6 py-12"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#e31b23]">Messages</p><h1 className="mt-2 text-4xl font-bold">Team conversation</h1>{!ctx.orgId ? <p className="mt-6 border border-[#d7e0e7] bg-white p-6">Switch to an organization to see its messages. <Link href="/workspace/organizations" className="font-bold underline">Organizations</Link></p> : <><p className="mt-3 text-[#52677a]">Messages are visible to active members of this organization.</p>{ctx.role !== "guest" && <form action={postMessage} className="mt-8 grid gap-4 border border-[#d7e0e7] bg-white p-6"><label className="font-bold">Message<textarea name="body" required maxLength={2000} rows={3} className="mt-2 block w-full border border-[#b9cad5] p-3 font-normal"/></label><button className="w-fit bg-[#10273c] px-5 py-3 font-bold text-white">Post message</button></form>}<div className="mt-8 space-y-3">{list.map(m=><article key={m.id} className="border border-[#d7e0e7] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><strong>{m.authorName}</strong><time className="text-sm text-[#52677a]">{m.createdAt.toLocaleString("en-AE")}</time></div><p className="mt-3 whitespace-pre-wrap">{m.body}</p></article>)}{!list.length && <p className="border border-dashed border-[#b9cad5] bg-white p-6 text-[#52677a]">No messages yet.</p>}</div></>}</div></main>;
}
