import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { credentials, talentEvidence } from "../../../../db/schema";
import { AppShell, Btn, Chip, Empty, PageHead, Panel, fmt } from "../../../_app/kit";
import { loadApp } from "../../../_app/shell";
import { addCredentialToTalent } from "../mission-actions";

export const dynamic = "force-dynamic";

export default async function Credentials() {
  const { ctx, info } = await loadApp();
  const db = getDb();
  const [rows, evidence] = await Promise.all([
    db.select().from(credentials).where(eq(credentials.ownerId, ctx.user.userId)).orderBy(desc(credentials.issuedAt)),
    db.select().from(talentEvidence).where(eq(talentEvidence.ownerId, ctx.user.userId)),
  ]);
  return <AppShell info={info} active="academy">
    <PageHead back={{ href: "/workspace/academy", label: "My learning" }} kicker="Academy · Credentials" title="Verified credentials" lede="Issued only after a passed assessment and a separate independent verification. Anyone with the link can confirm a credential is genuine." />
    <Panel>{rows.length ? <div className="app-rows">{rows.map(c => { const onTalent = evidence.some(e => e.source === `Academy credential ${c.code}`); return <div key={c.id} className="app-row">
      <div className="app-row-main"><strong>{c.title}</strong><small>{c.code} · {c.courseCode} · issued {fmt(c.issuedAt, false)}{c.skills ? ` · ${c.skills}` : ""}</small></div>
      <Chip state={c.status === "active" ? "VERIFIED" : "REVOKED"} />
      <a className="app-btn app-btn-secondary" href={`/verify/${c.code}`}>Public link</a>
      {c.status === "active" && (onTalent ? <Chip state="ACTIVE" text="On your Talent profile" /> : <form action={addCredentialToTalent}><input type="hidden" name="credentialId" value={c.id} /><Btn kind="ghost">Add to Talent profile</Btn></form>)}
    </div>; })}</div> : <Empty title="No credentials yet">Pass a mission, then request independent verification.</Empty>}</Panel>
  </AppShell>;
}
