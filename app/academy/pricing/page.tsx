import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { PublicFrame, SectionHead } from "../_components/chrome";
import { PricingCards } from "../_components/client";
import { PLANS, PROMO_CODE, TOOL_META, type Plan, type StudioTool } from "../../../lib/academy/plans";
import { getAcademyAccount } from "../../../lib/academy/auth";
import { accessFor } from "../../../lib/academy/access";

export const metadata = { title: "Pricing · DigitalBurj Academy" };

const yes = <Check size={17} color="#34d399" aria-label="Included" />;
const no = <Minus size={17} className="a-muted" aria-label="Not included" />;
const fam = (p: Plan, f: string) => p.families === "all" || p.families.includes(f as never);
const ROWS: [string, (p: Plan) => React.ReactNode][] = [
  ["Price (AED / month)", p => p.monthly ? `${p.monthly}` : "Free"],
  ["Price (AED / year)", p => p.annual ? p.annual.toLocaleString() : "Free"],
  ["Technology units", p => fam(p, "Technology") ? (p.maxLevel >= 9 ? "All levels" : `L1–L${p.maxLevel}`) : p.extraCourses?.some(c => c.startsWith("DB")) ? p.extraCourses.filter(c => c.startsWith("DB")).join(", ") : no],
  ["Professional Foundation (PF)", p => fam(p, "Foundation") ? "All 10" : p.extraCourses?.some(c => c.startsWith("PF")) ? p.extraCourses.filter(c => c.startsWith("PF")).join(", ") : no],
  ["Professional Career (PC)", p => fam(p, "Professional") ? "All 25" : no],
  ["Advanced pathways (AD)", p => fam(p, "Advanced") ? "All 8" : no],
  ["DB-22 assessment readiness", p => p.features.includes("assessment") ? yes : no],
  ["12-stage missions", p => p.features.includes("missions") ? yes : "DB-00 only"],
  ["Evidence centre & Capability Record", p => p.features.includes("evidence") ? yes : "Failure Passport"],
  ...(["video", "lesson", "course", "slides"] as StudioTool[]).map((t): [string, (p: Plan) => React.ReactNode] => [TOOL_META[t].name, p => p.tools.includes(t) ? (p.toolQuota ? `${p.toolQuota} saves` : "Unlimited") : no]),
  ["Claude-assisted drafting", p => p.features.includes("ai") ? yes : no],
  ["Export (PDF, WebM, Markdown, JSON)", p => p.features.includes("export") ? yes : "Print only"],
  ["Support response", p => p.support],
];

export default async function Pricing() {
  const account = await getAcademyAccount().catch(() => null);
  const access = account ? await accessFor(account.id).catch(() => null) : null;
  return <PublicFrame active="/academy/pricing">
    <section className="a-hero" style={{ paddingBottom: "3rem" }}>
      <div className="a-aurora" aria-hidden="true" style={{ opacity: .5 }}><i /><i /><i /></div>
      <div className="a-shell" style={{ position: "relative" }}>
        <SectionHead center eyebrow="Packages & access" title={<>Pay for what you <em className="a-grad">use.</em></>} lede="Prices in AED, excluding 5% UAE VAT. Plans are data, not promises: until a payment provider is connected, paid orders are recorded as payment pending and activate when DigitalBurj confirms payment." />
        <PricingCards signedIn={!!account} currentPlan={access?.plan.id} />
      </div>
    </section>
    <section className="a-sec" style={{ paddingTop: "1rem" }}>
      <div className="a-shell">
        <SectionHead eyebrow="Compare" title={<>Every package, <em className="a-grad">side by side.</em></>} />
        <div className="a-table-wrap"><table className="a-table">
          <thead><tr><th>Feature</th>{PLANS.map(p => <th key={p.id} style={{ color: p.featured ? "#c4b5fd" : undefined }}>{p.name}</th>)}</tr></thead>
          <tbody>{ROWS.map(([label, fn]) => <tr key={label}><td style={{ fontWeight: 650 }}>{label}</td>{PLANS.map(p => <td key={p.id}>{fn(p)}</td>)}</tr>)}</tbody>
        </table></div>
        <div className="a-bento" style={{ marginTop: "1.5rem" }}>
          <div className="a-card w3"><h3 className="a-h3">Promotion code</h3><p className="a-muted" style={{ marginTop: ".5rem", lineHeight: 1.6 }}>The pilot promotion <span className="a-chip a-chip-violet">{PROMO_CODE}</span> gives 100% off an eligible Live package, once per package per account. You see a zero payable amount and confirm the order before anything is activated.</p></div>
          <div className="a-card w3"><h3 className="a-h3">Refunds, upgrades and teams</h3><p className="a-muted" style={{ marginTop: ".5rem", lineHeight: 1.6 }}>Upgrading replaces your current package. Refund requests within 14 days go through <Link href="/support" style={{ textDecoration: "underline" }}>support</Link>. For teams, see <Link href="/academy/business" style={{ textDecoration: "underline" }}>Academy for Business</Link>.</p></div>
        </div>
      </div>
    </section>
  </PublicFrame>;
}
