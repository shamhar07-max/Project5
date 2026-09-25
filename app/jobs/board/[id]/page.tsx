import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import type { CSSProperties } from "react";
import { getDb } from "../../../../db";
import { jobApplications, jobListings } from "../../../../db/schema";
import { chatGPTSignInPath, getChatGPTUser } from "../../../chatgpt-auth";
import { SiteHeader, SiteFooter } from "../../../site-shell";
import { SectionHead } from "../../../_ui/sections";
import { applyToJob } from "../../../workspace/jobs/recruit-actions";

export const dynamic = "force-dynamic";

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const job = await db.select().from(jobListings).where(and(eq(jobListings.id, id), eq(jobListings.status, "PUBLISHED"))).get();
  if (!job) notFound();
  const user = await getChatGPTUser();
  const applied = user ? await db.select().from(jobApplications).where(and(eq(jobApplications.jobId, id), eq(jobApplications.candidateId, user.userId))).get() : undefined;
  return <main className="site" style={{ "--a": "#f43f5e", "--b": "#fb923c" } as CSSProperties}>
    <SiteHeader />
    <section className="band-tight page-top">
      <div className="wrap job-detail">
        <div>
          <Link href="/jobs/board" className="link" style={{ marginTop: 0 }}>← All roles</Link>
          <SectionHead index={job.company} kicker={`${job.location} · ${job.workArrangement} · ${job.employmentType}`} title={job.title}>{job.salaryRange && <p>{job.salaryRange}</p>}</SectionHead>
          <h3 className="h3 subhead">About the role</h3><p className="prose-p">{job.description}</p>
          <h3 className="h3 subhead">Requirements</h3><p className="prose-p">{job.requirements}</p>
          {job.skills && <><h3 className="h3 subhead">Skills</h3><div className="tags">{job.skills.split(",").map(s => s.trim()).filter(Boolean).map(s => <span key={s} className="tag">{s}</span>)}</div></>}
        </div>
        <aside className="job-apply">
          <h3>Apply</h3>
          {!user ? <><p>Sign in to send a structured application. You can track every stage in your workspace.</p><a className="btn btn-primary" href={chatGPTSignInPath(`/jobs/board/${job.id}`)} style={{ marginTop: "1rem" }}>Sign in to apply</a></>
            : applied ? <><p>You applied on {applied.createdAt.toLocaleDateString("en-GB")}. Current stage: <b>{applied.stage.replace(/_/g, " ").toLowerCase()}</b>.</p><Link href="/workspace/jobs/applications" className="link">Track your application</Link></>
            : <form action={applyToJob} className="job-form">
              <input type="hidden" name="jobId" value={job.id} />
              <label>Full name<input name="name" required minLength={2} maxLength={80} defaultValue={user.fullName ?? ""} /></label>
              <label>Cover note<textarea name="coverNote" rows={5} maxLength={3000} placeholder="Why this role, and what you would bring" /></label>
              {job.questions && <label>{job.questions}<textarea name="answers" rows={4} maxLength={3000} /></label>}
              <label className="job-check"><input type="checkbox" name="shareProfile" /> Share my Capability Passport with this employer</label>
              <label className="job-check"><input type="checkbox" name="assessmentConsent" /> I consent to a relevant skills assessment if the employer requests one</label>
              <button className="btn btn-primary">Submit application</button>
              <p className="job-fine">Your name, email, cover note and answers are shared with {job.company}. DigitalBurj does not guarantee jobs or visas.</p>
            </form>}
        </aside>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
