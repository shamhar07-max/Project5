// Google sign-in (OpenID Connect authorization code flow with PKCE) for deployments
// outside ChatGPT Sites. Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and
// SESSION_SECRET; the redirect URI is <site origin>/auth/callback.
import { b64url, fromB64url } from "./session";

export type OAuthState = { state: string; verifier: string; returnTo: string; exp: number };

export function googleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const sessionSecret = process.env.SESSION_SECRET ?? "";
  return clientId && clientSecret && sessionSecret.length >= 32 ? { clientId, clientSecret } : null;
}

/** The public origin: PUBLIC_ORIGIN when set, otherwise the origin the request arrived on. */
export function siteOrigin(request: Request) {
  return (process.env.PUBLIC_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
}

export async function pkceChallenge(verifier: string) {
  return b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
}

export function authorizeUrl(clientId: string, redirectUri: string, state: string, challenge: string) {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.search = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", scope: "openid email profile", state, code_challenge: challenge, code_challenge_method: "S256", prompt: "select_account" }).toString();
  return u.toString();
}

type IdClaims = { iss: string; aud: string; sub: string; email?: string; email_verified?: boolean; name?: string; exp: number };

/**
 * Exchanges the code for tokens. The ID token comes straight from Google's token
 * endpoint over TLS, so its claims are trusted after checking issuer, audience and expiry.
 */
export async function exchangeCode(code: string, verifier: string, redirectUri: string, clientId: string, clientSecret: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, code_verifier: verifier, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status}).`);
  const { id_token } = await res.json() as { id_token?: string };
  const payload = id_token?.split(".")[1];
  if (!payload) throw new Error("Google did not return an ID token.");
  const c = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as IdClaims;
  if (!["https://accounts.google.com", "accounts.google.com"].includes(c.iss)) throw new Error("Unexpected token issuer.");
  if (c.aud !== clientId) throw new Error("Token was issued for another application.");
  if (c.exp * 1000 < Date.now()) throw new Error("Token expired.");
  if (!c.email || c.email_verified !== true) throw new Error("Your Google account email is not verified.");
  return { sub: `google:${c.sub}`, email: c.email.toLowerCase(), name: c.name?.trim() || null };
}
