import Link from "next/link";
import { and, eq, inArray, like, or, sql } from "drizzle-orm";
import { getDb } from "../../../../db";
import { talentEvidence, talentProfiles, talentSettings } from "../../../../db/schema";
import { AppShell, Btn, Denied, Empty, PageHead, Panel } from "../../../_app/kit";
import { loadApp } from "../../../_app/shell";
import { verifiedEmployerOrg } from "../../../../lib/talent";

export const dynamic = "force-dynamic";

// Employer talent search (Domain 05 §7): verified employers only, consenting profiles only.
export default async function TalentSearch({ searchParams }: { searchParams: Promise<{ q?: string; verified?: string }> }) {
  const { ctx, info } = await loadApp();
  const sp = await searchParams; const q = (sp.q ?? "").trim().slice(0, 60); const onlyVerified = sp.verified === "1";
  if (!(await verifiedEmployerOrg(ctx.user.userId, ctx.orgId))) return <AppShell info={info} active="talent"><PageHead kicker="Talent search" title="Find capability" /><Denied>Talent search is available to members of organizations DigitalBurj has verified as employers. Request verification from <Link href="/workspace/organizations" style={{ textDecoration: "underline" }}>Organizations</Link>.</Denied></AppShell>;
  const db = getDb();
  const consenting = await db.select().from(talentSettings).where(and(eq(talentSettings.searchable, true), inArray(talentSettings.visibility, ["employers", "public"])));
  const ids = consenting.map(c => c.ownerId);
  const p = `%${q.replace(/[\\%_]/g, m => `\\${m}`)}%`;
  const [evidence, profiles] = ids.length ? await Promise.all([
    db.select().from(talentEvidence).where(and(inArray(talentEvidence.ownerId, ids), inArray(talentEvidence.visibility, ["Employers", "Public"]), onlyVerified ? eq(talentEvidence.status, "Verified") : undefined, q ? or(sql`${talentEvidence.capability} LIKE ${p} ESCAPE '\\'`, sql`${talentEvidence.title} LIKE ${p} ESCAPE '\\'`) : undefined)),
    db.select().from(talentProfiles).where(and(inArray(talentProfiles.ownerId, ids), q ? or(sql`${talentProfiles.headline} LIKE ${p} ESCAPE '\\'`, like(talentProfiles.summary, p)) : undefined)),
  ]) : [[], []];
  const hitIds = [...new Set([...evidence.map(e => e.ownerId), ...(onlyVerified ? [] : profiles.map(p => p.ownerId))])];
  return <AppShell info={info} active="talent">
    <PageHead kicker={`Talent search · ${info.context}`} title="Find capability" lede="Only professionals who chose to be searchable appear, and only the evidence they shared with employers." />
    <Panel><form className="app-inline"><input name="q" defaultValue={q} placeholder="Capability, e.g. API design, bookkeeping, logistics" style={{ flex: 1 }} /><label className="app-check"><input type="checkbox" name="verified" value="1" defaultChecked={onlyVerified} /> Verified only</label><Btn>Search</Btn></form></Panel>
    <Panel title={`${hitIds.length} professional${hitIds.length === 1 ? "" : "s"}`}>
      {hitIds.length ? <div className="app-rows">{hitIds.map(id => { const s = consenting.find(c => c.ownerId === id)!; const pr = profiles.find(x => x.ownerId === id); const ev = evidence.filter(e => e.ownerId === id); return <Link key={id} href={`/talent/p/${s.slug}`} className="app-row"><div className="app-row-main"><strong>{s.displayName || "DigitalBurj professional"}{pr?.headline ? ` · ${pr.headline}` : ""}</strong><small>{ev.filter(e => e.status === "Verified").length} verified · {ev.length} shared items · {pr?.availability ?? "Availability not set"}</small></div></Link>; })}</div> : <Empty title="No matching professionals" />}
    </Panel>
  </AppShell>;
}
