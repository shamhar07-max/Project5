import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Clock, Route } from "lucide-react";
import { PublicFrame, SectionHead } from "../_components/chrome";
import { PATHWAYS, courseByCode } from "../../../lib/academy/catalog";
import { PLANS, canAccessCourse } from "../../../lib/academy/plans";

export const metadata = { title: "Learning pathways · DigitalBurj Academy" };

export default function Pathways() {
  return <PublicFrame active="/academy/pathways">
    <section className="a-hero" style={{ paddingBottom: "2rem" }}>
      <div className="a-grid-bg" aria-hidden="true" />
      <div className="a-shell" style={{ position: "relative" }}>
        <SectionHead eyebrow="Pathways & career bundles" title={<>Routes that <em className="a-grad">add up.</em></>} lede="Each pathway connects units in a sensible order, respecting prerequisites. A diagnostic can let experienced learners bypass foundation instruction — never assessment or evidence." />
      </div>
    </section>
    <section style={{ paddingBottom: "6rem" }}>
      <div className="a-shell" style={{ display: "grid", gap: "1.2rem" }}>
        {PATHWAYS.map((p, i) => {
          const units = p.includes.map(courseByCode).filter(c => !!c);
          const hours = units.reduce((s, c) => s + c.hours, 0);
          const plan = PLANS.find(pl => units.every(c => canAccessCourse(pl, c)));
          return <article key={p.id} id={p.id} className="a-card" data-reveal="up" style={{ "--i": i % 3, display: "grid", gap: "1.2rem", scrollMarginTop: 90 } as CSSProperties}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: ".9rem", alignItems: "center" }}><span className="a-icon-tile"><Route size={20} /></span><div><h2 className="a-h3" style={{ fontSize: "1.35rem" }}>{p.name}</h2><p className="a-muted" style={{ fontSize: ".9rem" }}>{p.outcome}</p></div></div>
              <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}><span className="a-chip"><Clock size={11} />{hours}h</span><span className="a-chip a-chip-violet">Included in {plan?.name ?? "Professional"}</span></div>
            </div>
            <ol style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: ".7rem" }}>
              {units.map((c, k) => <li key={c.code}><Link href={`/academy/courses/${c.code}`} className="a-glass" style={{ display: "grid", gap: ".35rem", padding: ".9rem", height: "100%" }}><span className="a-mono a-muted" style={{ fontSize: ".7rem" }}>STEP {k + 1} · {c.code}</span><strong style={{ fontSize: ".92rem", lineHeight: 1.35 }}>{c.title}</strong><span className="a-muted" style={{ fontSize: ".78rem" }}>{c.hours}h · {c.level}</span></Link></li>)}
            </ol>
            <Link href={`/academy/courses/${units[0].code}`} className="a-btn a-btn-glass a-btn-sm" style={{ width: "fit-content" }}>Start with {units[0].code} <ArrowRight size={14} /></Link>
          </article>;
        })}
      </div>
    </section>
  </PublicFrame>;
}
