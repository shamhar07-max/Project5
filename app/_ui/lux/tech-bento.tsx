import type { CSSProperties, ReactNode } from "react";

type Cap = { key: string; t: string; d: string; spec: string; hue: [string, string]; span: string };

const caps: Cap[] = [
  { key: "code", t: "Software & SaaS", d: "Web platforms, portals, marketplaces and internal systems.", spec: "TypeScript · React · edge runtime", hue: ["#2563eb", "#22d3ee"], span: "wide" },
  { key: "ai", t: "AI products", d: "Assistants, extraction and decision support — evaluated and governed.", spec: "Human approval for high risk", hue: ["#8b5cf6", "#ec4899"], span: "tall" },
  { key: "data", t: "Data & reporting", d: "Baselines, dashboards and before/after measurement.", spec: "Measured vs estimated, labelled", hue: ["#10b981", "#a3e635"], span: "" },
  { key: "cloud", t: "Cloud & reliability", d: "Deployment, monitoring, backup and rollback plans.", spec: "Rollback plan with every release", hue: ["#0ea5e9", "#6366f1"], span: "" },
  { key: "security", t: "Security", d: "Server-side authorization, tenant boundaries and audit trails.", spec: "Every action checked and audited", hue: ["#e10613", "#f43f5e"], span: "" },
  { key: "enterprise", t: "Enterprise systems", d: "CRM and ERP fit, configuration and clean data flows.", spec: "Fit before customisation", hue: ["#f59e0b", "#f97316"], span: "" },
  { key: "api", t: "APIs & integrations", d: "Identity, payments and legacy systems connected cleanly.", spec: "Scoped keys · signed webhooks", hue: ["#14b8a6", "#3b82f6"], span: "wide" },
];

const visuals: Record<string, ReactNode> = {
  code: <div className="tv tv-code">{["const release = await gate(build)", "  .checks(['qa','perf','a11y'])", "  .rollback(plan)", "deploy(release) // ✓ 1.2s edge"].map((l, i) => <code key={i} style={{ "--i": i } as CSSProperties}>{l}</code>)}<span className="tv-cursor" /></div>,
  ai: <div className="tv tv-ai"><svg viewBox="0 0 160 200">{[[30, 40], [30, 100], [30, 160], [80, 70], [80, 130], [130, 100]].flatMap(([x, y], i, a) => a.slice(3).filter(([x2]) => x2 > x).map(([x2, y2], j) => <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} style={{ "--i": i + j } as CSSProperties} />))}{[[30, 40], [30, 100], [30, 160], [80, 70], [80, 130], [130, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 5 ? 12 : 8} style={{ "--i": i } as CSSProperties} />)}</svg><span className="tv-ai-out">confidence 0.94 · review</span></div>,
  data: <div className="tv tv-data">{[34, 58, 44, 72, 66, 88].map((h, i) => <i key={i} style={{ "--h": `${h}%`, "--i": i } as CSSProperties} />)}<span>before → after</span></div>,
  cloud: <div className="tv tv-cloud"><span className="tv-pulse" /><span className="tv-pulse p2" /><b>99.9%</b><small>uptime target</small></div>,
  security: <div className="tv tv-sec"><span className="tv-radar" /><svg viewBox="0 0 48 56"><path d="M24 3 L44 11 V27 C44 41 35 50 24 53 C13 50 4 41 4 27 V11 Z" /><path d="M15 28 l6 6 12-13" className="tv-tick" /></svg></div>,
  enterprise: <div className="tv tv-ent">{["CRM", "ERP", "HR", "Finance"].map((t, i) => <span key={t} style={{ "--i": i } as CSSProperties}>{t}</span>)}</div>,
  api: <div className="tv tv-api"><span className="tv-node">Identity</span><span className="tv-wire" /><span className="tv-node hub">DigitalBurj API</span><span className="tv-wire w2" /><span className="tv-node">Payments</span><span className="tv-wire w3" /><span className="tv-node">Legacy</span></div>,
};

/** Seven capabilities, each with its own small motif and colour pair. Pure CSS/SVG motion. */
export function TechBento() {
  return <div className="lx-bento">
    {caps.map((c, i) => <article key={c.key} className={`lx-tile ${c.span ? `lx-tile-${c.span}` : ""}`} data-spotlight data-reveal="up" style={{ "--a": c.hue[0], "--b": c.hue[1], "--i": i } as CSSProperties}>
      <div className="lx-tile-visual" aria-hidden="true">{visuals[c.key]}</div>
      <div className="lx-tile-copy">
        <span className="lx-tile-n">{String(i + 1).padStart(2, "0")} / 07</span>
        <h3>{c.t}</h3>
        <p>{c.d}</p>
        <small>{c.spec}</small>
      </div>
    </article>)}
  </div>;
}
