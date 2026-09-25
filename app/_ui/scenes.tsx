import type { CSSProperties, ReactNode } from "react";
import { Glyph, type GlyphName } from "./glyphs";
import { divisions, divisionBySlug, scenes, type SceneKey } from "../brand-data";
import { academyCourses, academyStages } from "../academy-data";

/*
 * Scenes replace photography. Each one is drawn from the product itself — the
 * rubric a reviewer scores, the BUILD / RESHAPE / STOP gate, a measured process
 * leak — set on a blueprint of the Burj elevation, DigitalBurj's namesake.
 * Every scene key is placed exactly once on the site (scripts/check-media.mjs).
 */

type Hue = readonly [string, string];
const hueOf = (slug: keyof typeof divisionBySlug): Hue => divisionBySlug[slug].hue;

/* ---------- Blueprint backdrop with the tower elevation ---------- */

// Setbacks alternate left and right, as the real tower's spiral does, narrowing to a spire.
function towerPath() {
  const cx = 100, base = 600;
  const left = [[58, 0], [50, 96], [42, 170], [35, 240], [28, 300], [22, 352], [16, 398], [11, 436], [7, 468]];
  const right = [[58, 0], [52, 60], [44, 135], [37, 205], [30, 272], [24, 326], [18, 375], [13, 418], [8, 452]];
  const top = 492, spire = 12;
  let d = `M${cx - left[0][0]} ${base}`;
  for (let i = 1; i < left.length; i++) d += `V${base - left[i][1]}H${cx - left[i][0]}`;
  d += `V${base - top}H${cx - 2}V${spire}L${cx} 0L${cx + 2} ${spire}V${base - top}H${cx + right[right.length - 1][0]}`;
  for (let i = right.length - 1; i > 0; i--) d += `V${base - right[i][1]}H${cx + right[i - 1][0]}`;
  return d + `V${base}`;
}
const TOWER = towerPath();

export function Blueprint({ id, hue, tower = "right", note = true }: { id: string; hue: Hue; tower?: "right" | "center" | "none"; note?: boolean }) {
  return <div className={`sc-blueprint sc-tower-${tower}`} style={{ "--a": hue[0], "--b": hue[1] } as CSSProperties} aria-hidden="true">
    <svg className="sc-grid" width="100%" height="100%">
      <defs>
        <pattern id={`${id}-fine`} width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" strokeWidth=".5" /></pattern>
        <pattern id={`${id}-major`} width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill={`url(#${id}-fine)`} /><path d="M120 0H0V120" fill="none" stroke="currentColor" strokeWidth="1" /></pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-major)`} />
    </svg>
    {tower !== "none" && <svg className="sc-tower" viewBox="-40 -20 280 640" preserveAspectRatio="xMidYMax meet">
      <path d={TOWER} pathLength={1} className="sc-tower-line" />
      <path d="M100 600V0" className="sc-axis" />
      {[120, 300, 452].map(y => <g key={y} className="sc-level"><path d={`M150 ${600 - y}H232`} /><text x="236" y={604 - y}>+{(y * 1.38).toFixed(1)}</text></g>)}
      <path d="M-30 600H230" className="sc-ground" />
    </svg>}
    {note && <div className="sc-note"><span>25.1972° N · 55.2744° E</span><span>ELEV. +828.0 m</span></div>}
    <span className="sc-glow" />
  </div>;
}

/* ---------- Product fragments ---------- */

function Card({ className = "", label, children, style }: { className?: string; label?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return <div className={`sc-card ${className}`} style={style}>{label && <div className="sc-label">{label}</div>}{children}</div>;
}

function Bars({ rows }: { rows: [string, number, number][] }) {
  return <ul className="sc-bars">{rows.map(([t, v, max], i) => <li key={t} style={{ "--v": v / max, "--i": i } as CSSProperties}><span>{t}</span><i><b /></i><em>{v}/{max}</em></li>)}</ul>;
}

function Rail({ steps, at }: { steps: string[]; at: number }) {
  return <ol className="sc-rail">{steps.map((s, i) => <li key={s} className={i < at ? "done" : i === at ? "now" : ""} style={{ "--i": i } as CSSProperties}>{s}</li>)}</ol>;
}

function Seal({ id, code }: { id: string; code: string }) {
  return <div className="sc-seal">
    <svg viewBox="0 0 120 120" className="sc-seal-ring">
      <defs><path id={`${id}-ring`} d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" /></defs>
      <circle cx="60" cy="60" r="56" className="sc-seal-edge" />
      <text><textPath href={`#${id}-ring`}>INDEPENDENTLY VERIFIED · DIGITALBURJ ACADEMY · </textPath></text>
    </svg>
    <div className="sc-seal-core"><Glyph name="security" size={34} /><b>{code}</b></div>
  </div>;
}

