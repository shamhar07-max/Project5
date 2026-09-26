import type { CSSProperties } from "react";
import { FlaskConical, Wrench } from "lucide-react";
import { PublicFrame, SectionHead } from "../_components/chrome";

export const metadata = { title: "Tools & labs · DigitalBurj Academy" };
const TOOLS = [
  ["Design and Content", "Canva", "Layouts, presentations and visual learning artefacts.", "BRIEF, BUILD, SHIP", "External · setup required"],
  ["Software Development", "OpenCode", "Coding workflow, reviewing changes and practising implementation.", "TRY, BUILD, BREAK, FIX, TEST", "External · setup required"],
  ["Software Development", "Git / GitHub", "Version control, branches, reviews and evidence of change.", "BUILD, FIX, TEST, EVIDENCE", "External · setup required"],
  ["Design and Content", "Figma", "Interface design, flows, prototypes and design review.", "BRIEF, INVESTIGATE, BUILD, EXPLAIN", "External · setup required"],
  ["Software Development", "VS Code", "Local development, inspection, testing and debugging.", "BUILD, BREAK, FIX, TEST", "Learner-side"],
  ["AI and Automation", "AI assistant", "Explanation, ideation, drafting and critique — always with human review.", "LEARN, INVESTIGATE, EXPLAIN", "External · paid access"],
  ["Data and Operations", "Excel / Google Sheets", "Office work, accounting practice, calculations and analysis.", "INVESTIGATE, BUILD, TEST, EVIDENCE", "External · setup required"],
  ["Data and Analytics", "PostgreSQL", "Queries, schemas, constraints and reporting data in a sandbox.", "BUILD, BREAK, FIX, TEST", "Setup required"],
  ["Data and Analytics", "Power BI", "Reporting, dashboards and business data interpretation.", "INVESTIGATE, BUILD, EXPLAIN", "External · paid access"],
  ["Business Operations", "CRM / ERP / HRM", "Records, workflows, permissions and data quality in a fictional tenant.", "BRIEF, BUILD, TEST, EVIDENCE", "External · setup required"],
  ["Communication", "Email / calendar / documents", "Professional communication, scheduling and hand-offs.", "EXPLAIN, SHIP, EVIDENCE", "External · setup required"],
  ["Evidence", "Evidence storage", "Collect, retain, review and share evidence packs.", "EVIDENCE", "Setup required"],
];
const LABS = [["Virtual Office", "Scheduling, correspondence, records, templates and escalation."], ["Accounting", "Fictional invoices, ledgers, reconciliation and exceptions."], ["Freight Forwarding", "Shipment records, documents, exceptions and hand-offs."], ["Real Estate", "Listings, client records, viewing workflows and follow-up."], ["HR", "Fictional recruitment, employee records, onboarding and privacy decisions."], ["Banking Operations", "Service requests, controls, escalation and reconciliation."], ["Insurance", "Policy administration, claims intake and escalation."], ["Document Processing", "Classification, completeness checks and exception handling."], ["Procurement", "Requests, supplier comparison, approvals and purchase records."], ["Customer Service", "Tickets, service standards, escalation and response quality."]];

export default function Tools() {
  return <PublicFrame active="/academy/tools">
    <section className="a-hero" style={{ paddingBottom: "2rem" }}>
      <div className="a-grid-bg" aria-hidden="true" />
      <div className="a-shell" style={{ position: "relative" }}><SectionHead eyebrow="Dedicated tool library" title={<>Approved tools, <em className="a-grad">controlled use.</em></>} lede="A tool is marked configured only after its permitted use, URL, entitlement, privacy handling and test path are confirmed. External tools have their own accounts and terms; no integration is implied." /></div>
    </section>
    <section style={{ paddingBottom: "4rem" }}>
      <div className="a-shell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {TOOLS.map(([cat, name, purpose, stages, status], i) => <div key={name} className="a-card" data-reveal="up" style={{ "--i": i % 3, display: "grid", gap: ".7rem", alignContent: "start" } as CSSProperties}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: ".5rem" }}><span className="a-icon-tile" style={{ width: 40, height: 40 }}><Wrench size={18} /></span><span className={`a-chip ${status.startsWith("Learner") ? "a-chip-green" : "a-chip-amber"}`}>{status}</span></div>
          <p className="a-mono a-muted" style={{ fontSize: ".68rem", letterSpacing: ".1em" }}>{cat.toUpperCase()}</p><h2 className="a-h3">{name}</h2><p className="a-muted" style={{ lineHeight: 1.55, fontSize: ".92rem" }}>{purpose}</p>
          <p style={{ fontSize: ".78rem" }} className="a-muted">Stages: <span style={{ color: "var(--tx-2)" }}>{stages}</span></p>
        </div>)}
      </div>
    </section>
    <section className="a-sec" style={{ paddingTop: 0 }}>
      <div className="a-shell"><SectionHead eyebrow="Simulation labs" title={<>Fictional-data <em className="a-grad">practice environments.</em></>} lede="Labs never represent access to live customer, employer, government, banking, healthcare or production systems. Status: planning." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "1rem" }}>{LABS.map(([n, s], i) => <div key={n} className="a-card" data-reveal="up" style={{ "--i": i % 4 } as CSSProperties}><FlaskConical size={20} color="#a78bfa" /><h3 className="a-h3" style={{ marginTop: ".7rem" }}>{n}</h3><p className="a-muted" style={{ marginTop: ".4rem", fontSize: ".88rem", lineHeight: 1.55 }}>{s}</p><span className="a-chip a-chip-amber" style={{ marginTop: ".8rem" }}>Planning</span></div>)}</div>
      </div>
    </section>
  </PublicFrame>;
}
