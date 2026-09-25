// End-to-end check of every blueprint workflow, run against `npm run deploy:local`.
// Each simulated person gets their own ChatGPT identity headers, which the production build honours.
// Needs Playwright (`npm i -g playwright` or PWPATH=<path to playwright>) and the staff email below
// listed in DIGITALBURJ_STAFF_EMAILS inside .dev.vars.   Usage: node scripts/e2e-flows.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PWPATH || "playwright");
const B = process.env.E2E_BASE_URL || "http://127.0.0.1:8787";
const SHOTS = process.env.E2E_SHOTS || "";
const run = Date.now().toString(36);
const browser = await chromium.launch();
const people = {
  client: { id: `client-${run}`, email: `client-${run}@example.com`, name: "Layla Haddad" },
  staff: { id: "staff-e2e", email: process.env.E2E_STAFF_EMAIL || "seedy@sites.test", name: "DigitalBurj Staff" },
  verifier: { id: `ver-${run}`, email: `verifier-${run}@example.com`, name: "Omar Verifier" },
  hr: { id: `hr-${run}`, email: `hr-${run}@acme.example`, name: "Hana HR" },
};
const pages = {};
const errors = [];
for (const [k, p] of Object.entries(people)) {
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, extraHTTPHeaders: { "oai-authenticated-user-id": p.id, "oai-authenticated-user-email": p.email, "oai-authenticated-user-full-name": encodeURIComponent(p.name), "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8" } });
  const page = await ctx.newPage();
  page.on("pageerror", e => errors.push(`${k}: ${e.message}`));
  page.on("response", r => { if (r.status() >= 500) errors.push(`${k}: ${r.status()} ${r.url()}`); });
  pages[k] = page;
}
const { client, staff, verifier, hr } = pages;
const go = (p, path) => p.goto(B + path, { waitUntil: "networkidle" });
const settle = p => p.waitForLoadState("networkidle").then(() => p.waitForTimeout(700));
const click = async (p, locator) => { await locator.click(); await settle(p); };
const step = async (name, fn) => { try { await fn(); console.log("✓", name); } catch (e) { console.log("✗", name, "—", e.message.split("\n")[0]); errors.push(`${name}: ${e.message.split("\n")[0]}`); } };
const expectText = async (p, text) => { const n = await p.getByText(text, { exact: false }).count(); if (!n) throw new Error(`expected text "${text}" on ${p.url()}`); };

