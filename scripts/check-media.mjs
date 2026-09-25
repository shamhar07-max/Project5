// Imagery check. The site uses authored scenes (app/_ui/scenes.tsx) instead of photography.
// Fails if a registered scene is placed more than once or not at all, or if any source file
// references an image outside the approved brand marks and partner logos.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const registry = readFileSync("app/brand-data.ts", "utf8");
const block = registry.slice(registry.indexOf("export const scenes"), registry.indexOf("} as const;", registry.indexOf("export const scenes")));
const scenes = [...block.matchAll(/^\s*(\w+):\s*"/gm)].map(m => m[1]);
const allowed = [/^\/brand\/digitalburj-wordmark-approved\.webp$/, /^\/brand\/db-iconmark\.png$/, /^\/brand\/wordmark\.png$/, /^\/brand\/partners\//];

const files = [];
(function walk(dir) { for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(f)) files.push(p); } })("app");

const uses = Object.fromEntries(scenes.map(k => [k, []]));
const problems = [];
for (const file of files) {
  const src = readFileSync(file, "utf8");
  if (!file.endsWith("brand-data.ts") && !file.endsWith("scenes.tsx")) {
    for (const key of scenes) for (let n = (src.match(new RegExp(`["']${key}["']`, "g")) || []).length; n > 0; n--) uses[key].push(file);
  }
  for (const m of src.matchAll(/\/brand\/[\w./-]+\.(?:webp|jpe?g|png|svg)/g)) if (!allowed.some(re => re.test(m[0]))) problems.push(`${file}: references ${m[0]} (the site uses authored scenes, not photos)`);
}
for (const [key, where] of Object.entries(uses)) {
  if (where.length > 1) problems.push(`scene ${key} is placed ${where.length} times: ${where.join(", ")}`);
  if (where.length === 0) problems.push(`scene ${key} is registered but not placed anywhere`);
}

if (problems.length) { console.error("Imagery check failed:\n- " + problems.join("\n- ")); process.exit(1); }
console.log(`Imagery check passed: ${scenes.length} authored scenes, each placed exactly once; no stock or generated photography.`);