const mission = <Card className="sc-mission" label={<><span>Mission · DB-03</span><span className="sc-chip sc-chip-ok">Passed</span></>}>
  <strong className="sc-title">Book appointments without double-booking a doctor</strong>
  <Bars rows={[["Solves the stated problem", 3, 3], ["Prevents overlapping slots", 3, 3], ["Explains the trade-offs", 2, 3]]} />
  <Rail steps={["Declared", "Assessed", "Verified"]} at={2} />
</Card>;

const decision = <Card className="sc-decision" label={<><span>Validation decision</span><span>8 criteria</span></>}>
  <ul className="sc-criteria">{["Problem clarity", "Business value", "User need", "Budget fit", "Timeline", "Authority", "Feasibility", "Strategic fit"].map((t, i) => <li key={t} style={{ "--v": [4, 5, 4, 3, 4, 5, 4, 3][i] / 5, "--i": i } as CSSProperties}><span>{t}</span><i><b /></i></li>)}</ul>
  <div className="sc-gate"><span className="on">BUILD</span><span>RESHAPE</span><span>STOP</span></div>
</Card>;

function ProcessMap({ id }: { id: string }) {
  const nodes = [[40, 70, "Email in"], [150, 40, "Re-key to ERP"], [270, 70, "Approve"], [380, 40, "Pay"]] as const;
  const path = "M40 70C95 70 95 40 150 40S215 70 270 70 325 40 380 40";
  return <Card className="sc-process" label={<><span>Process map · Accounts payable</span><span className="sc-chip sc-chip-warn">1 leak found</span></>}>
    <svg viewBox="0 0 420 110" className="sc-process-svg">
      <path id={`${id}-flow`} d={path} className="sc-flow" />
      {[0, 1, 2].map(i => <circle key={i} r="3.2" className="sc-packet"><animateMotion dur="4.8s" begin={`${i * 1.6}s`} repeatCount="indefinite"><mpath href={`#${id}-flow`} /></animateMotion></circle>)}
      {nodes.map(([x, y, t], i) => <g key={t} className={i === 1 ? "sc-node sc-leak" : "sc-node"}><circle cx={x} cy={y} r="11" /><text x={x} y={y + 30}>{t}</text></g>)}
    </svg>
    <div className="sc-kv"><span>Leak class</span><b>Duplicate data entry</b><span>Time lost</span><b>9.1 h / week · measured</b></div>
  </Card>;
}

const metric = <Card className="sc-metric" label={<><span>Invoice handling</span><span className="sc-chip sc-chip-ok">Measured</span></>}>
  <div className="sc-delta"><span><small>Before</small>12.0h</span><i>→</i><span className="after"><small>After</small>3.2h</span></div>
  <svg viewBox="0 0 200 48" className="sc-spark"><path d="M2 8L28 10 54 9 80 17 106 30 132 36 158 39 198 40" pathLength={1} /></svg>
  <small className="sc-foot">per week, same team, same volume</small>
</Card>;

const risk = <Card className="sc-risk" label={<><span>Automation · Invoice triage</span><span>Risk tier</span></>}>
  <div className="sc-dial">
    <svg viewBox="0 0 200 110">
      {["#22c55e", "#eab308", "#f97316", "#ef4444"].map((col, i) => { const a0 = Math.PI * (1 - i / 4), a1 = Math.PI * (1 - (i + 1) / 4) + .03; return <path key={col} d={`M${100 + 80 * Math.cos(a0)} ${100 - 80 * Math.sin(a0)}A80 80 0 0 1 ${100 + 80 * Math.cos(a1)} ${100 - 80 * Math.sin(a1)}`} stroke={col} className="sc-arc" />; })}
      <g className="sc-needle"><path d="M100 100L100 32" /><circle cx="100" cy="100" r="6" /></g>
    </svg>
    <b>HIGH</b>
  </div>
  <ul className="sc-checks"><li className="done">Design approved by client</li><li className="done">Pilot on 40 invoices</li><li className="now">Go-live needs a second approval</li></ul>