// ── Academy ──
let missionId, credCode;
await step("staff creates and publishes a mission", async () => {
  await go(staff, "/admin/academy?tab=missions");
  const f = staff.locator("form", { has: staff.locator('select[name="courseCode"]') });
  await f.locator('select[name="courseCode"]').selectOption("DB-02");
  await f.locator('input[name="title"]').fill(`Build a booking API ${run}`);
  await f.locator('textarea[name="scenario"]').fill("A clinic needs appointments booked online without double-booking doctors.");
  await f.locator('input[name="objective"]').fill("Design and implement a small booking API with tests.");
  await f.locator('textarea[name="instructions"]').fill("Model doctors, slots and bookings. Prevent overlaps. Document decisions.");
  await f.locator('input[name="requiredOutput"]').fill("Repository link and a short design note");
  await f.locator('textarea[name="rubric"]').fill("Solves the stated problem\nPrevents double booking\nExplains trade-offs");
  await f.locator('input[name="skills"]').fill("API design, testing");
  await f.locator('input[name="published"]').check();
  await click(staff, f.getByRole("button", { name: "Create mission" }));
  await expectText(staff, `Build a booking API ${run}`);
});
await step("client submits the mission", async () => {
  await go(client, "/workspace/academy?course=DB-02");
  const link = client.getByRole("link", { name: new RegExp(`Build a booking API ${run}`) }).first();
  await click(client, link);
  missionId = client.url().split("/missions/")[1];
  await client.locator('textarea[name="content"]').fill("I modelled doctors, slots and bookings with a unique constraint on doctor+slot, added tests for overlaps and wrote a design note explaining trade-offs.");
  await client.locator('input[name="artifactUrl"]').fill("https://github.com/example/booking-api");
  await click(client, client.getByRole("button", { name: "Submit for review" }));
  await expectText(client, "Submitted");
});
await step("staff claims and assesses: passed", async () => {
  await go(staff, "/admin/academy?tab=review");
  const row = staff.locator(".app-row", { hasText: `Build a booking API ${run}` });
  await click(staff, row.getByRole("button", { name: "Claim" }));
  const row2 = staff.locator(".app-row", { hasText: `Build a booking API ${run}` });
  for (let i = 0; i < 3; i++) await row2.locator(`select[name="score${i}"]`).selectOption("3");
  await row2.locator('textarea[name="feedback"]').fill("Clear model, overlap prevention is tested, trade-offs explained well.");
  await row2.locator('select[name="decision"]').selectOption("PASSED");
  await click(staff, row2.getByRole("button", { name: "Record assessment" }));
});
await step("client requests independent verification", async () => {
  await go(client, `/workspace/academy/missions/${missionId}`);
  await expectText(client, "Passed");
  await click(client, client.getByRole("button", { name: "Request independent verification" }));
  await expectText(client, "Verification pending");
});
await step("assessor cannot verify their own assessment", async () => {
  await go(staff, "/admin/academy?tab=verify");
  await expectText(staff, "another verifier must decide");
});
await step("staff grants academy_verifier to an independent verifier", async () => {
  await go(staff, "/admin/access");
  const f = staff.locator("form", { has: staff.locator('select[name="role"]') }).last();
  await f.locator('input[name="email"]').fill(people.verifier.email);
  await f.locator('select[name="role"]').selectOption("academy_verifier");
  await f.locator('input[name="reason"]').fill("Independent verification for Academy");
  await click(staff, f.getByRole("button", { name: "Grant" }));
  await expectText(staff, people.verifier.email);
});
await step("verifier verifies and a credential is issued", async () => {
  await go(verifier, "/admin/academy?tab=verify");
  const row = verifier.locator(".app-row", { hasText: `Build a booking API ${run}` });
  await click(verifier, row.getByRole("button", { name: /Verify & issue credential/ }));
  await go(client, "/workspace/academy/credentials");
  credCode = (await client.locator(".app-row small").first().innerText()).split(" · ")[0];
  if (!/^DBC-/.test(credCode)) throw new Error("no credential code, got " + credCode);
});
await step("public credential page confirms validity (no email shown)", async () => {
  const anon = await (await browser.newContext()).newPage();
  await anon.goto(`${B}/verify/${credCode}`, { waitUntil: "networkidle" });
  await expectText(anon, "valid");
  if ((await anon.content()).includes(people.client.email)) throw new Error("email leaked on public page");
  const api = await (await fetch(`${B}/api/v1/academy/credentials/${credCode}`)).json();
  if (!api.valid) throw new Error("API says invalid");
});
await step("client adds credential to Talent and publishes passport", async () => {
  await go(client, "/workspace/academy/credentials");
  await click(client, client.getByRole("button", { name: "Add to Talent profile" }));
  await go(client, "/workspace/talent");
  const priv = client.locator("form", { has: client.locator('input[name="slug"]') });
  await priv.locator('input[name="slug"]').fill(`layla-${run}`);
  await priv.locator('select[name="visibility"]').selectOption("public");
  await click(client, priv.getByRole("button", { name: "Save privacy settings" }));
  const ev = client.locator(".app-row", { hasText: `Build a booking API ${run}` });
  await ev.locator('select[name="visibility"]').selectOption("Public");
  await click(client, ev.getByRole("button", { name: "Set" }));
  const anon = await (await browser.newContext()).newPage();
  await anon.goto(`${B}/talent/p/layla-${run}`, { waitUntil: "networkidle" });
  await expectText(anon, "Verified capabilities (1)");
});

