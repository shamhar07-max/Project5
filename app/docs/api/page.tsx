import type { CSSProperties } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../site-shell";
import { SectionHead } from "../../_ui/sections";
import { API_SCOPES } from "../../../lib/api-scopes";

const endpoints: [string, string, string, string, string][] = [
  ["GET", "/api/v1/status", "Public", "—", "Component health, open incidents and maintenance."],
  ["GET", "/api/v1/academy/courses", "Public", "—", "Academy catalogue. Query: family, limit, offset."],
  ["GET", "/api/v1/academy/credentials/{code}", "Public", "—", "Verify a credential ID (DBC-XXXXXXXX)."],
  ["GET", "/api/v1/jobs/listings", "Public / key", "read:jobs with ?mine=1", "Published roles, or your organization's roles."],
  ["POST", "/api/v1/jobs/listings", "Key or user", "write:jobs", "Create a DRAFT role. Publishing stays a human action."],
  ["GET", "/api/v1/jobs/applications", "Key or user", "read:jobs", "Your organization's applications (recruiters) or your own (candidates)."],
  ["GET", "/api/v1/me", "Signed-in user", "—", "The signed-in person and their organizations."],
  ["GET", "/api/v1/organization", "Key or user", "read:organization", "Organization, members and employer verification."],
  ["GET", "/api/v1/studio/engagements", "Key or user", "read:studio", "Studio projects in the context."],
  ["GET", "/api/v1/business/engagements", "Key or user", "read:business", "Business AI engagements in the context."],
  ["GET", "/api/v1/support/tickets", "Key or user", "read:support", "Tickets with workflow status and priority."],
  ["GET", "/api/v1/events", "Key or user", "read:organization", "Organization event feed (same events as webhooks)."],
  ["GET", "/api/v1/audit", "Key or owner/admin", "read:audit", "Organization audit log."],
  ["GET", "/api/v1/search?q=", "Signed-in user", "—", "Authorized search across your records."],
];
const events = ["academy.submission.created", "academy.assessment.reviewed", "academy.credential.issued", "studio.discovery.requested", "studio.validation.decided", "studio.milestone.submitted", "studio.change_request.quoted", "approval.approved", "approval.rejected", "business.metric.updated", "business.automation.approval_requested", "business.automation.live", "business.automation.failed", "talent.verification.completed", "jobs.application.created", "jobs.interview.scheduled", "jobs.offer.created", "jobs.offer.accepted", "billing.invoice.issued", "billing.invoice.paid", "support.ticket.created", "developer.test"];

export default function ApiDocs() {
  return <main className="public-site" style={{ "--a": "#2563eb", "--b": "#7c3aed" } as CSSProperties}>
    <SiteHeader />
    <section className="section" style={{ paddingTop: "8rem" }}>
      <div className="shell" style={{ maxWidth: 1080 }}>
        <SectionHead index="v1" kicker="Developers · api.digitalburj.com" title={<>One secure <em>integration boundary.</em></>}><p>Versioned, scoped and audited. Create keys and webhooks under Workspace → Developers.</p></SectionHead>
        <h3 className="job-h">Authentication</h3>
        <p className="job-p">Server-to-server: send <code>Authorization: Bearer dbk_…</code> with an organization API key. Keys act only for their organization and only within their scopes: {API_SCOPES.join(", ")}. In the browser, signed-in requests act as the person; add <code>?organization=&lt;id&gt;</code> to act in an organization where they are an active member.</p>
        <h3 className="job-h">Endpoints</h3>
        <div style={{ overflowX: "auto" }}><table className="app-table" style={{ background: "#fff", borderRadius: 14 }}><thead><tr><th>Method</th><th>Path</th><th>Auth</th><th>Scope</th><th>Description</th></tr></thead><tbody>{endpoints.map(e => <tr key={e[0] + e[1]}><td><b>{e[0]}</b></td><td><code>{e[1]}</code></td><td>{e[2]}</td><td>{e[3]}</td><td>{e[4]}</td></tr>)}</tbody></table></div>
        <h3 className="job-h">Pagination, rate limits and request IDs</h3>
        <p className="job-p">List endpoints accept <code>limit</code> (1–100, default 25) and <code>offset</code>. Every response carries <code>x-request-id</code> (send your own to correlate). Requests are rate limited per key, person or IP; exceeding the limit returns 429.</p>
        <h3 className="job-h">Errors</h3>
        <pre className="app-code">{`HTTP/1.1 403
{ "error": { "code": "insufficient_scope", "message": "This key lacks the read:audit scope.",
             "details": null, "requestId": "0b6c…", "status": 403 } }`}</pre>
        <h3 className="job-h">Example</h3>
        <pre className="app-code">{`curl https://digitalburj.com/api/v1/organization \\
  -H "Authorization: Bearer dbk_your_key"`}</pre>
        <h3 className="job-h">Webhooks</h3>
        <p className="job-p">DigitalBurj POSTs JSON to your https endpoint for subscribed events (exact names, <code>prefix.*</code> or <code>*</code>). Verify <code>x-digitalburj-signature: sha256=&lt;hex&gt;</code> = HMAC-SHA256(secret, raw body). Deliveries time out after 4 seconds; outcomes appear in your delivery log. Events: {events.join(", ")}.</p>
        <pre className="app-code">{`import crypto from "node:crypto";
const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(req.headers["x-digitalburj-signature"]));`}</pre>
        <p className="app-note" style={{ marginTop: "1.5rem" }}>Versioning: breaking changes ship as /api/v2 with a deprecation notice. See also the <Link href="/support/api-webhooks" style={{ textDecoration: "underline" }}>API keys and webhooks guide</Link>.</p>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
