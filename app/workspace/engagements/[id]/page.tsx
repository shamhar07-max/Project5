import Link from "next/link";
import { and, asc, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../../db";
import { engagements, engagementEntries, engagementEvents, enquiries } from "../../../../db/schema";
import { engagementKinds } from "../../../../lib/engagement-workflow";
import { AppShell, Btn, Chip, Empty, Field, PageHead, Panel, Timeline } from "../../../_app/kit";
import { loadApp } from "../../../_app/shell";
import { DeliveryView } from "../../../_app/delivery";
import { addEngagementEntry, requestDiscovery } from "../actions";

export const dynamic = "force-dynamic";

export default async function EngagementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { ctx, info } = await loadApp();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const item = await db.select().from(engagements).where(and(eq(engagements.id, id), ctx.orgId ? eq(engagements.orgId, ctx.orgId) : and(eq(engagements.ownerId, ctx.user.userId), isNull(engagements.orgId)))).get();
  if (!item || !["studio", "business"].includes(item.service)) notFound();
  const [entries, events, enquiry] = await Promise.all([
    db.select().from(engagementEntries).where(eq(engagementEntries.engagementId, item.id)).orderBy(asc(engagementEntries.createdAt)),
    db.select().from(engagementEvents).where(eq(engagementEvents.engagementId, item.id)).orderBy(asc(engagementEvents.createdAt)),
    db.select().from(enquiries).where(eq(enquiries.id, item.enquiryId)).get(),
  ]);
  const studio = item.service === "studio";
  const canEdit = ctx.role !== "guest" && item.stage === "Draft";
  const kinds = engagementKinds[item.service as keyof typeof engagementKinds];
  return <AppShell info={info} active={studio ? "studio" : "business"}>
    <PageHead back={{ href: `/workspace/engagements?service=${item.service}`, label: studio ? "Studio projects" : "Business AI engagements" }} kicker={`${studio ? "Studio · product discovery & delivery" : "Business AI · diagnosis & transformation"}`} title={item.title} lede={enquiry?.problem} actions={<Chip state={item.stage} text={item.stage} />} />
    <div className="app-split">
      <div>
        {canEdit && <Panel title={`Add ${studio ? "discovery" : "diagnosis"} detail`} sub="Separate evidence from assumptions. The brief stays private to this workspace until you request discovery.">
          <form action={addEngagementEntry} className="app-form"><input type="hidden" name="engagementId" value={item.id} />
            <div className="app-form-row"><Field label="Entry type"><select name="kind" required>{kinds.map(k => <option key={k} value={k}>{k}</option>)}</select></Field><Field label="Title"><input name="title" required minLength={3} maxLength={140} /></Field></div>
            <Field label="Details"><textarea name="detail" required minLength={15} maxLength={4000} rows={4} placeholder={studio ? "Who needs this, what is uncertain and what would success look like?" : "What happens now, where is the friction and who owns the process?"} /></Field>
            <Field label="Evidence or source" hint="Required when a baseline is marked measured."><textarea name="evidence" maxLength={800} rows={2} /></Field>
            {!studio && <div className="app-form-row"><Field label="Baseline value (baselines only)"><input name="measurement" maxLength={120} placeholder="e.g. 12 hours per week" /></Field><Field label="Basis"><select name="measurementBasis"><option value="">Not a baseline</option><option value="Measured">Measured</option><option value="Estimated">Estimated</option></select></Field></div>}
            <div><Btn>Save entry</Btn></div>
          </form>
        </Panel>}
        {item.stage !== "Draft" && <DeliveryView eng={item} mode="client" canRequestChange={ctx.role !== "guest"} />}
        <Panel title={studio ? "Discovery & validation record" : "Diagnosis & baselines"} sub={`${entries.length} entries from your brief`}>
          {entries.length ? <div className="app-rows">{entries.map(e => <div key={e.id} className="app-row" style={{ alignItems: "flex-start" }}><div className="app-row-main"><strong>{e.title}</strong><small>{e.kind}</small><p className="app-pre" style={{ marginTop: ".3rem" }}>{e.detail}</p>{e.measurement && <p className="app-note">{e.measurementBasis}: {e.measurement}</p>}{e.evidence && <p className="app-note">Source: {e.evidence}</p>}</div></div>)}</div> : <Empty title="No entries yet">Add a clear problem or current process first.</Empty>}
        </Panel>
      </div>
      <div>
        <Panel title="Next step">
          <p className="app-note">{item.stage === "Draft" ? "Add your information, then request a discovery conversation. Submitting is not an approval, quotation or delivery commitment." : "The DigitalBurj team now works from your brief. Decisions, milestones and approvals appear on this page, and anything needing you shows in your approval center."}</p>
          {canEdit && <form action={requestDiscovery} style={{ marginTop: ".8rem" }}><input type="hidden" name="engagementId" value={item.id} /><Btn disabled={!entries.length}>Request discovery</Btn></form>}
          <p style={{ marginTop: ".8rem" }}><Link href="/workspace/files" className="app-btn app-btn-secondary">Workspace files</Link></p>
        </Panel>
        <Panel title="History"><Timeline items={[...events].reverse().map(e => ({ at: e.createdAt, title: e.action.replaceAll(".", " ").replaceAll("_", " "), detail: e.detail }))} /></Panel>
      </div>
    </div>
  </AppShell>;
}