// ── Studio ──
let studioEng;
const enquiry = async (service, name) => {
  await go(client, `/workspace/intake?service=${service}`);
  await client.locator('input[name="projectName"]').fill(name);
  await client.locator('textarea[name="problem"]').fill("Our team loses hours every week coordinating bookings manually across email and spreadsheets.");
  await click(client, client.getByRole("button", { name: "Submit enquiry" }));
  await go(client, `/workspace/engagements?service=${service}`);
  const row = client.locator("form.app-row", { hasText: name });
  await click(client, row.getByRole("button", { name: "Open working brief" }));
  const id = client.url().split("/engagements/")[1];
  await client.locator('input[name="title"]').fill("Who needs this");
  await client.locator('textarea[name="detail"]').fill("Front-desk staff and doctors need a shared, reliable view of bookings.");
  await click(client, client.getByRole("button", { name: "Save entry" }));
  await click(client, client.getByRole("button", { name: "Request discovery" }));
  return id;
};
await step("client opens a Studio brief and requests discovery", async () => { studioEng = await enquiry("studio", `Clinic booking app ${run}`); });
await step("staff records BUILD decision and a milestone, then submits it", async () => {
  await go(staff, `/admin/engagements/${studioEng}`);
  await staff.locator("summary", { hasText: "Record decision" }).click();
  const f = staff.locator("form", { has: staff.locator('textarea[name="notes"]') }).first();
  await f.locator('textarea[name="notes"]').fill("Clear user need, validated with 6 front-desk interviews; feasible in 8 weeks.");
  await click(staff, f.getByRole("button", { name: "Save decision" }));
  await staff.locator("summary", { hasText: "Add milestone" }).click();
  const m = staff.locator("form", { has: staff.locator('textarea[name="deliverables"]') });
  await m.locator('input[name="title"]').fill("MVP booking flow");
  await m.locator('textarea[name="deliverables"]').fill("Book, reschedule and cancel; overlap prevention; acceptance tests.");
  await click(staff, m.getByRole("button", { name: "Add milestone" }));
  await click(staff, staff.locator(".app-row", { hasText: "MVP booking flow" }).getByRole("button", { name: "Start" }));
  await click(staff, staff.locator(".app-row", { hasText: "MVP booking flow" }).getByRole("button", { name: "Submit for approval" }));
});
await step("client approves the milestone in the approval center", async () => {
  await go(client, "/workspace/approvals");
  const row = client.locator(".app-row", { hasText: "Approve milestone: MVP booking flow" });
  await click(client, row.getByRole("button", { name: "Approve" }));
  await go(client, `/workspace/engagements/${studioEng}`);
  await expectText(client, "BUILD");
  if (!(await client.locator(".app-row", { hasText: "MVP booking flow" }).getByText("Approved").count())) throw new Error("milestone not approved");
});

// ── Business AI ──
let bizEng;
await step("client opens a Business AI brief", async () => { bizEng = await enquiry("business", `Invoice automation ${run}`); });
await step("staff adds a HIGH-risk automation and requests design approval", async () => {
  await go(staff, `/admin/engagements/${bizEng}`);
  await staff.locator("summary", { hasText: "Add automation" }).click();
  const f = staff.locator("form", { has: staff.locator('select[name="riskLevel"]') });
  await f.locator('input[name="name"]').fill("Invoice triage");
  await f.locator('select[name="riskLevel"]').selectOption("HIGH");
  await f.locator('textarea[name="objective"]').fill("Cut invoice handling from 12 to 3 hours a week.");
  await f.locator('input[name="trigger"]').fill("New invoice email");
  await click(staff, f.getByRole("button", { name: "Add automation" }));
  const row = () => staff.locator(".app-row", { hasText: "Invoice triage" });
  await click(staff, row().getByRole("button", { name: "designed" }));
  await click(staff, row().getByRole("button", { name: "Request design approval" }));
});
await step("client approves design; staff builds to pilot; go-live needs client approval", async () => {
  await go(client, "/workspace/approvals");
  await click(client, client.locator(".app-row", { hasText: "Approve design: Invoice triage" }).getByRole("button", { name: "Approve" }));
  await go(staff, `/admin/engagements/${bizEng}`);
  const row = () => staff.locator(".app-row", { hasText: "Invoice triage" });
  for (const s of ["building", "testing", "pilot"]) await click(staff, row().getByRole("button", { name: s, exact: true }));
  await click(staff, row().getByRole("button", { name: "Request go-live approval" }));
  await go(client, "/workspace/approvals");
  await click(client, client.locator(".app-row", { hasText: "Approve go-live: Invoice triage" }).getByRole("button", { name: "Approve" }));
  await go(client, `/workspace/engagements/${bizEng}`);
  if (!(await client.locator(".app-row", { hasText: "Invoice triage" }).getByText("Live").count())) throw new Error("automation not live");
});

// ── Jobs ──

