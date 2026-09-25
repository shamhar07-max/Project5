// Full-stack local deployment: build the Worker, apply pending D1 migrations to the
// local database, then serve the production build with Wrangler.
//
//   npm run deploy:local                 build + migrate + serve on port 8787
//   npm run deploy:local -- --port 9000  choose a port
//   npm run deploy:local -- --skip-build reuse the existing dist/ build
//
// Worker environment variables come from the root .dev.vars when it exists
// (DIGITALBURJ_WHATSAPP_NUMBER, DIGITALBURJ_STAFF_EMAILS).
import { spawnSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, readdirSync, rmSync } from "node:fs";

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const portIndex = args.indexOf("--port");
const port = portIndex >= 0 ? args[portIndex + 1] : "8787";
const config = "dist/server/wrangler.json";
const state = ".wrangler/state";
const wrangler = ["--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js"];

function run(cmd, cmdArgs, opts = {}) {
  const r = spawnSync(cmd, cmdArgs, { encoding: "utf8", ...opts });
  if (r.error) throw r.error;
  return r;
}
function d1(sqlArgs) {
  const r = run(process.execPath, [...wrangler, "d1", "execute", "DB", "--local", "--config", config, "--persist-to", state, "--json", ...sqlArgs]);
  const out = `${r.stdout}\n${r.stderr}`;
  return { ok: r.status === 0, out, rows: r.status === 0 ? parseRows(r.stdout) : [] };
}

// Wrangler may print banners (e.g. "▲ [WARNING] …") before the JSON, so start at the
// line where the JSON array itself begins.
function parseRows(stdout) {
  const start = stdout.search(/^\[\s*$/m);
  return start < 0 ? [] : (JSON.parse(stdout.slice(start))[0]?.results ?? []);
}

if (!skipBuild) {
  console.log("▸ Building the Worker…");
  // Run the build script with this Node binary instead of spawning `npm`, which is
  // `npm.cmd` on Windows and cannot be launched without a shell.
  const b = run(process.execPath, ["scripts/run-framework.mjs", "build"], { stdio: "inherit" });
  if (b.status !== 0) process.exit(b.status ?? 1);
}
if (!existsSync(config)) { console.error(`Missing ${config}. Run without --skip-build.`); process.exit(1); }

console.log("▸ Applying pending D1 migrations…");
const track = d1(["--command", "CREATE TABLE IF NOT EXISTS local_migrations (tag TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)"]);
if (!track.ok) {
  console.error(track.out);
  if (/write EOF|EPIPE|ECONNRESET/i.test(track.out)) console.error([
    "The local Cloudflare runtime (workerd) exited as soon as it started.",
    "Check it directly:",
    process.platform === "win32"
      ? "  .\\node_modules\\@cloudflare\\workerd-windows-64\\bin\\workerd.exe --version   (then: echo $LASTEXITCODE)"
      : "  ./node_modules/workerd/bin/workerd --version",
    "On Windows, no output with exit code -1073741515 means the Microsoft Visual C++ Redistributable (x64) is missing:",
    "  https://aka.ms/vs/17/release/vc_redist.x64.exe",
  ].join("\n"));
  process.exit(1);
}
const applied = new Set(d1(["--command", "SELECT tag FROM local_migrations"]).rows.map(r => r.tag));
for (const file of readdirSync("drizzle").filter(f => f.endsWith(".sql")).sort()) {
  const tag = file.replace(/\.sql$/, "");
  if (applied.has(tag)) continue;
  const r = d1(["--file", `drizzle/${file}`]);
  // A database created before tracking existed already has these objects; record and move on.
  const already = /already exists|duplicate column/i.test(r.out);
  if (!r.ok && !already) { console.error(`✘ ${file}\n${r.out}`); process.exit(1); }
  d1(["--command", `INSERT OR IGNORE INTO local_migrations (tag, applied_at) VALUES ('${tag}', ${Date.now()})`]);
  console.log(`  ${already ? "✓ already present" : "✓ applied"}  ${file}`);
}

// Wrangler reads .dev.vars from the directory that holds the config, i.e. dist/server/.
if (existsSync(".dev.vars")) copyFileSync(".dev.vars", "dist/server/.dev.vars");
else { rmSync("dist/server/.dev.vars", { force: true }); console.log("  (no .dev.vars — WhatsApp hand-off and staff access stay disabled)"); }
console.log(`▸ Serving the production build on http://127.0.0.1:${port}`);
const server = spawn(process.execPath, [...wrangler, "dev", "--config", config, "--local", "--persist-to", state, "--ip", "127.0.0.1", "--port", port, "--inspector-port", "0"], { stdio: "inherit" });
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => server.kill(sig));
server.on("exit", code => process.exit(code ?? 0));
