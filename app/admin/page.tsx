import Link from "next/link";
import { and, count, eq, gt, inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { approvals, automations, credentials, engagements, incidents, invoices, jobApplications, jobListings, leads, missionSubmissions, organizations, supportTickets, talentEvidence, userDirectory, verificationRequests } from "../../db/schema";
import { PageHead, Panel, Stat, daysAgo, money } from "../_app/kit";
import { AdminShell } from "./shell";
import { adminContext } from "../../lib/platform";

export const dynamic = "force-dynamic";

// Executive dashboard (Domain 09 §2). Every figure is a live count from the database.
export default async function AdminHome() {
  const { user, roles } = await adminContext("overview");
  const db = getDb();
  const since = daysAgo(30);
  const c = (p: Promise<{ n: number } | undefined>) => p.then(r => r?.n ?? 0).catch(() => 0);
  const [users, active30, orgs, reviewQ, verifyQ, creds, studioActive, businessActive, live, pendingApprovals, tViq, profiles, openJobs, apps, hires, receivable, openTickets, openIncidents, newLeads] = await Promise.all([
    c(db.select({ n: count() }).from(userDirectory).get()),
    c(db.select({ n: count() }).from(userDirectory).where(gt(userDirectory.lastSeenAt, since)).get()),
    c(db.select({ n: count() }).from(organizations).get()),
    c(db.select({ n: count() }).from(missionSubmissions).where(inArray(missionSubmissions.status, ["SUBMITTED", "RESUBMITTED", "UNDER_REVIEW"])).get()),
    c(db.select({ n: count() }).from(missionSubmissions).where(eq(missionSubmissions.status, "VERIFICATION_PENDING")).get()),
    c(db.select({ n: count() }).from(credentials).where(eq(credentials.status, "active")).get()),
    c(db.select({ n: count() }).from(engagements).where(and(eq(engagements.service, "studio"), inArray(engagements.stage, ["Scoping", "Design", "Engineering", "QA", "Deployment"]))).get()),
    c(db.select({ n: count() }).from(engagements).where(and(eq(engagements.service, "business"), inArray(engagements.stage, ["Implementation", "Pilot", "Live", "Optimization"]))).get()),
    c(db.select({ n: count() }).from(automations).where(eq(automations.state, "LIVE")).get()),
    c(db.select({ n: count() }).from(approvals).where(eq(approvals.status, "pending")).get()),
    c(db.select({ n: count() }).from(verificationRequests).where(inArray(verificationRequests.status, ["SUBMITTED", "UNDER_REVIEW"])).get()),
    c(db.select({ n: count() }).from(talentEvidence).where(eq(talentEvidence.status, "Verified")).get()),
    c(db.select({ n: count() }).from(jobListings).where(eq(jobListings.status, "PUBLISHED")).get()),
    c(db.select({ n: count() }).from(jobApplications).get()),
    c(db.select({ n: count() }).from(jobApplications).where(eq(jobApplications.stage, "HIRED")).get()),
    db.select().from(invoices).where(eq(invoices.status, "issued")).catch(() => []),
    c(db.select({ n: count() }).from(supportTickets).where(inArray(supportTickets.status, ["Open", "In progress"])).get()),
    c(db.select({ n: count() }).from(incidents).where(inArray(incidents.status, ["INVESTIGATING", "IDENTIFIED", "MONITORING"])).get()),
    c(db.select({ n: count() }).from(leads).where(eq(leads.status, "New")).get()),
  ]);
  const group = (title: string, items: [string, string | number, string?][]) => <Panel title={title}><div className="app-grid app-grid-3">{items.map(([l, v, h]) => <Stat key={l} label={l} value={v} href={h} />)}</div></Panel>;
  return <AdminShell roles={roles} email={user.email} active="overview">
    <PageHead kicker="Admin · Executive overview" title="DigitalBurj today" lede="Live operational counts across the ecosystem. Revenue analytics appear as invoices are issued; card payments are not connected yet." />
    {group("Platform", [["People signed in", users, "/admin/access"], ["Active last 30 days", active30], ["Organizations", orgs]])}
    {group("Academy", [["Awaiting assessment", reviewQ, "/admin/academy"], ["Awaiting verification", verifyQ, "/admin/academy?tab=verify"], ["Active credentials", creds, "/admin/academy?tab=credentials"]])}
    {group("Studio & Business AI", [["Studio projects in delivery", studioActive, "/admin/studio"], ["Business AI in implementation", businessActive, "/admin/business"], ["Automations live", live], ["Client approvals pending", pendingApprovals]])}
    {group("Talent & Jobs", [["Verification queue", tViq, "/admin/talent"], ["Verified capabilities", profiles], ["Open jobs", openJobs, "/admin/jobs"], ["Applications", apps], ["Hires", hires]])}
    {group("Finance, support & reliability", [["Receivables", receivable.length ? money(receivable.reduce((a, b) => a + b.amountMinor, 0), receivable[0].currency) : "—", "/admin/finance"], ["Open support tickets", openTickets, "/admin/support"], ["Open incidents", openIncidents, "/admin/status"], ["New channel requests", newLeads, "/admin/leads"]])}
    <p className="app-note">Need another role? Ask a Security Admin in <Link href="/admin/access" style={{ textDecoration: "underline" }}>Identity & access</Link>.</p>
  </AdminShell>;
}
