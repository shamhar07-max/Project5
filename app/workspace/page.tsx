import Link from "next/link";
import { and, count, desc, eq, inArray, isNull, notInArray } from "drizzle-orm";
import { ArrowUpRight } from "lucide-react";
import { getDb } from "../../db";
import { academyEnrollments, approvals, credentials, engagements, invoices, jobApplications, jobListings, missionSubmissions, notifications, offers, supportTickets, talentEvidence, verificationRequests } from "../../db/schema";
import { AppShell, Chip, Empty, PageHead, Panel, Stat, fmt } from "../_app/kit";
import { approvalScope, loadApp } from "../_app/shell";
import { can } from "../../lib/platform";

export const dynamic = "force-dynamic";

export default async function Workspace() {
  const { ctx, info } = await loadApp();
  const db = getDb();
  const me = ctx.user.userId;
  const scoped = ctx.orgId ? eq(engagements.orgId, ctx.orgId) : and(eq(engagements.ownerId, me), isNull(engagements.orgId));
  const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(err => { console.error("Dashboard query failed", err); return fallback; });

  const [pending, unread, subs, creds, saved, engs, evid, vreqs, apps, myOffers, bills, tickets, listings] = await Promise.all([
    safe(db.select().from(approvals).where(and(approvalScope(ctx), eq(approvals.status, "pending"))).orderBy(desc(approvals.createdAt)).limit(6), []),
    safe(db.select().from(notifications).where(and(eq(notifications.userId, me), isNull(notifications.readAt))).orderBy(desc(notifications.createdAt)).limit(5), []),
    safe(db.select().from(missionSubmissions).where(eq(missionSubmissions.ownerId, me)).orderBy(desc(missionSubmissions.updatedAt)), []),
    safe(db.select({ n: count() }).from(credentials).where(and(eq(credentials.ownerId, me), eq(credentials.status, "active"))).get(), { n: 0 }),
    safe(db.select({ n: count() }).from(academyEnrollments).where(eq(academyEnrollments.ownerId, me)).get(), { n: 0 }),
    safe(db.select().from(engagements).where(scoped).orderBy(desc(engagements.updatedAt)), []),
    safe(db.select({ n: count() }).from(talentEvidence).where(eq(talentEvidence.ownerId, me)).get(), { n: 0 }),
    safe(db.select().from(verificationRequests).where(eq(verificationRequests.ownerId, me)), []),
    safe(db.select().from(jobApplications).where(eq(jobApplications.candidateId, me)).orderBy(desc(jobApplications.updatedAt)), []),
    safe(db.select().from(offers).where(eq(offers.status, "SENT")), []),
    safe(db.select().from(invoices).where(and(eq(invoices.status, "issued"), ctx.orgId ? eq(invoices.orgId, ctx.orgId) : and(eq(invoices.customerEmail, ctx.user.email.toLowerCase()), isNull(invoices.orgId)))), []),
    safe(db.select({ n: count() }).from(supportTickets).where(and(eq(supportTickets.ownerId, me), notInArray(supportTickets.status, ["Closed", "Resolved"]))).get(), { n: 0 }),
    ctx.orgId && can(ctx.role, "jobs.manage") ? safe(db.select().from(jobListings).where(and(eq(jobListings.orgId, ctx.orgId), eq(jobListings.status, "PUBLISHED"))), []) : Promise.resolve([]),
  ]);

  const offerForMe = myOffers.filter(o => apps.some(a => a.id === o.applicationId));
  const revision = subs.filter(s => s.status === "REVISION_REQUIRED");
  const moreInfo = vreqs.filter(v => v.status === "MORE_INFO");
  const actions = [
    ...pending.map(a => ({ key: a.id, title: a.title, sub: `Approval · ${a.division}`, href: "/workspace/approvals", state: "PENDING" })),
    ...revision.map(s => ({ key: s.id, title: "Mission revision requested", sub: "Academy · resubmit with the reviewer's changes", href: `/workspace/academy/missions/${s.missionId}`, state: "REVISION_REQUIRED" })),
    ...moreInfo.map(v => ({ key: v.id, title: "A verifier needs more information", sub: "Talent · evidence verification", href: "/workspace/talent", state: "MORE_INFO" })),
    ...offerForMe.map(o => ({ key: o.id, title: "You have a job offer to review", sub: "Jobs · respond to the employer", href: "/workspace/jobs/applications", state: "SENT" })),
    ...bills.map(b => ({ key: b.id, title: `Invoice ${b.number} is due`, sub: `Billing · ${b.description}`, href: "/workspace/billing", state: "ISSUED" })),
  ];
  const activeApps = apps.filter(a => !["HIRED", "REJECTED", "WITHDRAWN"].includes(a.stage));
  const studio = engs.filter(e => e.service === "studio"), business = engs.filter(e => e.service === "business");
  const pendingVer = vreqs.filter(v => ["SUBMITTED", "UNDER_REVIEW"].includes(v.status)).length;
  const underReview = subs.filter(s => ["SUBMITTED", "RESUBMITTED", "UNDER_REVIEW", "VERIFICATION_PENDING"].includes(s.status)).length;
  const applicantCount = listings.length ? (await safe(db.select({ n: count() }).from(jobApplications).where(inArray(jobApplications.jobId, listings.map(l => l.id))).get(), { n: 0 }))?.n ?? 0 : 0;

  return <AppShell info={info} active="home">
    <PageHead kicker={`My day · ${info.context}`} title={`Welcome back, ${info.name.split(" ")[0]}.`} lede="Everything waiting on you across DigitalBurj, limited to what this context is authorized to see." />
    <div className="app-grid app-grid-4" style={{ marginBottom: "1rem" }}>
      <Stat label="Actions required" value={actions.length} href="#actions" />
      <Stat label="Unread notifications" value={info.unread} href="/workspace/notifications" />
      <Stat label="Active credentials" value={creds?.n ?? 0} href="/workspace/academy/credentials" />
      <Stat label="Open support tickets" value={tickets?.n ?? 0} href="/workspace/support" />
    </div>
    <div className="app-split">
      <div>
        <Panel title={<span id="actions">Action center</span>} sub="Approvals, revisions, requests for information, offers and invoices that need you.">
          {actions.length ? <div className="app-rows">{actions.map(a => <Link key={a.key} href={a.href} className="app-row"><div className="app-row-main"><strong>{a.title}</strong><small>{a.sub}</small></div><Chip state={a.state} /><ArrowUpRight size={16} /></Link>)}</div> : <Empty title="Nothing needs you right now">New approvals, reviews and deadlines appear here as soon as they are created.</Empty>}
        </Panel>
        <div className="app-grid app-grid-2">
          <Panel title="Academy" actions={<Link className="app-btn app-btn-secondary" href="/workspace/academy">Open</Link>}>
            <dl className="app-kv"><dt>Saved units</dt><dd>{saved?.n ?? 0}</dd><dt>Missions in review</dt><dd>{underReview}</dd><dt>Revisions requested</dt><dd>{revision.length}</dd><dt>Credentials</dt><dd>{creds?.n ?? 0}</dd></dl>
          </Panel>
          <Panel title="Studio" actions={<Link className="app-btn app-btn-secondary" href="/workspace/engagements?service=studio">Open</Link>}>
            {studio.length ? <div className="app-rows">{studio.slice(0, 3).map(e => <Link key={e.id} href={`/workspace/engagements/${e.id}`} className="app-row"><div className="app-row-main"><strong>{e.title}</strong><small>Updated {fmt(e.updatedAt)}</small></div><Chip state={e.stage} /></Link>)}</div> : <Empty title="No Studio projects yet"><Link href="/workspace/intake?service=studio">Start an enquiry</Link></Empty>}
          </Panel>
          <Panel title="Business AI" actions={<Link className="app-btn app-btn-secondary" href="/workspace/engagements?service=business">Open</Link>}>
            {business.length ? <div className="app-rows">{business.slice(0, 3).map(e => <Link key={e.id} href={`/workspace/engagements/${e.id}`} className="app-row"><div className="app-row-main"><strong>{e.title}</strong><small>Updated {fmt(e.updatedAt)}</small></div><Chip state={e.stage} /></Link>)}</div> : <Empty title="No engagements yet"><Link href="/workspace/intake?service=business">Request a consultation</Link></Empty>}
          </Panel>
          <Panel title="Talent & Jobs" actions={<Link className="app-btn app-btn-secondary" href="/workspace/talent">Open</Link>}>
            <dl className="app-kv"><dt>Evidence records</dt><dd>{evid?.n ?? 0}</dd><dt>Verifications pending</dt><dd>{pendingVer}</dd><dt>Active applications</dt><dd>{activeApps.length}</dd>{listings.length > 0 && <><dt>Open roles · applicants</dt><dd>{listings.length} · {applicantCount}</dd></>}</dl>
          </Panel>
        </div>
      </div>
      <div>
        <Panel title="Latest notifications" actions={<Link className="app-btn app-btn-ghost" href="/workspace/notifications">All</Link>}>
          {unread.length ? <div className="app-rows">{unread.map(n => <Link key={n.id} href={n.href || "/workspace/notifications"} className="app-row"><div className="app-row-main"><strong>{n.title}</strong><small>{n.category} · {fmt(n.createdAt)}</small></div></Link>)}</div> : <Empty title="You are all caught up" />}
        </Panel>
        <Panel title="Quick start">
          <div className="app-rows">
            {[["/academy/catalogue", "Browse Academy units"], ["/workspace/intake?service=studio", "Start a Studio project"], ["/workspace/intake?service=business", "Request a Business AI diagnosis"], ["/jobs/board", "Explore open roles"], ["/workspace/organizations", "Switch or create an organization"]].map(([h, l]) => <Link key={h} href={h} className="app-row"><div className="app-row-main"><strong>{l}</strong></div><ArrowUpRight size={16} /></Link>)}
          </div>
        </Panel>
      </div>
    </div>
  </AppShell>;
}
