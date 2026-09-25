import { notFound } from "next/navigation";
import { and, desc, eq, inArray } from "drizzle-orm";
import { BadgeCheck } from "lucide-react";
import type { CSSProperties } from "react";
import { getDb } from "../../../../db";
import { talentEvidence, talentProfiles, talentSettings } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { SiteHeader, SiteFooter } from "../../../site-shell";
import { SectionHead } from "../../../_ui/sections";
import { verifiedEmployerOrg } from "../../../../lib/talent";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Capability Passport (Domain 05 §4). Private profiles do not exist publicly; employer-only
// profiles require a signed-in member of a verified employer organization.
export default async function Passport({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug.toLowerCase().slice(0, 40);
  const db = getDb();
  const s = await db.select().from(talentSettings).where(eq(talentSettings.slug, slug)).get().catch(() => undefined);
  if (!s || s.visibility === "private") notFound();
  const viewer = await getChatGPTUser();
  const employerViewer = viewer ? await verifiedEmployerOrg(viewer.userId, (await cookies()).get("db_org")?.value ?? null) : false;
  const owner = viewer?.userId === s.ownerId;
  if (s.visibility === "employers" && !employerViewer && !owner) notFound();
  const levels = employerViewer || owner ? ["Public", "Employers"] : ["Public"];
  const [profile, evidence] = await Promise.all([
    db.select().from(talentProfiles).where(eq(talentProfiles.ownerId, s.ownerId)).get(),
    db.select().from(talentEvidence).where(and(eq(talentEvidence.ownerId, s.ownerId), inArray(talentEvidence.visibility, levels))).orderBy(desc(talentEvidence.createdAt)),
  ]);
  const verified = evidence.filter(e => e.status === "Verified");
  const declared = evidence.filter(e => e.status !== "Verified");
  return <main className="site" style={{ "--a": "#f59e0b", "--b": "#f97316" } as CSSProperties}>
    <SiteHeader />
    <section className="band-tight page-top">
      <div className="wrap">
        <SectionHead index="✓" kicker="Capability Passport" title={<>{s.displayName || "DigitalBurj professional"} <em>{profile?.headline ? `· ${profile.headline}` : ""}</em></>}>{profile && <p>{profile.location}{profile.location && " · "}{profile.availability}</p>}</SectionHead>
        {profile?.summary && <p className="passport-summary">{profile.summary}</p>}
        <div className="passport-grid">
          <div className="passport-col"><h3><BadgeCheck size={18} /> Verified capabilities ({verified.length})</h3>{verified.length ? verified.map(e => <article key={e.id} className="passport-item ok"><strong>{e.title}</strong><span>{e.capability}</span><p>{e.description}</p><small>{e.source}</small></article>) : <p className="app-note">No independently verified items shared.</p>}</div>
          <div className="passport-col"><h3>Declared by the professional ({declared.length})</h3>{declared.length ? declared.map(e => <article key={e.id} className="passport-item"><strong>{e.title}</strong><span>{e.capability}</span><p>{e.description}</p><small>Self-reported · not verified</small></article>) : <p className="app-note">None shared.</p>}</div>
        </div>
        {s.showContact && s.contactEmail && <p className="passport-contact">Contact: <a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></p>}
      </div>
    </section>
    <SiteFooter />
  </main>;
}