await step("employer creates org and requests verification; staff verifies", async () => {
  await go(hr, "/workspace/organizations");
  await hr.locator('input[name="name"]').fill(`Acme Clinics ${run}`);
  await click(hr, hr.getByRole("button", { name: "Create" }));
  await click(hr, hr.locator("form.app-panel", { hasText: `Acme Clinics ${run}` }).getByRole("button", { name: "Switch here" }));
  await hr.locator('input[name="website"]').fill("https://acme.example");
  await click(hr, hr.getByRole("button", { name: "Request verification" }));
  await go(staff, "/admin/talent?tab=employers");
  await click(staff, staff.locator(".app-row", { hasText: `Acme Clinics ${run}` }).getByRole("button", { name: "Verify" }));
});
await step("employer drafts and publishes a role", async () => {
  await go(hr, "/workspace/jobs/employer");
  const f = hr.locator("form", { has: hr.locator('textarea[name="requirements"]') });
  await f.locator('input[name="title"]').fill(`Backend Engineer ${run}`);
  await f.locator('input[name="location"]').fill("Dubai, UAE");
  await f.locator('textarea[name="description"]').fill("Build and run the booking platform used by our clinics across the UAE, with a focus on reliability.");
  await f.locator('textarea[name="requirements"]').fill("APIs, databases, testing");
  await f.locator('input[name="skills"]').fill("API design, SQL");
  await click(hr, f.getByRole("button", { name: "Save as draft" }));
  await click(hr, hr.locator(".app-row", { hasText: `Backend Engineer ${run}` }).getByRole("button", { name: "Publish" }));
});
await step("candidate applies with passport shared", async () => {
  await go(client, `/jobs/board?q=${run}`);
  await click(client, client.getByRole("link", { name: new RegExp(`Backend Engineer ${run}`) }));

  await client.locator('textarea[name="coverNote"]').fill("I build reliable booking APIs and have a verified credential in API design.");
  await client.locator('input[name="shareProfile"]').check();
  await click(client, client.getByRole("button", { name: "Submit application" }));
  await expectText(client, "Current stage");
});
await step("employer moves candidate, schedules interview and submits offer", async () => {
  await go(hr, "/workspace/jobs/employer");
  await click(hr, hr.getByRole("link", { name: new RegExp(`Backend Engineer ${run}`) }));
  const row = () => hr.locator(".app-row", { hasText: "Layla Haddad" });
  for (const s of ["under review", "shortlisted"]) { await row().locator("details", { hasText: "Actions" }).last().evaluate(d => { d.open = true; }); await click(hr, row().getByRole("button", { name: s, exact: true })); }
  await row().locator("details", { hasText: "Actions" }).last().evaluate(d => { d.open = true; });
  await row().locator('input[name="scheduledAt"]').fill("2030-01-15T10:00");
  await row().locator('input[name="interviewer"]').fill("Dr. Amal");
  await click(hr, row().getByRole("button", { name: "Schedule interview" }));
  await row().locator("details", { hasText: "Actions" }).last().evaluate(d => { d.open = true; });
  await row().locator('textarea[name="terms"]').fill("Backend Engineer, AED 18,000/month, start 1 Feb 2030.");
  await click(hr, row().getByRole("button", { name: "Submit offer for approval" }));
  await go(hr, "/workspace/approvals");
  await click(hr, hr.locator(".app-row", { hasText: "Approve offer" }).getByRole("button", { name: "Approve" }));
});
await step("candidate accepts the offer → hired", async () => {
  await go(client, "/workspace/jobs/applications");
  await click(client, client.getByRole("button", { name: "Accept offer" }));
  await expectText(client, "Hired");
});

