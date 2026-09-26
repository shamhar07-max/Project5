import { BadgeCheck, Clapperboard, Route, ShieldCheck } from "lucide-react";
import { Brand } from "./chrome";

export function AuthArt({ title, sub }: { title: React.ReactNode; sub: string }) {
  return <div className="a-auth-art a-noise">
    <div className="a-aurora" aria-hidden="true"><i /><i /><i /></div>
    <div className="a-grid-bg" aria-hidden="true" />
    <div style={{ position: "relative" }}><Brand /></div>
    <div style={{ position: "relative", display: "grid", gap: "1.2rem" }}>
      <h2 className="a-h2">{title}</h2>
      <p className="a-lede">{sub}</p>
      <ul style={{ display: "grid", gap: ".7rem", marginTop: ".5rem" }}>
        {[[Route, "Missions & pathways across 70+ units"], [Clapperboard, "Creator Studio: video, lesson plans, courses, slides"], [BadgeCheck, "Rubric review & a private Capability Record"], [ShieldCheck, "Evidence private by default"]].map(([I, t]) => { const Icon = I as typeof Route; return <li key={t as string} className="a-glass" style={{ display: "flex", gap: ".8rem", alignItems: "center", padding: ".8rem 1rem" }}><Icon size={18} color="#a78bfa" /><span style={{ fontWeight: 650, fontSize: ".92rem" }}>{t as string}</span></li>; })}
      </ul>
    </div>
    <p className="a-muted" style={{ position: "relative", fontSize: ".78rem" }}>Learning, assessment, verification and workplace experience are separate claims.</p>
  </div>;
}
