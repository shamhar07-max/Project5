// api.digitalburj.com v1 conventions (blueprint Domain 12): authentication by
// organization API key or signed-in identity, scopes, consistent error model,
// request IDs, pagination and rate limiting.
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../db";
import { apiKeys, memberships } from "../db/schema";
import { getChatGPTUser } from "../app/chatgpt-auth";
import { API_SCOPES, type ApiScope } from "./api-scopes";

export { API_SCOPES };
export type ApiCaller =
  | { kind: "key"; orgId: string; scopes: Set<ApiScope>; keyId: string }
  | { kind: "user"; userId: string; email: string; orgId: string | null; role: string }
  | { kind: "anonymous" };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); }
}

export async function hashKey(raw: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, "0")).join("");
}

// Per-isolate token bucket. It limits bursts; a durable, global limiter needs a
// shared store (e.g. a Durable Object) when traffic warrants it.
const buckets = new Map<string, { tokens: number; at: number }>();
function allow(key: string, perMinute = 120) {
  const now = Date.now(); const b = buckets.get(key) ?? { tokens: perMinute, at: now };
  b.tokens = Math.min(perMinute, b.tokens + ((now - b.at) / 60000) * perMinute); b.at = now;
  if (b.tokens < 1) { buckets.set(key, b); return false; }
  b.tokens -= 1; buckets.set(key, b); return true;
}

async function resolveCaller(req: Request): Promise<ApiCaller> {
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer dbk_")) {
    const raw = auth.slice(7).trim();
    const db = getDb();
    const key = await db.select().from(apiKeys).where(and(eq(apiKeys.hash, await hashKey(raw)), isNull(apiKeys.revokedAt))).get();
    if (!key) throw new ApiError(401, "invalid_api_key", "The API key is invalid or revoked.");
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id));
    return { kind: "key", orgId: key.orgId, keyId: key.id, scopes: new Set(key.scopes.split(",") as ApiScope[]) };
  }
  const user = await getChatGPTUser();
  if (!user) return { kind: "anonymous" };
  const orgId = new URL(req.url).searchParams.get("organization");
  if (!orgId) return { kind: "user", userId: user.userId, email: user.email, orgId: null, role: "individual" };
  const m = await getDb().select().from(memberships).where(and(eq(memberships.orgId, orgId), eq(memberships.userId, user.userId), eq(memberships.status, "active"))).get();
  if (!m) throw new ApiError(403, "not_a_member", "You are not an active member of that organization.");
  return { kind: "user", userId: user.userId, email: user.email, orgId, role: m.role };
}

export function requireScope(c: ApiCaller, scope: ApiScope) {
  if (c.kind === "anonymous") throw new ApiError(401, "authentication_required", "Sign in or send an organization API key.");
  if (c.kind === "key" && !c.scopes.has(scope)) throw new ApiError(403, "insufficient_scope", `This key lacks the ${scope} scope.`);
}

export function page(req: Request) {
  const sp = new URL(req.url).searchParams;
  const limit = Math.min(100, Math.max(1, Number(sp.get("limit") || 25) || 25));
  const offset = Math.max(0, Number(sp.get("offset") || 0) || 0);
  return { limit, offset };
}

export function api(fn: (req: Request, caller: ApiCaller, ctx: { requestId: string; params: Record<string, string> }) => Promise<unknown>) {
  return async (req: Request, route?: { params?: Promise<Record<string, string>> }) => {
    const requestId = req.headers.get("x-request-id")?.slice(0, 64) || crypto.randomUUID();
    const headers = { "content-type": "application/json; charset=utf-8", "x-request-id": requestId, "cache-control": "no-store", "x-api-version": "v1" };
    try {
      const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "local";
      const caller = await resolveCaller(req);
      const limitKey = caller.kind === "key" ? `k:${caller.keyId}` : caller.kind === "user" ? `u:${caller.userId}` : `ip:${ip}`;
      if (!allow(limitKey, caller.kind === "anonymous" ? 60 : 300)) throw new ApiError(429, "rate_limited", "Too many requests. Slow down and retry shortly.");
      const params = (await route?.params) ?? {};
      const data = await fn(req, caller, { requestId, params });
      return new Response(JSON.stringify(data), { status: 200, headers });
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError(500, "internal_error", "Something went wrong on our side.");
      if (!(e instanceof ApiError)) console.error("API error", requestId, e);
      return new Response(JSON.stringify({ error: { code: err.code, message: err.message, details: err.details ?? null, requestId, status: err.status } }), { status: err.status, headers });
    }
  };
}

/** The organization an API caller acts for, or a personal user context. */
export function orgOf(c: ApiCaller) { return c.kind === "key" ? c.orgId : c.kind === "user" ? c.orgId : null; }
