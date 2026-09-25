import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { jobApplications, jobListings } from "../../../db/schema";
import { Btn, Chip, Empty, PageHead, Panel, Stat, fmt } from "../../_app/kit";
import { AdminShell } from "../shell";
import { adminContext } from "../../../lib/platform";
import { moderateListing } from "./actions";

export const dynamic = "force-dynamic";

export default async function JobsAdmin() {
  const { user, roles } = await adminContext("jobs");
  const db = getDb();
  const [listings, stages] = await Promise.all([
    db.select().from(jobListings).orderBy(desc(jobListings.createdAt)).limit(200),
    db.select({ stage: jobApplications.stage, n: count() }).from(jobApplications).groupBy(jobApplications.stage),
  ]);
  const n = (s: string) => stages.find(x => x.stage === s)?.n ?? 0;
  return <AdminShell roles={roles} email={user.email} active="jobs">
    <PageHead kicker="Admin · Jobs" title="Listings & hiring records" lede="Moderate listings from verified employers. Employer verification itself is handled in Talent admin." actions={<Link className="app-btn app-btn-secondary" href="/admin/talent?tab=employers">Employer verification</Link>} />
    <div className="app-grid app-grid-4" style={{ marginBottom: "1rem" }}><Stat label="Open roles" value={listings.filter(l => l.status === "PUBLISHED").length} /><Stat label="Applications" value={stages.reduce((a, b) => a + b.n, 0)} /><Stat label="Interviews" value={n("INTERVIEW")} /><Stat label="Hires" value={n("HIRED")} /></div>
    <Panel title="Listings">{listings.length ? <div className="app-rows">{listings.map(l => <div key={l.id} className="app-row"><div className="app-row-main"><strong>{l.title} — {l.company}</strong><small>{l.location} · created {fmt(l.createdAt, false)}</small></div><Chip state={l.status === "PUBLISHED" ? "ACTIVE" : l.status} text={l.status.toLowerCase()} />{l.status === "PUBLISHED" && <><Link className="app-btn app-btn-ghost" href={`/jobs/board/${l.id}`}>View</Link><form action={moderateListing} className="app-inline"><input type="hidden" name="id" value={l.id} /><input name="reason" required minLength={10} placeholder="Reason for closing" /><Btn kind="danger">Close</Btn></form></>}</div>)}</div> : <Empty title="No listings yet" />}</Panel>
  </AdminShell>;
}