// ── Support, finance, status, API, notifications ──
await step("client ticket → staff reply → client sees reply", async () => {
  await go(client, "/workspace/support");
  await client.locator('select[name="topic"]').selectOption("Billing");
  await client.locator('textarea[name="message"]').fill(`Where can I find my invoice ${run}?`);
  await click(client, client.getByRole("button", { name: "Create ticket" }));
  const ticketUrl = client.url();
  await go(staff, "/admin/support?tab=unassigned");
  await click(staff, staff.getByRole("link", { name: /Billing/ }).first());
  await staff.locator('textarea[name="body"]').fill("Hi Layla — it is under Workspace → Billing.");
  await click(staff, staff.getByRole("button", { name: "Send" }));
  await client.goto(ticketUrl, { waitUntil: "networkidle" });
  await expectText(client, "Workspace → Billing");
});
await step("finance issues an invoice → client sees it", async () => {
  await go(staff, "/admin/finance");
  const f = staff.locator("form", { has: staff.locator('textarea[name="lines"]') });
  await f.locator('input[name="customerEmail"]').fill(people.client.email);
  await f.locator('input[name="description"]').fill(`Discovery ${run}`);
  await f.locator('textarea[name="lines"]').fill("Discovery workshop | 4500\nValidation report | 2500");
  await click(staff, f.getByRole("button", { name: "Create draft" }));
  await click(staff, staff.locator("tr", { hasText: `Discovery ${run}` }).getByRole("button", { name: "Issue" }));
  await go(client, "/workspace/billing");
  await expectText(client, `Discovery ${run}`);
});
await step("status incident appears publicly and via API", async () => {
  await go(staff, "/admin/status");
  const f = staff.locator("form", { has: staff.locator('select[name="kind"]') });
  await f.locator('input[name="title"]').fill(`Slow file uploads ${run}`);
  await f.locator('input[name="c:Files"]').check();
  await f.locator('textarea[name="body"]').fill("Uploads are slower than usual; we are investigating.");
  await click(staff, f.getByRole("button", { name: "Publish" }));
  const s = await (await fetch(`${B}/api/v1/status`)).json();
  if (!s.incidents.some(i => i.title.includes(run))) throw new Error("incident missing from API");
  const row = staff.locator(".app-row", { hasText: `Slow file uploads ${run}` });
  await row.locator('select[name="status"]').selectOption("RESOLVED");
  await row.locator('input[name="body"]').fill("Resolved: uploads are back to normal.");
  await click(staff, row.getByRole("button", { name: "Post" }));
});
await step("employer API key: scoped access and error model", async () => {
  await go(hr, "/workspace/developers");
  await hr.locator('input[name="name"]').fill("CRM sync");
  await click(hr, hr.getByRole("button", { name: "Create API key" }));
  const key = (await hr.locator("pre.app-code").first().innerText()).trim();
  const ok = await fetch(`${B}/api/v1/organization`, { headers: { authorization: `Bearer ${key}` } });
  const body = await ok.json();
  if (ok.status !== 200 || !body.name.includes(run)) throw new Error(`org call ${ok.status} ${JSON.stringify(body).slice(0, 120)}`);
  const denied = await fetch(`${B}/api/v1/audit`, { headers: { authorization: `Bearer ${key}` } });
  const dj = await denied.json();
  if (denied.status !== 403 || dj.error.code !== "insufficient_scope" || !dj.error.requestId) throw new Error(`expected 403 insufficient_scope, got ${denied.status}`);
  const bad = await fetch(`${B}/api/v1/organization`, { headers: { authorization: "Bearer dbk_nope" } });
  if (bad.status !== 401) throw new Error("bad key not rejected");
});
await step("client notifications and search reflect everything", async () => {
  await go(client, "/workspace/notifications");
  const n = await client.locator(".app-row").count();
  if (n < 8) throw new Error(`only ${n} notifications`);
  await go(client, `/workspace/search?q=${run}`);
  for (const t of ["Studio", "Business AI", "My applications", "Billing"]) await expectText(client, t);
});
await step("access control: client cannot open admin; outsider cannot see engagement", async () => {
  const r = await client.goto(`${B}/admin/academy`); if (r.status() !== 404) throw new Error(`admin status ${r.status()}`);
  const r2 = await hr.goto(`${B}/workspace/engagements/${studioEng}`); if (r2.status() !== 404) throw new Error(`engagement leak ${r2.status()}`);
});
if (SHOTS) {
  await go(client, "/workspace"); await client.screenshot({ path: `${SHOTS}/e2e-client-dashboard.png` });
  await go(client, `/workspace/engagements/${bizEng}`); await client.screenshot({ path: `${SHOTS}/e2e-business.png`, fullPage: true });
}
console.log("\nERRORS:", errors.length ? "\n" + errors.join("\n") : "none");
await browser.close();
process.exit(errors.length ? 1 : 0);
