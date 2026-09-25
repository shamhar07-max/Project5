// Signed session cookies for deployments outside ChatGPT Sites.
//
// On ChatGPT Sites the platform signs visitors in and adds identity headers. On a
// plain Cloudflare Worker those headers could be forged by anyone, so the Worker
// runs with DIGITALBURJ_AUTH=google: people sign in with Google and the Worker
// keeps an HMAC-signed, HttpOnly session cookie. Identity headers are then ignored.

export type AuthMode = "sites" | "google";
export type Session = { sub: string; email: string; name: string | null; exp: number };

export const SESSION_COOKIE = "__Host-db_session";
export const OAUTH_COOKIE = "__Host-db_oauth";
export const SESSION_DAYS = 30;

export function authMode(): AuthMode {
  return process.env.DIGITALBURJ_AUTH === "google" ? "google" : "sites";
}

const enc = new TextEncoder();
export function b64url(bytes: Uint8Array | ArrayBuffer) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
export function randomToken(bytes = 32) {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}

async function hmacKey() {
  const secret = process.env.SESSION_SECRET ?? "";
  if (secret.length < 32) return null; // fail closed: no secret, no sessions
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

/** Signs any JSON value as `payload.signature`. */
export async function sign(value: unknown) {
  const key = await hmacKey();
  if (!key) throw new Error("SESSION_SECRET is not configured.");
  const body = b64url(enc.encode(JSON.stringify(value)));
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return `${body}.${b64url(sig)}`;
}

/** Verifies a value produced by `sign`; returns null when tampered or unsigned. */
export async function verify<T>(token: string): Promise<T | null> {
  const key = await hmacKey();
  const [body, sig] = token.split(".");
  if (!key || !body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify("HMAC", key, fromB64url(sig), enc.encode(body));
    return ok ? JSON.parse(new TextDecoder().decode(fromB64url(body))) as T : null;
  } catch {
    return null;
  }
}

export async function readSession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  const s = await verify<Session>(token);
  return s && typeof s.sub === "string" && typeof s.email === "string" && s.exp > Date.now() ? s : null;
}

export function cookie(name: string, value: string, maxAgeSeconds: number) {
  return `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}
