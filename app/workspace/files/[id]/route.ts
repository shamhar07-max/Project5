import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { files, auditLog } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { workspaceContext } from "../../access";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await workspaceContext();
  const { id } = await params;
  const file = await getDb().select().from(files).where(eq(files.id, id)).get();
  const allowed = file && (ctx.orgId ? file.orgId === ctx.orgId : !file.orgId && file.ownerId === ctx.user.userId);
  if (!allowed) return new Response("File not found.", { status: 404 });
  if (!env.BUCKET) return new Response("File storage is temporarily unavailable.", { status: 503 });
  const stored = await env.BUCKET.get(file.storageKey);
  if (!stored) return new Response("File unavailable.", { status: 404 });
  await getDb().insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: "file.download", resource: "file", resourceId: id, decision: "allow", createdAt: new Date() });
  const safeName = file.name.replace(/["\\\r\n]/g, "_");
  return new Response(stored.body, { headers: {
    "Content-Type": file.mime,
    "Content-Disposition": `attachment; filename="${safeName}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  } });
}
