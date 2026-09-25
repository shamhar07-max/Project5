import { NextRequest, NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { files, auditLog } from "../../../../db/schema";
import { workspaceContext } from "../../access";

const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png", "text/plain"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ctx = await workspaceContext();
  if (ctx.role === "guest") return new Response("This role cannot upload files.", { status: 403 });
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File) || !ALLOWED.has(file.type) || file.size < 1 || file.size > MAX_SIZE) {
    return new Response("Select a PDF, JPG, PNG or text file under 5 MB.", { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  let valid = file.type === "application/pdf" ? starts(37, 80, 68, 70, 45)
    : file.type === "image/jpeg" ? starts(255, 216, 255)
    : file.type === "image/png" ? starts(137, 80, 78, 71, 13, 10, 26, 10)
    : !bytes.includes(0);
  if (valid && file.type === "text/plain") {
    try { valid = new TextDecoder("utf-8", { fatal: true }).decode(bytes).length > 0; }
    catch { valid = false; }
  }
  if (!valid) return new Response("The file content does not match its selected type.", { status: 400 });
  const id = crypto.randomUUID();
  const storageKey = `${ctx.orgId || "personal"}/${id}`;
  const name = file.name.replace(/[\x00-\x1f\x7f/\\]/g, "_").slice(0, 180) || "document";
  if (!env.BUCKET) return new Response("File storage is temporarily unavailable.", { status: 503 });
  await env.BUCKET.put(storageKey, bytes, { httpMetadata: { contentType: file.type } });
  try {
    const db = getDb();
    await db.batch([
      db.insert(files).values({ id, ownerId: ctx.user.userId, orgId: ctx.orgId, name, mime: file.type, size: file.size, storageKey, createdAt: new Date() }),
      db.insert(auditLog).values({ id: crypto.randomUUID(), actorId: ctx.user.userId, orgId: ctx.orgId, action: "file.upload", resource: "file", resourceId: id, decision: "allow", createdAt: new Date() }),
    ]);
  } catch (error) {
    await env.BUCKET.delete(storageKey);
    throw error;
  }
  return NextResponse.redirect(new URL("/workspace/files", request.url), 303);
}
