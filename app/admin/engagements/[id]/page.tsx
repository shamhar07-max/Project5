import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "../../../../db";
import { engagementEntries, engagementEvents, engagements, enquiries, organizations } from "../../../../db/schema";
import { STAGES } from "../../../../lib/delivery";
import { Btn, Chip, PageHead, Panel, Timeline } from "../../../_app/kit";
import { DeliveryView } from "../../../_app/delivery";
import { AdminShell } from "../../shell";
import { adminContext } from "../../../../lib/platform";
import { setStage } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminEngagement({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const eng = await db.select().from(engagements).where(eq(engagements.id, id)).get();
  if (!eng || !["studio", "business"].includes(eng.service)) notFound();
  const section = eng.service === "studio" ? "studio" : "business";
  const { user, roles } = await adminContext(section);
  const [enquiry, entries, events, org] = await Promise.all([
    db.select().from(enquiries).where(eq(enquiries.id, eng.enquiryId)).get(),
    db.select().from(engagementEntries).where(eq(engagementEntries.engagementId, id)).orderBy(asc(engagementEntries.createdAt)),
    db.select().from(engagementEvents).where(eq(engagementEvents.engagementId, id)).orderBy(asc(engagementEvents.createdAt)),
    eng.orgId ? db.select().from(organizations).where(eq(organizations.id, eng.orgId)).get() : Promise.resolve(undefined),
  ]);
  return <AdminShell roles={roles} email={user.email} active={section}>
    <PageHead back={{ href: `/admin/${section}`, label: section === "studio" ? "Studio pipeline" : "Business AI engagements" }} kicker={`Admin · ${section === "studio" ? "Studio" : "Business AI"} · ${org?.name ?? "Individual client"}`} title={eng.title} lede={enquiry?.problem} actions={<Chip state={eng.stage} text={eng.stage} />} />
    <div className="app-split">
      <div><DeliveryView eng={eng} mode="admin" /></div>
      <div>
        <Panel title="Stage"><form action={setStage} className="app-inline"><input type="hidden" name="id" value={eng.id} /><select name="stage" defaultValue={eng.stage} style={{ flex: 1 }}>{STAGES[eng.service as "studio" | "business"].map(s => <option key={s}>{s}</option>)}</select><Btn kind="secondary">Update</Btn></form></Panel>
        {enquiry && <Panel title="Enquiry"><dl className="app-kv"><dt>Audience</dt><dd>{enquiry.audience || "—"}</dd><dt>Current state</dt><dd>{enquiry.currentState || "—"}</dd><dt>Desired outcome</dt><dd>{enquiry.desiredOutcome || "—"}</dd><dt>Budget</dt><dd>{enquiry.budget || "—"}</dd><dt>Timeline</dt><dd>{enquiry.timeline || "—"}</dd></dl></Panel>}
        <Panel title={`Client brief (${entries.length})`}>{entries.map(e => <details key={e.id} className="app-more"><summary>{e.kind}: {e.title}</summary><p className="app-pre">{e.detail}</p>{e.measurement && <p className="app-note">{e.measurementBasis}: {e.measurement}</p>}</details>)}</Panel>
        <Panel title="History"><Timeline items={[...events].reverse().map(e => ({ at: e.createdAt, title: e.action.replaceAll(".", " ").replaceAll("_", " "), detail: e.detail }))} /></Panel>
      </div>
    </div>
  </AdminShell>;
}
