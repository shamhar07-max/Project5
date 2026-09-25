import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { talentEvidence, talentProfiles, talentSettings, verificationRequests } from "../../../db/schema";
import { AppShell, Btn, Chip, Empty, Field, PageHead, Panel } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { verifiedEmployerOrg } from "../../../lib/talent";
import { addTalentEvidence, removeTalentEvidence, requestEvidenceVerification, saveTalentProfile, saveTalentSettings, setEvidenceVisibility } from "./actions";

export const dynamic = "force-dynamic";
const stateOf = (s: string) => s === "Verified" ? "VERIFIED" : s === "Submitted" ? "UNDER_REVIEW" : "DRAFT";

export default async function Talent() {
  const { ctx, info } = await loadApp();
  const me = ctx.user.userId;
  const db = getDb();
  const [profile, settings, evidence, requests, employer] = await Promise.all([
    db.select().from(talentProfiles).where(eq(talentProfiles.ownerId, me)).get(),
    db.select().from(talentSettings).where(eq(talentSettings.ownerId, me)).get(),
    db.select().from(talentEvidence).where(eq(talentEvidence.ownerId, me)).orderBy(desc(talentEvidence.createdAt)),
    db.select().from(verificationRequests).where(eq(verificationRequests.ownerId, me)).orderBy(desc(verificationRequests.updatedAt)),
    verifiedEmployerOrg(me, ctx.orgId),
  ]);
  const suggested = (settings?.slug ?? (ctx.user.email.split("@")[0] + "-" + me.slice(-4))).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 40);
  return <AppShell info={info} active="talent">
    <PageHead kicker="Verified Talent · Capability Passport" title="Capability you can see. Evidence you can trust." lede="Declared ≠ assessed ≠ verified — each state is shown separately, and nothing is shared without your choice." actions={<>{employer && <Link className="app-btn app-btn-primary" href="/workspace/talent/search">Search talent</Link>}{settings && settings.visibility !== "private" && <Link className="app-btn app-btn-secondary" href={`/talent/p/${settings.slug}`}>View my passport</Link>}</>} />
    <div className="app-split">
      <div>
        <Panel title="Evidence" sub="Add work you have done, choose who can see each item and request independent verification.">
          {evidence.length ? <div className="app-rows">{evidence.map(e => { const req = requests.find(r => r.evidenceId === e.id); return <div key={e.id} className="app-row" style={{ alignItems: "flex-start" }}>
            <div className="app-row-main"><strong>{e.title}</strong><small>{e.capability} · {e.source}</small><p className="app-note" style={{ marginTop: ".3rem" }}>{e.description}</p>{req?.status === "MORE_INFO" && <p className="app-note" style={{ color: "#92400e" }}>Verifier asks: {req.note}</p>}</div>
            <Chip state={stateOf(e.status)} text={e.status} />
            <form action={setEvidenceVisibility} className="app-inline"><input type="hidden" name="id" value={e.id} /><select name="visibility" defaultValue={e.visibility} aria-label="Visibility" style={{ width: "auto" }}><option>Private</option><option>Employers</option><option>Public</option></select><Btn kind="ghost">Set</Btn></form>
            {e.status !== "Verified" && (!req || ["REJECTED", "MORE_INFO"].includes(req.status)) && <form action={requestEvidenceVerification} className="app-inline"><input type="hidden" name="id" value={e.id} /><input name="note" placeholder={req?.status === "MORE_INFO" ? "Your answer / link" : "Link or context for the verifier"} style={{ width: 200 }} /><Btn kind="secondary">{req?.status === "MORE_INFO" ? "Send" : "Request verification"}</Btn></form>}
            {!e.source.startsWith("Academy credential") && <form action={removeTalentEvidence}><input type="hidden" name="id" value={e.id} /><Btn kind="ghost">Remove</Btn></form>}
          </div>; })}</div> : <Empty title="No evidence yet">Add a project, or add a verified Academy credential from <Link href="/workspace/academy/credentials">your credentials</Link>.</Empty>}
          <details className="app-more" style={{ marginTop: "1rem" }}><summary>Add evidence</summary><form action={addTalentEvidence} className="app-form"><div className="app-form-row"><Field label="Title"><input name="title" required maxLength={120} /></Field><Field label="Capability"><input name="capability" required maxLength={80} placeholder="API design" /></Field></div><Field label="What you did and the result"><textarea name="description" required minLength={20} maxLength={1000} rows={3} /></Field><div><Btn>Add as declared evidence</Btn></div></form></details>
        </Panel>
        <Panel title="Profile">
          <form action={saveTalentProfile} className="app-form"><div className="app-form-row"><Field label="Headline"><input name="headline" required maxLength={120} defaultValue={profile?.headline} /></Field><Field label="Location"><input name="location" maxLength={100} defaultValue={profile?.location} /></Field><Field label="Availability"><select name="availability" defaultValue={profile?.availability ?? "Not specified"}>{["Not specified", "Open to work", "Open to projects", "Unavailable"].map(a => <option key={a}>{a}</option>)}</select></Field></div><Field label="Summary"><textarea name="summary" maxLength={1200} rows={3} defaultValue={profile?.summary} /></Field><div><Btn>Save profile</Btn></div></form>
        </Panel>
      </div>
      <div>
        <Panel title="Privacy center" sub="Blueprint Domain 05 §8: profile, search, contact and evidence visibility.">
          <form action={saveTalentSettings} className="app-form">
            <Field label="Name on passport"><input name="displayName" maxLength={80} defaultValue={settings?.displayName ?? ctx.user.fullName ?? ""} /></Field>
            <Field label="Passport address" hint={`digitalburj.com/talent/p/${settings?.slug ?? suggested}`}><input name="slug" required defaultValue={settings?.slug ?? suggested} /></Field>
            <Field label="Profile visibility"><select name="visibility" defaultValue={settings?.visibility ?? "private"}><option value="private">Private — only me</option><option value="employers">Verified employers (signed in)</option><option value="public">Public link</option></select></Field>
            <label className="app-check"><input type="checkbox" name="searchable" defaultChecked={settings?.searchable ?? false} /> Appear in verified employers&apos; talent search</label>
            <label className="app-check"><input type="checkbox" name="showContact" defaultChecked={settings?.showContact ?? false} /> Show a contact email on my passport</label>
            <Field label="Contact email"><input name="contactEmail" type="email" defaultValue={settings?.contactEmail} /></Field>
            <div><Btn>Save privacy settings</Btn></div>
          </form>
        </Panel>
        <Panel title="Verification history">{requests.length ? <div className="app-rows">{requests.map(r => <div key={r.id} className="app-row"><div className="app-row-main"><strong>{evidence.find(e => e.id === r.evidenceId)?.title ?? "Evidence"}</strong>{r.note && <small>{r.note}</small>}</div><Chip state={r.status} /></div>)}</div> : <Empty title="No verification requests" />}</Panel>
      </div>
    </div>
  </AppShell>;
}