</Card>;

const passport = <Card className="sc-passport" label={<><span>Capability Passport</span><span className="sc-chip">Employers only</span></>}>
  <div className="sc-person"><span className="sc-avatar">LH</span><div><strong>Layla H.</strong><small>Backend developer · Dubai</small></div></div>
  <ul className="sc-evidence">{([["API design", "Verified"], ["SQL & data modelling", "Assessed"], ["Automated testing", "Verified"], ["Cloud deployment", "Declared"]] as const).map(([s, l], i) => <li key={s} style={{ "--i": i } as CSSProperties}><span>{s}</span><em className={`sc-lv sc-lv-${l.toLowerCase()}`}>{l}</em></li>)}</ul>
  <small className="sc-foot">Credential DBC-7Q2K · verify at /verify</small>
</Card>;

const pipeline = <Card className="sc-pipeline" label={<><span>Backend Engineer · Acme Clinics</span><span>12 applicants</span></>}>
  <div className="sc-cols">{["Applied", "Shortlisted", "Interview", "Offer"].map((c, i) => <div key={c} className="sc-col"><small>{c}</small>{Array.from({ length: [4, 3, 2, 0][i] }, (_, j) => <span key={j} className="sc-cand" />)}</div>)}
    <span className="sc-mover"><span className="sc-avatar">LH</span></span>
  </div>
</Card>;

const offer = <Card className="sc-offer" label={<><span>Offer</span><span className="sc-chip sc-chip-ok">Approved</span></>}>
  <strong className="sc-title">Hiring manager and recruiter approved</strong>
  <Rail steps={["Draft", "Approval", "Sent", "Accepted"]} at={3} />
</Card>;

const unit = (() => {
  const u = academyCourses.find(c => c.code === "DB-03") ?? academyCourses[0];
  return <Card className="sc-unit" label={<><span>{u.code} · {u.level}</span><span>{u.hours} hours</span></>}>
    <strong className="sc-title">{u.title}</strong>
    <div className="sc-stages">{academyStages.map((s, i) => <span key={s} className={i < 7 ? "done" : i === 7 ? "now" : ""} style={{ "--i": i } as CSSProperties} title={s} />)}</div>
    <small className="sc-foot">Stage 08 of 12 · TEST</small>
  </Card>;
})();

const review = <Card className="sc-review" label={<><span>Review console</span><span>Rubric v2</span></>}>
  <ol className="sc-timeline">
    <li className="done"><b>Submitted</b><small>Repository + design note</small></li>
    <li className="done"><b>Assessed by reviewer</b><small>8 / 9 · feedback written</small></li>
    <li className="now"><b>Independent verification</b><small>A different verifier decides</small></li>
    <li><b>Credential issued</b><small>Public check by code</small></li>
  </ol>
</Card>;

const release = <Card className="sc-release" label={<><span>Release readiness</span><span>7 / 9</span></>}>
  <ul className="sc-checks">{["Functional QA", "Regression", "API testing", "Performance", "Security checks", "Accessibility", "Monitoring", "Rollback plan", "Client approval"].map((t, i) => <li key={t} className={i < 7 ? "done" : i === 7 ? "now" : ""} style={{ "--i": i } as CSSProperties}>{t}</li>)}</ul>
</Card>;

const wire = <Card className="sc-wire" label={<><span>Milestone 2 · Booking flow</span><span className="sc-chip sc-chip-ok">Client approved</span></>}>
  <div className="sc-wire-frame"><i className="w1" /><i className="w2" /><i className="w3" /><i className="w4" /><i className="w5" /><i className="w6" /></div>
</Card>;

