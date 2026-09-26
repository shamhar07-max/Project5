// End-to-end check of DigitalBurj Academy, run against `npm run deploy:local`.
// A learner registers, learns on Explorer, hits paywalls, uses the Creator Studio,
// activates a package with the DIGITALBURJ100 promotion, places a pending order
// that a DigitalBurj staff member confirms, and signs out and back in.
// Needs Playwright (`npm i -g playwright` or PWPATH=<path to playwright>), SESSION_SECRET in
// .dev.vars, and the staff email below listed in DIGITALBURJ_STAFF_EMAILS.
// Usage: node scripts/academy-e2e.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PWPATH || "playwright");
const B = process.env.E2E_BASE_URL || "http://localhost:8787";
const STAFF = process.env.E2E_STAFF_EMAIL || "seedy@sites.test";
const run = Date.now().toString(36);
const email = `learner-${run}@example.com`;
const password = "Learning2026!";

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errors = [];
const watch = (p, who) => { p.on("pageerror", e => errors.push(`${who}: ${e.message}`)); p.on("response", r => { if (r.status() >= 500) errors.push(`${who}: ${r.status()} ${r.url()}`); }); };
const learner = await (await browser.newContext({ viewport: { width: 1360, height: 900 } })).newPage();
const staff = await (await browser.newContext({ viewport: { width: 1360, height: 900 }, extraHTTPHeaders: { "oai-authenticated-user-id": "staff-academy-e2e", "oai-authenticated-user-email": STAFF } })).newPage();
watch(learner, "learner"); watch(staff, "staff");
const go = (p, path) => p.goto(B + path, { waitUntil: "networkidle" });
const step = async (name, fn) => { try { await fn(); console.log("✓", name); } catch (e) { console.log("✗", name, "—", e.message.split("\n")[0]); errors.push(`${name}: ${e.message.split("\n")[0]}`); } };
const p = learner;

