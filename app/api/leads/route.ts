import { and, count, eq, gt } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { composeWhatsAppMessage, leadReference, leadSchema, whatsappUrl } from "../../../lib/leads";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

async function clientKey(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const data = new TextEncoder().encode(`${ip}|${req.headers.get("user-agent") || ""}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash).slice(0, 12), b => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  if (!(req.headers.get("content-type") || "").includes("application/json")) return Response.json({ error: "Send JSON." }, { status: 415 });
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(req.url).host) return Response.json({ error: "Cross-site requests are not accepted." }, { status: 403 });

  let body: unknown;
  try { body = await req.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json({ error: issue?.message || "Check the form.", field: issue?.path[0] }, { status: 422 });
  }
  const input = parsed.data;
  if (input.website) return Response.json({ reference: leadReference(), whatsappUrl: null, stored: true }); // silently drop bots

  const reference = leadReference();
  const message = composeWhatsAppMessage(input, reference);
  const wa = input.channel === "whatsapp" ? whatsappUrl(message) : null;

  try {
    const db = getDb();
    const key = await clientKey(req);
    const recent = await db.select({ n: count() }).from(leads).where(and(eq(leads.clientKey, key), gt(leads.createdAt, new Date(Date.now() - WINDOW_MS)))).get();
    if ((recent?.n ?? 0) >= MAX_PER_WINDOW) return Response.json({ error: "Too many requests. Please try again in a few minutes.", whatsappUrl: wa }, { status: 429 });
    const user = await getChatGPTUser();
    await db.insert(leads).values({
      id: crypto.randomUUID(), reference, channel: input.channel, topic: input.topic, intent: input.intent, timing: input.timing,
      name: input.name, contact: input.contact, company: input.company, message: input.message, sourcePath: input.sourcePath,
      ownerId: user?.userId ?? null, clientKey: key, createdAt: new Date(),
    });
    return Response.json({ reference, whatsappUrl: wa, stored: true }, { status: 201 });
  } catch (error) {
    console.error("Lead could not be stored", error);
    // The conversation can still start on WhatsApp even if storage is unavailable.
    return Response.json({ reference, whatsappUrl: wa, stored: false, error: wa ? undefined : "We could not save your request. Please try again shortly." }, { status: wa ? 202 : 503 });
  }
}

export async function GET() {
  return Response.json({ whatsapp: Boolean(whatsappUrl("x")) }, { headers: { "cache-control": "no-store" } });
}