const chat = <Card className="sc-chat" label={<><span>WhatsApp · DigitalBurj</span><span className="sc-dot-live">online</span></>}>
  <p className="sc-msg me">Hello DigitalBurj 👋<br />Topic: Business AI<br />Goal: stop re-keying invoices</p>
  <p className="sc-msg">Thanks — reference DB-7Q2K. Can we see the process for 30 minutes this week?</p>
  <p className="sc-msg me sc-typing"><i /><i /><i /></p>
</Card>;

function Orbit() {
  const pts = divisions.map((d, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return { d, x: 50 + 36 * Math.cos(a), y: 50 + 36 * Math.sin(a) }; });
  return <div className="sc-orbit">
    <svg viewBox="0 0 100 100">{pts.map((p, i) => <g key={p.d.slug}><path d={`M50 50L${p.x} ${p.y}`} className="sc-spoke" style={{ "--i": i } as CSSProperties} /><path d={`M${p.x} ${p.y}L${pts[(i + 1) % 5].x} ${pts[(i + 1) % 5].y}`} className="sc-rim" /></g>)}</svg>
    {pts.map((p, i) => <span key={p.d.slug} className="sc-orbit-node" style={{ left: `${p.x}%`, top: `${p.y}%`, "--a": p.d.hue[0], "--b": p.d.hue[1], "--i": i } as CSSProperties}><Glyph name={p.d.slug as GlyphName} size={30} /><small>{p.d.name}</small></span>)}
    <span className="sc-orbit-core"><Glyph name="tower" size={40} /></span>
  </div>;
}

const ledger = <Card className="sc-ledger" label={<><span>Operating principles</span><span>08</span></>}>
  <ol>{["Problems before technology", "Evidence before claims", "Validate before engineering", "Measure before and after", "Humans approve consequential automation"].map((t, i) => <li key={t} style={{ "--i": i } as CSSProperties}><span>{String(i + 1).padStart(2, "0")}</span>{t}</li>)}</ol>
</Card>;

/* ---------- Compositions: one per placement ---------- */

const compositions: Record<SceneKey, { hue: Hue; tower?: "right" | "center" | "none"; body?: ReactNode | ((id: string) => ReactNode) }> = {
  homeHero: { hue: ["#e10613", "#2563eb"], tower: "right" },
  cardAcademy: { hue: hueOf("academy"), tower: "none", body: id => <Seal id={id} code="DBC-7Q2K" /> },
  cardStudio: { hue: hueOf("studio"), tower: "none", body: wire },
  cardBusiness: { hue: hueOf("business"), tower: "none", body: metric },
  storyAcademy: { hue: hueOf("academy"), tower: "none", body: mission },
  storyStudio: { hue: hueOf("studio"), tower: "none", body: decision },
  storyBusiness: { hue: hueOf("business"), tower: "none", body: id => <ProcessMap id={id} /> },
  heroAcademy: { hue: hueOf("academy"), body: unit },
  heroStudio: { hue: hueOf("studio"), body: release },
  heroBusiness: { hue: hueOf("business"), body: risk },
  heroTalent: { hue: hueOf("talent"), body: passport },
  heroJobs: { hue: hueOf("jobs"), body: <>{pipeline}{offer}</> },
  academyReview: { hue: hueOf("academy"), tower: "none", body: review },
  companyHero: { hue: ["#e10613", "#d8b46a"], tower: "center", body: ledger },
  ecosystemHero: { hue: ["#8b5cf6", "#22d3ee"], tower: "none", body: <Orbit /> },
  getStartedHero: { hue: ["#e10613", "#f59e0b"], body: chat },
};

/** Renders the registered scene for one placement. */
export function Scene({ k, className = "" }: { k: SceneKey; className?: string }) {
  const c = compositions[k];
  const id = `sc-${k}`;
  const body = typeof c.body === "function" ? c.body(id) : c.body;
  return <div className={`scene scene-${k} ${className}`} role="img" aria-label={scenes[k]} data-reveal="scene" style={{ "--a": c.hue[0], "--b": c.hue[1] } as CSSProperties}>
    <Blueprint id={id} hue={c.hue} tower={c.tower ?? "right"} note={c.tower !== "none"} />
    {body && <div className="sc-stage">{body}</div>}
  </div>;
}
