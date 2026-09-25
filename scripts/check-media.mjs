// Fails if any registered photograph is placed more than once, if a photo path is
// hard-coded outside app/brand-data.ts, or if a registered file is missing/empty.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const registry = readFileSync("app/brand-data.ts", "utf8");
const block = registry.slice(registry.indexOf("export const media"), registry.indexOf("} as const;"));
const media = Object.fromEntries([...block.matchAll(/(\w+):\s*"([^"]+)"/g)].map(m => [m[1], m[2]]));
const allowedLiteral = ["/brand/digitalburj-wordmark-approved.webp", "/brand/db-iconmark.png"];

const files = [];
(function walk(dir) { for (const f of readdirSync(dir)) { const p = join(dir, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(tsx?|css)$/.test(f)) files.push(p); } })("app");

const uses = Object.fromEntries(Object.keys(media).map(k => [k, []]));
const problems = [];
for (const file of files) {
  if (file.endsWith("brand-data.ts")) continue;
  const src = readFileSync(file, "utf8");
  for (const key of Object.keys(media)) {
    const re = new RegExp(`(media\\.${key}\\b|["']${key}["'])`, "g");
    for (let n = (src.match(re) || []).length; n > 0; n--) uses[key].push(file);
  }
  for (const m of src.matchAll(/\/brand\/[\w.-]+\.(?:webp|jpe?g|png)/g)) if (!allowedLiteral.includes(m[0]) && !file.startsWith("app/workspace")) problems.push(`${file}: hard-coded photo ${m[0]} (register it in brand-data.ts)`);
}
for (const [key, path] of Object.entries(media)) {
  try { if (statSync(join("public", path)).size === 0) problems.push(`${path} is empty`); } catch { problems.push(`${path} is missing`); }
  if (uses[key].length > 1) problems.push(`media.${key} is used ${uses[key].length} times: ${uses[key].join(", ")}`);
  if (uses[key].length === 0) problems.push(`media.${key} is registered but not placed anywhere`);
}
const paths = Object.values(media);
for (const p of new Set(paths)) if (paths.filter(x => x === p).length > 1) problems.push(`${p} is registered under more than one key`);

if (problems.length) { console.error("Media check failed:\n- " + problems.join("\n- ")); process.exit(1); }
console.log(`Media check passed: ${paths.length} photographs, each placed exactly once.`);
