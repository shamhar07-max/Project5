import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { engagements, enquiries } from "../../../db/schema";
import { AppShell, Btn, Chip, Empty, PageHead, Panel, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { startEngagement } from "./actions";

export const dynamic = "force-dynamic";

export default async function EngagementsPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { ctx, info } = await loadApp();
  const service = (await searchParams).service === "business" ? "business" : "studio";
  const db = getDb();
  const filter = ctx.orgId ? eq(engagements.orgId, ctx.orgId) : and(eq(engagements.ownerId, ctx.user.userId), isNull(engagements.orgId));
  const enquiryFilter = ctx.orgId ? eq(enquiries.orgId, ctx.orgId) : and(eq(enquiries.ownerId, ctx.user.userId), isNull(enquiries.orgId));
  const [briefs, intake] = await Promise.all([
    db.select().from(engagements).where(and(filter, eq(engagements.service, service))).orderBy(desc(engagements.updatedAt)),
    db.select().from(enquiries).where(and(enquiryFilter, eq(enquiries.service, service))).orderBy(desc(enquiries.createdAt)),
  ]);
  const unstarted = intake.filter(item => !briefs.some(b => b.enquiryId === item.id));
  const studio = service === "studio";
  return <AppShell info={info} active={service}>
    <PageHead kicker={studio ? "Studio" : "Business AI"} title={studio ? "Projects" : "Engagements"} lede={studio ? "From discovery and validation to milestones, QA and release." : "From observation and diagnosis to measured, governed automation."} actions={<Link className="app-btn app-btn-primary" href={`/workspace/intake?service=${service}`}>New enquiry</Link>} />
    <Panel title="Working briefs">
      {briefs.length ? <div className="app-rows">{briefs.map(b => <Link key={b.id} href={`/workspace/engagements/${b.id}`} className="app-row"><div className="app-row-main"><strong>{b.title}</strong><small>Updated {fmt(b.updatedAt)}</small></div><Chip state={b.stage} text={b.stage} /></Link>)}</div> : <Empty title="No working briefs yet">Open one from an enquiry below.</Empty>}
    </Panel>
    {unstarted.length > 0 && <Panel title="Enquiries without a brief">
      <div className="app-rows">{unstarted.map(e => <form key={e.id} action={startEngagement} className="app-row"><input type="hidden" name="enquiryId" value={e.id} /><div className="app-row-main"><strong>{e.projectName}</strong><small>{e.problem.slice(0, 140)}</small></div>{ctx.role !== "guest" && <Btn kind="secondary">Open working brief</Btn>}</form>)}</div>
    </Panel>}
  </AppShell>;
}
