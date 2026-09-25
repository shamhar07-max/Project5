import { safeRelativeReturnPath } from "../../chatgpt-auth";
import { authMode, cookie, SESSION_COOKIE } from "../../../lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (authMode() !== "google") return new Response("Not found", { status: 404 });
  const headers = new Headers({ location: safeRelativeReturnPath(new URL(request.url).searchParams.get("return_to") ?? "/"), "cache-control": "no-store" });
  headers.append("set-cookie", cookie(SESSION_COOKIE, "", 0));
  return new Response(null, { status: 302, headers });
}
