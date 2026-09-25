import Link from "next/link";
import { and, desc, eq, or, sql } from "drizzle-orm";
import type { CSSProperties } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getDb } from "../../../db";
import { jobListings } from "../../../db/schema";
import { SiteHeader, SiteFooter } from "../../site-shell";
import { SectionHead } from "../../_ui/sections";

export const dynamic = "force-dynamic";

export default async function Board({ searchParams }: { searchParams: Promise<{ q?: string; arrangement?: string; type?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const p = `%${q.replace(/[\\%_]/g, m => `\\${m}`)}%`;
  const jobs = await getDb().select().from(jobListings).where(and(eq(jobListings.status, "PUBLISHED"),
    q ? or(sql`${jobListings.title} LIKE ${p} ESCAPE '\\'`, sql`${jobListings.skills} LIKE ${p} ESCAPE '\\'`, sql`${jobListings.company} LIKE ${p} ESCAPE '\\'`, sql`${jobListings.location} LIKE ${p} ESCAPE '\\'`) : undefined,
    sp.arrangement ? eq(jobListings.workArrangement, sp.arrangement) : undefined,
    sp.type ? eq(jobListings.employmentType, sp.type) : undefined)).orderBy(desc(jobListings.publishedAt)).limit(100).catch(() => []);
  return <main className="public-site" style={{ "--a": "#f43f5e", "--b": "#fb923c" } as CSSProperties}>
    <SiteHeader />
    <section className="section" style={{ paddingTop: "8rem" }}>
      <div className="shell">
        <SectionHead index="01" kicker="DigitalBurj Jobs · open roles" title={<>Opportunity meets <em>capability.</em></>}><p>Roles from employers DigitalBurj has verified. Academy participation is not required to apply, and hiring decisions remain with employers.</p></SectionHead>
        <form className="board-filters"><input name="q" defaultValue={q} placeholder="Role, skill, company or city" aria-label="Search roles" /><select name="arrangement" defaultValue={sp.arrangement ?? ""} aria-label="Arrangement"><option value="">Any arrangement</option><option>On-site</option><option>Hybrid</option><option>Remote</option></select><select name="type" defaultValue={sp.type ?? ""} aria-label="Type"><option value="">Any type</option><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select><button className="mag mag-red" style={{ minHeight: 48 }}><span className="mag-label">Search</span></button></form>
        <div className="board-list">
          {jobs.length ? jobs.map((j, i) => <Link key={j.id} href={`/jobs/board/${j.id}`} className="board-item" data-spotlight data-reveal="up" style={{ "--i": i % 4 } as CSSProperties}>
            <div><strong>{j.title}</strong><span>{j.company}</span></div>
            <div className="board-meta"><span><MapPin size={14} /> {j.location}</span><span>{j.workArrangement}</span><span>{j.employmentType}</span>{j.salaryRange && <span>{j.salaryRange}</span>}</div>
            <ArrowUpRight size={20} className="board-arrow" />
          </Link>) : <div className="app-empty"><strong>No open roles match yet</strong><p>Employers publish roles after DigitalBurj verifies them. Check back soon, or build your Capability Passport in the meantime.</p></div>}
        </div>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
