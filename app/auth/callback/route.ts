import { exchangeCode, googleConfig, siteOrigin, type OAuthState } from "../../../lib/google-oauth";
import { authMode, cookie, OAUTH_COOKIE, SESSION_COOKIE, SESSION_DAYS, sign, verify } from "../../../lib/session";

export const dynamic = "force-dynamic";

function fail(message: string) {
  const headers = new Headers({ "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  headers.append("set-cookie", cookie(OAUTH_COOKIE, "", 0));
  const safe = message.replace(/[<>&"]/g, c => `&#${c.charCodeAt(0)};`);
  return new Response(`<!doctype html><meta name="viewport" content="width=device-width"><title>Sign-in failed</title><body style="font-family:system-ui;max-width:32rem;margin:15vh auto;padding:0 1rem;color:#10273c"><h1>Sign-in didn't complete</h1><p>${safe}</p><p><a href="/auth/sign-in">Try again</a> · <a href="/">Home</a></p>`, { status: 400, headers });
}

export async function GET(request: Request) {
  if (authMode() !== "google") return new Response("Not found", { status: 404 });
  const cfg = googleConfig();
  if (!cfg) return fail("Sign-in is not configured yet.");
  const url = new URL(request.url);
  if (url.searchParams.get("error")) return fail("Google sign-in was cancelled.");
  const raw = request.headers.get("cookie")?.split(/;\s*/).find(c => c.startsWith(`${OAUTH_COOKIE}=`))?.slice(OAUTH_COOKIE.length + 1);
  const oauth = raw ? await verify<OAuthState>(raw) : null;
  const code = url.searchParams.get("code");
  if (!oauth || !code || oauth.exp < Date.now() || url.searchParams.get("state") !== oauth.state) return fail("This sign-in link expired or was opened in another browser. Please start again.");
  try {
    const who = await exchangeCode(code, oauth.verifier, `${siteOrigin(request)}/auth/callback`, cfg.clientId, cfg.clientSecret);
    const headers = new Headers({ location: oauth.returnTo, "cache-control": "no-store" });
    headers.append("set-cookie", cookie(SESSION_COOKIE, await sign({ ...who, exp: Date.now() + SESSION_DAYS * 86_400_000 }), SESSION_DAYS * 86_400));
    headers.append("set-cookie", cookie(OAUTH_COOKIE, "", 0));
    return new Response(null, { status: 302, headers });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Sign-in failed.");
  }
}
