import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, ClipboardCheck, Compass, CreditCard, GraduationCap, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { PublicFrame, SectionHead } from "../_components/chrome";
import { StageExplorer } from "../_components/client";
import { Scene } from "../../_ui/scenes";
import { STAGES, STAGE_HELP } from "../../../lib/academy/curriculum";

export const metadata = { title: "How learning works · DigitalBurj Academy" };

const JOURNEY = [
  { I: UserPlus, t: "Register", d: "Create an account with email and password, or continue with your DigitalBurj account. New accounts start on Explorer." },
  { I: Compass, t: "Diagnostic", d: "Tell us your experience, weekly availability and preferred route. We recommend a starting point and respect prerequisites." },
  { I: CreditCard, t: "Choose a package", d: "Checkout records an order. Access activates only when payment is confirmed or an eligible promotion is applied." },
  { I: KeyRound, t: "Entitlement", d: "Your dashboard, units and studio tools unlock according to the active package. Every request is checked on the server." },
  { I: GraduationCap, t: "Learn & practise", d: "Lessons, knowledge checks, twelve-stage missions and a Failure Passport that records useful mistakes." },
  { I: ClipboardCheck, t: "Assess", d: "Submit an evidence pack. A reviewer scores it against the published rubric; changes may be requested." },
  { I: ShieldCheck, t: "Verify & share", d: "A different person verifies high-value work independently. Evidence stays private until you choose to share it." },
];
const CLAIMS = [["Completion record", "You completed the learning activities."], ["Assessed submission", "A reviewer scored your work against a rubric."], ["Independently verified capability", "A separate verifier confirmed the evidence."], ["Actual workplace experience", "Real delivery outside the Academy — never implied by course completion."], ["Failure Passport", "Useful failures, causes and corrections — private, never a negative employment claim."]];

export default function HowItWorks() {
  return <PublicFrame active="/academy/how-it-works">
    <section className="a-hero" style={{ paddingBottom: "2rem" }}>
      <div className="a-grid-bg" aria-hidden="true" />
      <div className="a-shell" style={{ position: "relative" }}>
        <SectionHead eyebrow="How learning works" title={<>From sign-up to <em className="a-grad">evidence.</em></>} lede="A governed journey: identity, diagnostic, package, entitlement, learning, assessment and verification are separate steps with separate records." />
      </div>
    </section>
    <section style={{ paddingBottom: "4rem" }}>
      <div className="a-shell">
        <ol style={{ display: "grid", gap: ".8rem" }}>{JOURNEY.map((j, i) => <li key={j.t} className="a-card" data-reveal="left" style={{ "--i": i, display: "grid", gridTemplateColumns: "auto auto 1fr", gap: "1.1rem", alignItems: "center" } as CSSProperties}>
          <span className="a-mono a-muted" style={{ fontSize: ".8rem" }}>{String(i + 1).padStart(2, "0")}</span><span className="a-icon-tile"><j.I size={20} /></span>
          <div><h2 className="a-h3">{j.t}</h2><p className="a-muted" style={{ marginTop: ".25rem", lineHeight: 1.55 }}>{j.d}</p></div>
        </li>)}</ol>
      </div>
    </section>
    <section className="a-sec" style={{ background: "#070b16", borderBlock: "1px solid var(--line)" }}>
      <div className="a-shell"><SectionHead eyebrow="Mission stages" title={<>Twelve stages, <em className="a-grad">every mission.</em></>} /><StageExplorer stages={STAGES} help={STAGE_HELP} /></div>
    </section>
    <section className="a-sec">
      <div className="a-shell">
        <SectionHead eyebrow="Five separate claims" title={<>We never blur <em className="a-grad">what you proved.</em></>} lede="From submission to independent verification, every step is recorded by a different person with a different role." />
        <div style={{ position: "relative", aspectRatio: "16 / 7", minHeight: 320, borderRadius: 24, overflow: "hidden", marginBottom: "1.5rem", border: "1px solid var(--line)" }}><Scene k="academyReview" /></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>{CLAIMS.map(([t, d], i) => <div key={t} className="a-card" data-reveal="up" style={{ "--i": i } as CSSProperties}><h3 className="a-h3">{t}</h3><p className="a-muted" style={{ marginTop: ".5rem", lineHeight: 1.6, fontSize: ".92rem" }}>{d}</p></div>)}</div>
        <Link href="/academy/register" className="a-btn a-btn-primary a-btn-lg" style={{ marginTop: "2rem" }}>Start the diagnostic <ArrowRight size={18} /></Link>
      </div>
    </section>
  </PublicFrame>;
}
