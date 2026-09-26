// Academy sign-in: email + password accounts, or a linked DigitalBurj platform
// identity. Sessions are HMAC-signed, HttpOnly cookies. Passwords are hashed with
// PBKDF2-SHA256 (Web Crypto, available in Workers). Nothing here grants paid
// access — that is decided by entitlements.ts.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import { academyAccounts } from "../../db/schema";
import { b64url, fromB64url } from "../session";

export const ACADEMY_COOKIE = "db_academy";
const SESSION_DAYS = 14;
const ITERATIONS = 100_000; // the Workers PBKDF2 ceiling
const enc = new TextEncoder();

export type AcademyAccount = typeof academyAccounts.$inferSelect;
type Claims = { sub: string; v: 1; exp: number };

/** The signing secret. Outside production a fixed development secret is used so local previews work. */
function secret() {
  const s = process.env.SESSION_SECRET ?? "";
  if (s.length >= 32) return s;
  if (process.env.NODE_ENV !== "production") return "digitalburj-academy-local-development-secret";
  return null;
}
export const academyAuthReady = () => secret() !== null;

async function key() {
  const s = secret();
  if (!s) return null;
  return crypto.subtle.importKey("raw", enc.encode(`academy:${s}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signClaims(c: Claims) {
  const k = await key();
  if (!k) throw new Error("Academy sign-in is not configured: set SESSION_SECRET (32+ characters).");
  const body = b64url(enc.encode(JSON.stringify(c)));
  return `${body}.${b64url(await crypto.subtle.sign("HMAC", k, enc.encode(body)))}`;
}

async function readClaims(token: string | undefined): Promise<Claims | null> {
  const k = await key();
  const [body, sig] = (token ?? "").split(".");
  if (!k || !body || !sig) return null;
  try {
    if (!(await crypto.subtle.verify("HMAC", k, fromB64url(sig), enc.encode(body)))) return null;
    const c = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Claims;
    return typeof c.sub === "string" && c.exp > Date.now() ? c : null;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await pbkdf2(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${b64url(salt)}$${b64url(bits)}`;
}

export async function checkPassword(password: string, stored: string | null) {
  const [scheme, iter, salt, hash] = (stored ?? "").split("$");
  if (scheme !== "pbkdf2" || !salt || !hash) {
    await pbkdf2(password, new Uint8Array(16), ITERATIONS); // keep timing similar for unknown accounts
    return false;
  }
  const bits = new Uint8Array(await pbkdf2(password, fromB64url(salt), Number(iter)));
  const want = fromB64url(hash);
  if (bits.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ want[i];
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number) {
  const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, base, 256);
}

export async function startSession(accountId: string) {
  const token = await signClaims({ sub: accountId, v: 1, exp: Date.now() + SESSION_DAYS * 86_400_000 });
  (await cookies()).set(ACADEMY_COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_DAYS * 86_400,
    secure: process.env.NODE_ENV === "production",
  });
}

/** Set-Cookie header value for route handlers that build their own Response. */
export async function sessionCookieHeader(accountId: string) {
  const token = await signClaims({ sub: accountId, v: 1, exp: Date.now() + SESSION_DAYS * 86_400_000 });
  return `${ACADEMY_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86_400}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export async function endSession() {
  (await cookies()).delete(ACADEMY_COOKIE);
}

/** The signed-in Academy account, or null. */
export async function getAcademyAccount(): Promise<AcademyAccount | null> {
  const claims = await readClaims((await cookies()).get(ACADEMY_COOKIE)?.value);
  if (!claims) return null;
  return (await getDb().select().from(academyAccounts).where(eq(academyAccounts.id, claims.sub)).get()) ?? null;
}

export async function requireAcademyAccount(returnTo = "/academy/learn") {
  const account = await getAcademyAccount();
  if (!account) redirect(`/academy/sign-in?next=${encodeURIComponent(safeNext(returnTo))}`);
  return account;
}

/** Only same-site Academy paths are allowed as post-sign-in destinations. */
export function safeNext(value: string | null | undefined, fallback = "/academy/learn") {
  if (!value || !value.startsWith("/academy") || value.startsWith("//")) return fallback;
  if (/^\/academy\/(sign-in|register|sign-out)/.test(value)) return fallback;
  return value;
}

// Basic per-instance brute-force brake for sign-in: 8 failures per email per 15 minutes.
const failures = new Map<string, { n: number; until: number }>();
export function signInBlocked(email: string) {
  const f = failures.get(email);
  return !!f && f.n >= 8 && f.until > Date.now();
}
export function noteFailure(email: string) {
  const f = failures.get(email);
  const fresh = !f || f.until < Date.now();
  failures.set(email, { n: fresh ? 1 : f.n + 1, until: Date.now() + 15 * 60_000 });
  if (failures.size > 5000) failures.clear();
}
export const clearFailures = (email: string) => failures.delete(email);
