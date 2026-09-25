// Deploy DigitalBurj to your own Cloudflare account (free plan).
//
//   npm run deploy:cloudflare              build, migrate the remote D1 database and deploy
//   npm run deploy:cloudflare -- --skip-build
//
// Authentication for Wrangler: CLOUDFLARE_API_TOKEN (+ CLOUDFLARE_ACCOUNT_ID) in the
// environment, or run `npx wrangler login` once on your own machine.
//
// Settings come from cloudflare.json (names) and these environment variables:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   Google sign-in (see README)
//   SESSION_SECRET                           optional; generated once and kept if unset
//   DIGITALBURJ_STAFF_EMAILS                 comma-separated super-admin emails
//   DIGITALBURJ_WHATSAPP_NUMBER              official WhatsApp number, digits only
//   PUBLIC_ORIGIN                            optional, e.g. https://digitalburj.com
// Values in a root .prod.vars file (KEY=value lines, ignored by Git) are used when the
// environment does not set them.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const settings = JSON.parse(readFileSync("cloudflare.json", "utf8"));
const config = "dist/server/wrangler.json";
// DEPLOY_WRANGLER_JS lets a test point the script at a stand-in for Wrangler.
const wrangler = [process.env.DEPLOY_WRANGLER_JS || "./node_modules/wrangler/bin/wrangler.js"];

