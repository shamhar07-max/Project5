import { safeRelativeReturnPath } from "../../chatgpt-auth";
import { authorizeUrl, googleConfig, pkceChallenge, siteOrigin, type OAuthState } from "../../../lib/google-oauth";
import { authMode, cookie, OAUTH_COOKIE, randomToken, sign } from "../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (authMode() !== "google") return new Response("Not found", { status: 404 });
  const cfg = googleConfig();
  if (!cfg) return new Response("Sign-in is not configured yet. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and SESSION_SECRET, then redeploy.", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } });
  const returnTo = safeRelativeReturnPath(new URL(request.url).searchParams.get("return_to") ?? "/workspace");
  const oauth: OAuthState = { state: randomToken(), verifier: randomToken(48), returnTo, exp: Date.now() + 10 * 60_000 };
  const headers = new Headers({ location: authorizeUrl(cfg.clientId, `${siteOrigin(request)}/auth/callback`, oauth.state, await pkceChallenge(oauth.verifier)), "cache-control": "no-store" });
  headers.append("set-cookie", cookie(OAUTH_COOKIE, await sign(oauth), 600));
  return new Response(null, { status: 302, headers });
}
