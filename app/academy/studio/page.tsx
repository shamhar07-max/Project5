import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Check, Clapperboard, FileText, LayoutTemplate, Presentation, Sparkles } from "lucide-react";
import { PublicFrame } from "../_components/chrome";
import { PLANS, TOOL_META, type StudioTool } from "../../../lib/academy/plans";
import { getAcademyAccount } from "../../../lib/academy/auth";

export const metadata = { title: "Creator Studio · DigitalBurj Academy" };

const TOOLS: { id: StudioTool; anchor: string; I: typeof Clapperboard; a: string; b: string; points: string[] }[] = [
  { id: "video", anchor: "video", I: Clapperboard, a: "#e10613", b: "#f97316", points: ["Hook → problem → solution → steps → proof → CTA storyboard", "Kinetic, whiteboard or cinematic styles with your brand colour", "Live canvas preview with browser voice-over", "Edit every scene's text, narration and timing", "Export a WebM video, script (.txt) or storyboard (JSON)"] },
  { id: "lesson", anchor: "lesson", I: FileText, a: "#7c3aed", b: "#a78bfa", points: ["Any subject, level and duration — timed to the minute", "5E, Gradual release, Direct instruction, Project-based or Flipped", "Measurable objectives and success criteria", "Differentiation for support, extension and language learners", "Exit ticket, homework and teacher reflection; print or export"] },
  { id: "course", anchor: "course", I: LayoutTemplate, a: "#0891b2", b: "#22d3ee", points: ["Course title, subtitle, learners, outcomes and requirements", "Sections and lectures: video, article, quiz, assignment", "Drag to reorder, mark free previews, set durations", "Marketplace-style publish-readiness checklist", "Landing-page preview; export JSON or CSV curriculum"] },
  { id: "slides", anchor: "slides", I: Presentation, a: "#4f46e5", b: "#a78bfa", points: ["Eight layouts: title, agenda, bullets, stats, quote, process, compare, closing", "Four themes including DigitalBurj Burj and Aurora", "Inline editing, reordering and speaker notes", "Full-screen presenter mode with keyboard navigation", "Print to PDF or download a standalone HTML deck"] },
];

export default async function StudioPage() {
  const account = await getAcademyAccount().catch(() => null);
  return <PublicFrame active="/academy/studio">
    <section className="a-hero">
      <div className="a-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="a-grid-bg" aria-hidden="true" />
      <div className="a-shell" style={{ position: "relative", display: "grid", gap: "1.4rem", justifyItems: "center", textAlign: "center" }}>
        <span className="a-pill"><b>STUDIO</b>For teachers, trainers & course creators</span>
        <h1 className="a-h1" style={{ maxWidth: "15ch" }}>Create learning that <em className="a-grad">lands.</em></h1>
        <p className="a-lede">Explainer videos, lesson plans, full course outlines and presentations — generated instantly from a short brief, then edited by you. When Claude drafting is enabled on this deployment, Educator & Creator and Professional packages can ask Claude for a first draft.</p>
        <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href={account ? "/academy/learn/studio" : "/academy/register?plan=creator"} className="a-btn a-btn-primary a-btn-lg">{account ? "Open the studio" : "Start creating free"} <ArrowRight size={18} /></Link>
          <Link href="/academy/pricing" className="a-btn a-btn-glass a-btn-lg">Compare packages</Link>
        </div>
      </div>
    </section>
    <section style={{ paddingBottom: "6rem" }}>
      <div className="a-shell" style={{ display: "grid", gap: "1.2rem" }}>
        {TOOLS.map((t, i) => {
          const plans = PLANS.filter(p => p.tools.includes(t.id));
          return <article key={t.id} id={t.anchor} className="a-card" data-spotlight data-reveal="up" style={{ "--a": t.a, "--i": i % 2, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", padding: "clamp(1.4rem, 3vw, 2.4rem)", scrollMarginTop: 90 } as CSSProperties}>
            <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
              <span className="a-icon-tile" style={{ "--a": t.a, "--b": t.b, width: 56, height: 56 } as CSSProperties}><t.I size={26} /></span>
              <h2 className="a-h2" style={{ fontSize: "clamp(1.6rem, 3vw, 2.3rem)" }}>{TOOL_META[t.id].name}</h2>
              <p className="a-muted" style={{ lineHeight: 1.6 }}>{TOOL_META[t.id].blurb}</p>
              <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap" }}>{plans.map(p => <span key={p.id} className="a-chip">{p.name}{p.toolQuota ? ` · ${p.toolQuota} saves` : ""}</span>)}</div>
              <Link href={account ? TOOL_META[t.id].href : `/academy/register?next=${TOOL_META[t.id].href}`} className="a-btn a-btn-white" style={{ width: "fit-content" }}>Try {TOOL_META[t.id].short} <ArrowRight size={16} /></Link>
            </div>
            <ul className="a-check" style={{ alignContent: "center" }}>{t.points.map(p => <li key={p}><Check size={16} />{p}</li>)}</ul>
          </article>;
        })}
        <div className="a-alert a-alert-info"><Sparkles size={18} />The studio always works with its built-in template engine. Claude drafting is optional and is only used when the deployment has an Anthropic API key configured — generated material should always be reviewed before use with learners.</div>
      </div>
    </section>
  </PublicFrame>;
}
