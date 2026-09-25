// Authorized cross-domain search (blueprint Part II §5): every source is filtered
// by owner/organization in the query itself, so results, counts and snippets never
// reveal records the caller cannot open.
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import { getDb } from "../db";
import { academyMissions, engagements, enquiries, files, invoices, jobApplications, jobListings, messages, missionSubmissions, supportTickets, talentEvidence } from "../db/schema";
import { academyCourses } from "../app/academy-data";

export type SearchCtx = { user: { userId: string; email: string }; orgId: string | null };
export type Hit = { group: string; title: string; detail: string; href: string };

const pat = (q: string) => `%${q.replace(/[\\%_]/g, m => `\\${m}`)}%`;
const likeEsc = (col: Parameters<typeof like>[0], p: string) => sql`${col} LIKE ${p} ESCAPE '\\'`;

export async function searchAll(ctx: SearchCtx, raw: string): Promise<Hit[]> {
  const q = raw.trim().slice(0, 80);
  if (q.length < 2) return [];
  const p = pat(q); const db = getDb(); const me = ctx.user.userId;
  const scopeEng = ctx.orgId ? eq(engagements.orgId, ctx.orgId) : and(eq(engagements.ownerId, me), isNull(engagements.orgId));
  const scopeEnq = ctx.orgId ? eq(enquiries.orgId, ctx.orgId) : and(eq(enquiries.ownerId, me), isNull(enquiries.orgId));
  const scopeFiles = ctx.orgId ? eq(files.orgId, ctx.orgId) : and(eq(files.ownerId, me), isNull(files.orgId));
  const safe = <T,>(pr: Promise<T[]>) => pr.catch(() => [] as T[]);
  const [eng, enq, fl, msg, ev, subs, missions, jobs, apps, tickets, inv] = await Promise.all([
    safe(db.select().from(engagements).where(and(scopeEng, likeEsc(engagements.title, p))).orderBy(desc(engagements.updatedAt)).limit(10)),
    safe(db.select().from(enquiries).where(and(scopeEnq, or(likeEsc(enquiries.projectName, p), likeEsc(enquiries.problem, p)))).limit(10)),
    safe(db.select().from(files).where(and(scopeFiles, likeEsc(files.name, p))).limit(10)),
    ctx.orgId ? safe(db.select().from(messages).where(and(eq(messages.orgId, ctx.orgId), likeEsc(messages.body, p))).orderBy(desc(messages.createdAt)).limit(10)) : Promise.resolve([]),
    safe(db.select().from(talentEvidence).where(and(eq(talentEvidence.ownerId, me), or(likeEsc(talentEvidence.title, p), likeEsc(talentEvidence.capability, p)))).limit(10)),
    safe(db.select({ s: missionSubmissions, m: academyMissions }).from(missionSubmissions).innerJoin(academyMissions, eq(academyMissions.id, missionSubmissions.missionId)).where(and(eq(missionSubmissions.ownerId, me), likeEsc(academyMissions.title, p))).limit(10)),
    safe(db.select().from(academyMissions).where(and(eq(academyMissions.published, true), or(likeEsc(academyMissions.title, p), likeEsc(academyMissions.skills, p)))).limit(10)),
    safe(db.select().from(jobListings).where(and(ctx.orgId ? or(eq(jobListings.status, "PUBLISHED"), eq(jobListings.orgId, ctx.orgId)) : eq(jobListings.status, "PUBLISHED"), or(likeEsc(jobListings.title, p), likeEsc(jobListings.skills, p), likeEsc(jobListings.company, p)))).limit(10)),
    safe(db.select({ a: jobApplications, j: jobListings }).from(jobApplications).innerJoin(jobListings, eq(jobListings.id, jobApplications.jobId)).where(and(eq(jobApplications.candidateId, me), likeEsc(jobListings.title, p))).limit(10)),
    safe(db.select().from(supportTickets).where(and(eq(supportTickets.ownerId, me), or(likeEsc(supportTickets.topic, p), likeEsc(supportTickets.message, p)))).limit(10)),
    safe(db.select().from(invoices).where(and(ctx.orgId ? eq(invoices.orgId, ctx.orgId) : and(eq(invoices.customerEmail, ctx.user.email.toLowerCase()), isNull(invoices.orgId)), or(likeEsc(invoices.number, p), likeEsc(invoices.description, p)))).limit(10)),
  ]);
  const ql = q.toLowerCase();
  const courses = academyCourses.filter(c => c.title.toLowerCase().includes(ql) || c.code.toLowerCase().includes(ql)).slice(0, 8);
  return [
    ...eng.map(e => ({ group: e.service === "studio" ? "Studio" : "Business AI", title: e.title, detail: `Working brief · ${e.stage}`, href: `/workspace/engagements/${e.id}` })),
    ...enq.map(e => ({ group: "Enquiries", title: e.projectName, detail: e.status, href: "/workspace/intake" })),
    ...courses.map(c => ({ group: "Academy catalogue", title: `${c.code} · ${c.title}`, detail: `${c.family} · ${c.level}`, href: `/academy/catalogue?course=${c.code}` })),
    ...missions.map(m => ({ group: "Academy missions", title: m.title, detail: m.courseCode, href: `/workspace/academy/missions/${m.id}` })),
    ...subs.map(({ s, m }) => ({ group: "My submissions", title: m.title, detail: s.status.replace(/_/g, " "), href: `/workspace/academy/missions/${m.id}` })),
    ...ev.map(e => ({ group: "Talent evidence", title: e.title, detail: `${e.capability} · ${e.status}`, href: "/workspace/talent" })),
    ...jobs.map(j => ({ group: "Jobs", title: `${j.title} — ${j.company}`, detail: `${j.location} · ${j.status}`, href: j.status === "PUBLISHED" ? `/jobs/board/${j.id}` : "/workspace/jobs/employer" })),
    ...apps.map(({ a, j }) => ({ group: "My applications", title: j.title, detail: a.stage.replace(/_/g, " "), href: "/workspace/jobs/applications" })),
    ...fl.map(f => ({ group: "Files", title: f.name, detail: `${Math.ceil(f.size / 1024)} KB`, href: `/workspace/files/${f.id}` })),
    ...msg.map(m => ({ group: "Messages", title: m.body.slice(0, 90), detail: m.authorName, href: "/workspace/messages" })),
    ...tickets.map(t => ({ group: "Support", title: t.topic, detail: t.status, href: `/workspace/support/${t.id}` })),
    ...inv.map(i => ({ group: "Billing", title: `${i.number} · ${i.description}`, detail: i.status, href: "/workspace/billing" })),
  ];
}