await step("anonymous visitor is sent to sign-in and back to the same page", async () => {
  await go(p, "/academy/learn/studio/video");
  if (!p.url().includes("/academy/sign-in?next=%2Facademy%2Flearn%2Fstudio%2Fvideo")) throw new Error(p.url());
});
await step("register in three steps choosing Educator & Creator → checkout", async () => {
  await go(p, "/academy/register?plan=creator");
  await p.fill("input[name=name]", "Samira Haddad"); await p.fill("input[name=email]", email); await p.fill("input[name=password]", password);
  await p.click('button:has-text("Continue")');
  await p.selectOption("select[name=route]", "Teaching & content creation");
  await p.click('[data-step="1"] button:has-text("Continue")');
  await p.check("input[name=progress]"); await p.check("input[name=terms]");
  await p.click('button:has-text("Create account & continue")');
  await p.waitForURL(/\/academy\/checkout\?plan=creator/);
});
await step("registration alone does not unlock paid tools", async () => {
  await go(p, "/academy/learn/studio/video"); await p.getByText("is locked").first().waitFor();
});
await step("Explorer completes a DB-00 lesson and a mission stage", async () => {
  await go(p, "/academy/learn/courses/DB-00");
  await p.click('button:has-text("Mark complete")'); await p.getByText("Completed").first().waitFor();
  await p.click('nav[aria-label="Unit contents"] button:has-text("Rescue the shared drive")');
  await p.click('.a-stage:has-text("BRIEF")'); await p.waitForSelector('.a-stage[data-done="true"]');
});
await step("locked unit shows only its free first lesson", async () => {
  await go(p, "/academy/learn/courses/DB-05"); await p.getByText("previewing this unit").waitFor();
});
await step("AnyLessonPlan generates and saves", async () => {
  await go(p, "/academy/learn/studio/lesson-plan");
  await p.fill('input[placeholder^="e.g. Fractions"]', "Fractions on a number line");
  await p.click('button:has-text("Generate draft")'); await p.getByText("Fractions on a number line — Science").first().waitFor();
  await p.click('button:has-text("Save")'); await p.getByText("Saved to your studio").waitFor();
});
await step("invalid promotion code is rejected", async () => {
  await go(p, "/academy/checkout?plan=creator");
  await p.fill("input[name=coupon]", "WRONG"); await p.check("input[name=confirm]"); await p.click('button:has-text("Place order")');
  await p.getByText("not valid").first().waitFor();
});
await step("DIGITALBURJ100 activates Educator & Creator after explicit confirmation", async () => {
  await p.fill("input[name=coupon]", "digitalburj100"); await p.click('button:has-text("Apply")');
  await p.click('button:has-text("Activate")'); await p.waitForURL(/activated=creator/);
});
await step("the promotion cannot be reused for the same package", async () => {
  await go(p, "/academy/checkout?plan=creator");
  await p.fill("input[name=coupon]", "DIGITALBURJ100"); await p.check("input[name=confirm]"); await p.click('button:has-text("Place order")');
  await p.getByText("already used").first().waitFor();
});
await step("a paid order without a promotion stays payment pending", async () => {
  await go(p, "/academy/checkout?plan=professional"); await p.check("input[name=confirm]"); await p.click('button:has-text("Place order")');
  await p.waitForURL(/account\?order=/); await p.getByText("payment pending").first().waitFor();
  await go(p, "/academy/learn/courses/DB-05"); await p.getByText("previewing this unit").waitFor();
});
await step("Explainer Video, Presentations and Course Studio open and generate", async () => {
  for (const t of ["video", "slides", "course"]) {
    await go(p, `/academy/learn/studio/${t}`);
    await p.click('button:has-text("Generate draft")');
    if (await p.getByText("is locked").count()) throw new Error(`${t} locked`);
  }
});
await step("Failure Passport entry is recorded", async () => {
  await go(p, "/academy/learn/evidence");
  await p.fill("textarea[name=what]", "Public link left open on the price list");
  await p.fill("textarea[name=cause]", "Default sharing was anyone with the link");
  await p.fill("textarea[name=fix]", "Restricted to staff and added a sharing checklist");
  await p.click('button:has-text("Add entry")'); await p.getByText("Recorded in your Failure Passport").waitFor();
});
await step("staff confirms the pending order in Admin → Academy", async () => {
  await go(staff, "/admin/academy?tab=access");
  const row = staff.locator(".app-row", { hasText: email }).filter({ has: staff.locator('button:has-text("Confirm payment")') }).first();
  await row.locator('button:has-text("Confirm payment")').click();
  const pending = staff.locator(".app-row", { hasText: email }).filter({ has: staff.locator('button:has-text("Confirm payment")') });
  for (let i = 0; i < 40 && await pending.count(); i++) await staff.waitForTimeout(250);
  if (await pending.count()) throw new Error("order still pending after confirmation");
});
await step("confirmed payment unlocks Professional for the learner", async () => {
  await go(p, "/academy/learn/courses/DB-05");
  if (await p.getByText("previewing this unit").count()) throw new Error("DB-05 still locked");
});
await step("sign out, reject a wrong password, sign back in", async () => {
  await go(p, "/academy/learn"); await p.click('button[aria-label="Sign out"]'); await p.waitForURL(/signed_out/);
  await go(p, "/academy/sign-in"); await p.fill("input[name=email]", email); await p.fill("input[name=password]", "wrongpass1");
  await p.click('form button:has-text("Sign in")'); await p.getByText("incorrect").first().waitFor();
  await p.fill("input[name=password]", password); await p.click('form button:has-text("Sign in")'); await p.waitForURL(/\/academy\/learn$/);
});

await browser.close();
console.log(errors.length ? `\n${errors.length} problem(s):\n- ${errors.join("\n- ")}` : "\nAll Academy steps passed.");
process.exit(errors.length ? 1 : 0);
