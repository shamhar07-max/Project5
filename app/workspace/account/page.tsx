import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { academyProfiles, talentSettings, userPreferences } from "../../../db/schema";
import { AppShell, Btn, Field, PageHead, Panel } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { requestDeletion, savePreferences } from "../platform-actions";
import { staffRolesFor, STAFF_ROLES } from "../../../lib/platform";

export const dynamic = "force-dynamic";

export default async function Account() {
  const { ctx, info } = await loadApp();
  const db = getDb();
  const [prefs, academy, talent, roles] = await Promise.all([
    db.select().from(userPreferences).where(eq(userPreferences.userId, ctx.user.userId)).get(),
    db.select().from(academyProfiles).where(eq(academyProfiles.ownerId, ctx.user.userId)).get(),
    db.select().from(talentSettings).where(eq(talentSettings.ownerId, ctx.user.userId)).get(),
    staffRolesFor(ctx.user.email),
  ]);
  return <AppShell info={info} active="account">
    <PageHead kicker="Account" title="Profile, privacy & consent" lede="One DigitalBurj identity across every division. You control what is shared between them." />
    <div className="app-split">
      <div>
        <Panel title="Profile & preferences">
          <form action={savePreferences} className="app-form">
            <div className="app-form-row">
              <Field label="Display name"><input name="displayName" defaultValue={prefs?.displayName ?? ctx.user.fullName ?? ""} maxLength={80} /></Field>
              <Field label="Language"><select name="locale" defaultValue={prefs?.locale ?? "en"}><option value="en">English</option><option value="ar">العربية (Arabic)</option></select></Field>
            </div>
            <label className="app-check"><input type="checkbox" name="emailNotifications" defaultChecked={prefs?.emailNotifications ?? true} /> Email me about approvals, reviews and application updates (when email delivery is connected)</label>
            <label className="app-check"><input type="checkbox" name="productUpdates" defaultChecked={prefs?.productUpdates ?? false} /> Send me occasional DigitalBurj product updates</label>
            <label className="app-check"><input type="checkbox" name="researchConsent" defaultChecked={prefs?.researchConsent ?? false} /> I agree to anonymized use of my activity to improve DigitalBurj</label>
            <div><Btn>Save preferences</Btn></div>
          </form>
        </Panel>
        <Panel title="Cross-division consent" sub="Nothing moves between divisions automatically (blueprint Domain 05 §9).">
          <dl className="app-kv">
            <dt>Academy evidence → Talent</dt><dd>{academy?.talentConsent ? "Allowed" : "Not allowed"} · <Link href="/workspace/academy/profile">change</Link></dd>
            <dt>Talent profile visibility</dt><dd>{talent?.visibility ?? "private"} · <Link href="/workspace/talent">change</Link></dd>
            <dt>Searchable by verified employers</dt><dd>{talent?.searchable ? "Yes" : "No"}</dd>
          </dl>
        </Panel>
      </div>
      <div>
        <Panel title="Your data">
          <p className="app-note">Download everything DigitalBurj holds about you as JSON: preferences, learning, submissions, credentials, evidence, applications, tickets and notifications.</p>
          <p style={{ marginTop: ".8rem" }}>{/* A plain link: this is a file download from a route handler, not a page. */}
            <a className="app-btn app-btn-secondary" href="/workspace/account/export" download>Download my data</a></p>
        </Panel>
        <Panel title="Delete my account" tone="warn">
          <p className="app-note">Deletion is reviewed by a person so legal and financial records are handled correctly. We open a tracked privacy ticket and confirm each step.</p>
          <form action={requestDeletion} className="app-form" style={{ marginTop: ".8rem" }}><Field label="Reason"><textarea name="reason" required minLength={5} maxLength={1000} rows={3} /></Field><div><Btn kind="danger">Request deletion</Btn></div></form>
        </Panel>
        {roles.size > 0 && <Panel title="DigitalBurj staff roles"><p className="app-note">{[...roles].map(r => STAFF_ROLES[r]).join(", ")}</p></Panel>}
      </div>
    </div>
  </AppShell>;
}