// .prod.vars fills gaps in the environment (useful on your own machine).
if (existsSync(".prod.vars")) for (const line of readFileSync(".prod.vars", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

function run(cmdArgs, { quiet = false, input } = {}) {
  const r = spawnSync(process.execPath, [...wrangler, ...cmdArgs], { encoding: "utf8", input, env: { ...process.env, WRANGLER_SEND_METRICS: "false" } });
  if (r.error) throw r.error;
  const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  if (!quiet && r.status !== 0) process.stderr.write(out);
  return { ok: r.status === 0, out, stdout: r.stdout ?? "" };
}
const json = s => { const i = s.search(/^[[{]/m); return i < 0 ? null : JSON.parse(s.slice(i)); };
const step = m => console.log(`\n▸ ${m}`);
const die = m => { console.error(`\n✘ ${m}`); process.exit(1); };

step("Checking Cloudflare access");
const who = run(["whoami"], { quiet: true });
if (!who.ok || /not authenticated/i.test(who.out)) die("Wrangler is not signed in. Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID, or run `npx wrangler login`.");
console.log("  ✓ signed in");

step(`Database (D1): ${settings.d1}`);
let db = (json(run(["d1", "list", "--json"], { quiet: true }).stdout) ?? []).find(d => d.name === settings.d1);
if (!db) {
  if (!run(["d1", "create", settings.d1]).ok) die("Could not create the D1 database.");
  db = (json(run(["d1", "list", "--json"], { quiet: true }).stdout) ?? []).find(d => d.name === settings.d1);
}
if (!db) die("The D1 database was not found after creating it.");
console.log(`  ✓ ${db.name} (${db.uuid})`);

step(`File storage (R2): ${settings.r2}`);
let r2 = settings.r2;
const buckets = run(["r2", "bucket", "list"], { quiet: true });
if (!buckets.ok) { console.log("  ! R2 is not enabled on this account, so file uploads stay off. Enable R2 in the dashboard and deploy again to turn them on."); r2 = null; }
else if (!buckets.out.includes(r2)) {
  if (!run(["r2", "bucket", "create", r2]).ok) { console.log("  ! Could not create the bucket; file uploads stay off."); r2 = null; }
}
if (r2) console.log(`  ✓ ${r2}`);

if (!skipBuild) {
  step("Building the Worker");
  const b = spawnSync(process.execPath, ["scripts/run-framework.mjs", "build"], { stdio: "inherit" });
  if (b.status !== 0) process.exit(b.status ?? 1);
}
if (!existsSync(config)) die(`Missing ${config}. Run without --skip-build.`);

// Point the generated config at this account's resources and settings.
const cfg = JSON.parse(readFileSync(config, "utf8"));
cfg.name = settings.name;
cfg.topLevelName = settings.name;
cfg.d1_databases = [{ ...(cfg.d1_databases?.[0] ?? {}), binding: "DB", database_name: db.name, database_id: db.uuid, migrations_dir: undefined }];
if (r2) cfg.r2_buckets = [{ binding: "BUCKET", bucket_name: r2 }]; else delete cfg.r2_buckets;
const vars = { ...(cfg.vars ?? {}), ...settings.vars };
for (const k of ["GOOGLE_CLIENT_ID", "DIGITALBURJ_WHATSAPP_NUMBER", "PUBLIC_ORIGIN"]) if (process.env[k]) vars[k] = process.env[k];
cfg.vars = vars;
writeFileSync(config, JSON.stringify(cfg, null, 2));

step("Applying pending database migrations (remote)");
const d1 = sql => run(["d1", "execute", "DB", "--remote", "--config", config, "--json", ...sql], { quiet: true });
if (!d1(["--command", "CREATE TABLE IF NOT EXISTS deploy_migrations (tag TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)"]).ok) die("Could not reach the remote database.");
const appliedOut = d1(["--command", "SELECT tag FROM deploy_migrations"]);
const applied = new Set((json(appliedOut.stdout)?.[0]?.results ?? []).map(r => r.tag));
for (const file of readdirSync("drizzle").filter(f => f.endsWith(".sql")).sort()) {
  const tag = file.replace(/\.sql$/, "");
  if (applied.has(tag)) continue;
  const r = d1(["--file", `drizzle/${file}`]);
  const already = /already exists|duplicate column/i.test(r.out);
  if (!r.ok && !already) { console.error(r.out); die(`Migration ${file} failed.`); }
  d1(["--command", `INSERT OR IGNORE INTO deploy_migrations (tag, applied_at) VALUES ('${tag}', ${Date.now()})`]);
  console.log(`  ✓ ${already ? "already present" : "applied"}  ${file}`);
}

step("Preparing secrets");
const existing = new Set((json(run(["secret", "list", "--config", config, "--format", "json"], { quiet: true }).stdout) ?? []).map(s => s.name));
const secrets = {};
for (const k of ["GOOGLE_CLIENT_SECRET", "SESSION_SECRET", "DIGITALBURJ_STAFF_EMAILS"]) if (process.env[k]) secrets[k] = process.env[k];
if (!secrets.SESSION_SECRET && !existing.has("SESSION_SECRET")) { secrets.SESSION_SECRET = randomBytes(48).toString("base64url"); console.log("  ✓ generated SESSION_SECRET (kept for future deploys)"); }
console.log(`  ✓ uploading: ${Object.keys(secrets).join(", ") || "none (existing secrets are kept)"}`);

step("Deploying");
const dir = mkdtempSync(join(tmpdir(), "db-secrets-"));
const secretsFile = join(dir, "secrets.json");
writeFileSync(secretsFile, JSON.stringify(secrets), { mode: 0o600 });
let deployed;
try { deployed = run(["deploy", "--config", config, ...(Object.keys(secrets).length ? ["--secrets-file", secretsFile] : [])]); }
finally { rmSync(dir, { recursive: true, force: true }); }
if (!deployed.ok) {
  if (/workers\.dev subdomain/i.test(deployed.out)) die("Register your free workers.dev subdomain first: Cloudflare dashboard → Workers & Pages, then run this again.");
  die("Deploy failed.");
}
const url = deployed.out.match(/https:\/\/[\w.-]+\.workers\.dev/)?.[0] ?? process.env.PUBLIC_ORIGIN;
console.log(deployed.out.split("\n").filter(l => /Uploaded|Deployed|https:\/\//.test(l)).join("\n"));

const missing = ["GOOGLE_CLIENT_ID"].filter(k => !vars[k]).concat((existing.has("GOOGLE_CLIENT_SECRET") || secrets.GOOGLE_CLIENT_SECRET) ? [] : ["GOOGLE_CLIENT_SECRET"]);
console.log(`\n✓ DigitalBurj is live${url ? ` at ${url}` : ""}`);
if (missing.length) console.log(`\nSign-in is off until you set ${missing.join(" and ")}.\nCreate a Google OAuth client with this redirect URI:\n  ${url ?? "<your site>"}/auth/callback\nthen add the values and deploy again.`);
