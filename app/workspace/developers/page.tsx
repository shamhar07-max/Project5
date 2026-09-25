import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { apiKeys, webhookDeliveries, webhooks } from "../../../db/schema";
import { AppShell, Btn, Chip, Denied, Empty, Field, PageHead, Panel, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { can } from "../../../lib/platform";
import { addWebhook, revokeApiKey, sendTestEvent, toggleWebhook } from "./actions";
import { KeyForm } from "./key-form";

export const dynamic = "force-dynamic";
const EVENTS = "studio.*, business.*, academy.*, jobs.*, talent.*, billing.*, support.*, approval.*";

export default async function Developers() {
  const { ctx, info } = await loadApp();
  const head = <PageHead kicker="API & integrations" title="Developers" lede={<>Connect your systems to DigitalBurj with scoped API keys and signed webhooks. Read the <Link href="/docs/api" style={{ textDecoration: "underline" }}>API reference</Link>.</>} />;
  if (!ctx.orgId || !can(ctx.role, "developer.manage")) return <AppShell info={info} active="developers">{head}<Denied>API keys and webhooks belong to an organization. Switch to an organization where you are an owner or admin.</Denied></AppShell>;
  const db = getDb();
  const [keys, hooks] = await Promise.all([
    db.select().from(apiKeys).where(eq(apiKeys.orgId, ctx.orgId)).orderBy(desc(apiKeys.createdAt)),
    db.select().from(webhooks).where(eq(webhooks.orgId, ctx.orgId)).orderBy(desc(webhooks.createdAt)),
  ]);
  const deliveries = hooks.length ? await db.select().from(webhookDeliveries).where(inArray(webhookDeliveries.webhookId, hooks.map(h => h.id))).orderBy(desc(webhookDeliveries.createdAt)).limit(20) : [];
  return <AppShell info={info} active="developers">
    {head}
    <div className="app-grid app-grid-2">
      <Panel title="API keys" sub="Keys act for this organization only, within the scopes you choose. Only a hash is stored.">
        <KeyForm />
        <div className="app-rows" style={{ marginTop: "1rem" }}>{keys.map(k => <div key={k.id} className="app-row"><div className="app-row-main"><strong>{k.name} <code className="app-note">{k.prefix}…</code></strong><small>{k.scopes} · last used {fmt(k.lastUsedAt)}</small></div>{k.revokedAt ? <Chip state="REVOKED" /> : <form action={revokeApiKey}><input type="hidden" name="id" value={k.id} /><Btn kind="danger">Revoke</Btn></form>}</div>)}{!keys.length && <Empty title="No API keys yet" />}</div>
      </Panel>
      <Panel title="Webhooks" sub="We POST signed JSON (header x-digitalburj-signature: sha256=HMAC of the body with your secret)." actions={hooks.length > 0 && <form action={sendTestEvent}><Btn kind="secondary">Send test event</Btn></form>}>
        <form action={addWebhook} className="app-form"><Field label="Endpoint URL"><input name="url" type="url" required placeholder="https://example.com/digitalburj/webhook" /></Field><Field label="Events" hint="Comma-separated. Use * for everything or a prefix such as studio.*"><input name="events" required defaultValue={EVENTS} /></Field><div><Btn>Add webhook</Btn></div></form>
        <div className="app-rows" style={{ marginTop: "1rem" }}>{hooks.map(h => <div key={h.id} className="app-row"><div className="app-row-main"><strong>{h.url}</strong><small>{h.events}</small><details className="app-more"><summary>Signing secret</summary><code className="app-code">{h.secret}</code></details></div><Chip state={h.active ? "ACTIVE" : "PAUSED"} /><form action={toggleWebhook}><input type="hidden" name="id" value={h.id} /><Btn kind="ghost">{h.active ? "Disable" : "Enable"}</Btn></form></div>)}{!hooks.length && <Empty title="No webhooks yet" />}</div>
      </Panel>
    </div>
    <Panel title="Recent deliveries">{deliveries.length ? <table className="app-table"><thead><tr><th>When</th><th>Webhook</th><th>HTTP</th><th>Result</th></tr></thead><tbody>{deliveries.map(d => <tr key={d.id}><td>{fmt(d.createdAt)}</td><td>{hooks.find(h => h.id === d.webhookId)?.url}</td><td>{d.httpStatus ?? "—"}</td><td><Chip state={d.status === "delivered" ? "COMPLETED" : "FAILED"} text={d.status} /></td></tr>)}</tbody></table> : <Empty title="No deliveries yet" />}</Panel>
  </AppShell>;
}
