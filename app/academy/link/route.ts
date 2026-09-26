// Links a DigitalBurj platform identity (ChatGPT or Google sign-in) to an Academy
// account and starts an Academy session. Anonymous visitors are sent through the
// platform sign-in first and come back here.
import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { academyAccounts } from "../../../db/schema";
import { chatGPTSignInPath, getChatGPTUser } from "../../chatgpt-auth";
import { academyAuthReady, safeNext, sessionCookieHeader } from "../../../lib/academy/auth";
import { logActivity } from "../../../lib/academy/access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  if (!academyAuthReady()) return new Response("Academy sign-in is not configured yet (SESSION_SECRET).", { status: 503 });
  const user = await getChatGPTUser();
  if (!user) return Response.redirect(new URL(chatGPTSignInPath(`/academy/link?next=${encodeURIComponent(next)}`), url), 302);
  const db = getDb();
  const email = user.email.toLowerCase();
  let account = await db.select().from(academyAccounts).where(eq(academyAccounts.platformUserId, user.userId)).get();
  if (!account) {
    const byEmail = await db.select().from(academyAccounts).where(eq(academyAccounts.email, email)).get();
    if (byEmail) {
      await db.update(academyAccounts).set({ platformUserId: user.userId }).where(eq(academyAccounts.id, byEmail.id));
      account = byEmail;
    } else {
      const id = crypto.randomUUID();
      await db.insert(academyAccounts).values({ id, email, name: user.fullName || email.split("@")[0], platformUserId: user.userId, progressConsent: true, createdAt: new Date() });
      await logActivity(id, "account", "Created your Academy account with DigitalBurj sign-in");
      account = await db.select().from(academyAccounts).where(eq(academyAccounts.id, id)).get();
    }
  }
  await db.update(academyAccounts).set({ lastSignInAt: new Date() }).where(eq(academyAccounts.id, account!.id));
  const headers = new Headers({ location: next, "cache-control": "no-store" });
  headers.append("set-cookie", await sessionCookieHeader(account!.id));
  return new Response(null, { status: 302, headers });
}
