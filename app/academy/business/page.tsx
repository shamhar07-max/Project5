import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, BarChart3, Building2, ClipboardList, Lock, Route, Users } from "lucide-react";
import { PublicFrame, SectionHead } from "../_components/chrome";
import { Scene } from "../../_ui/scenes";

export const metadata = { title: "Academy for Business · DigitalBurj Academy" };
const FEATURES = [
  { I: Users, t: "Employee invitations & roster", d: "Invite staff into your organization and see who is active." },
  { I: Route, t: "Role-based learning paths", d: "Assign units, pathways and deadlines by role." },
  { I: ClipboardList, t: "Assessments & capability gaps", d: "See assessed results against the skills each role needs." },
  { I: BarChart3, t: "Manager reports", d: "Progress, completion and assessment status by team." },
  { I: Building2, t: "Organization billing", d: "One invoice for the organization, seats managed centrally." },
  { I: Lock, t: "Privacy boundaries", d: "Personal learning data stays personal unless the learner consents to share it." },
];
export default function Business() {
  return <PublicFrame active="/academy/business">
    <section className="a-hero">
      <div className="a-aurora" aria-hidden="true" style={{ opacity: .5 }}><i /><i /><i /></div>
      <div className="a-shell" style={{ position: "relative" }}>
        <SectionHead eyebrow="Academy for Business" title={<>Develop the capability your business <em className="a-grad">actually needs.</em></>} lede="Corporate learning, team skill development, role-based paths, employee assessments, custom programmes and internal capability mapping — built on the same missions and evidence as the public Academy.">
          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}><Link href="/connect/whatsapp?topic=academy" className="a-btn a-btn-primary">Talk to our team <ArrowRight size={16} /></Link><Link href="/workspace/organizations" className="a-btn a-btn-glass">Set up an organization</Link></div>
        </SectionHead>
      </div>
    </section>
    <section style={{ paddingBottom: "2rem" }}><div className="a-shell"><div style={{ position: "relative", aspectRatio: "16 / 7", minHeight: 320, borderRadius: 24, overflow: "hidden", border: "1px solid var(--line)" }}><Scene k="heroAcademy" /></div></div></section>
    <section style={{ paddingBottom: "6rem" }}>
      <div className="a-shell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {FEATURES.map((f, i) => <div key={f.t} className="a-card" data-spotlight data-reveal="up" style={{ "--i": i % 3, display: "grid", gap: ".8rem" } as CSSProperties}><span className="a-icon-tile"><f.I size={20} /></span><h2 className="a-h3">{f.t}</h2><p className="a-muted" style={{ lineHeight: 1.6 }}>{f.d}</p></div>)}
      </div>
    </section>
  </PublicFrame>;
}
