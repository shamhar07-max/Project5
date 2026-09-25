"use client";
import { useEffect, useState } from "react";

const steps = [
  { t: "Learn", d: "Academy turns study into practical capability through missions and review.", c: "#2563eb" },
  { t: "Demonstrate", d: "Assessed work becomes evidence the learner owns and controls.", c: "#0ea5e9" },
  { t: "Build", d: "Studio validates ideas before engineering commitment, then ships them.", c: "#7c3aed" },
  { t: "Transform", d: "Business AI redesigns the operation first, then automates what should be automated.", c: "#0d9488" },
  { t: "Verify", d: "Declared, assessed and verified capability are always shown separately.", c: "#f59e0b" },
  { t: "Opportunity", d: "Verified Talent and Jobs connect capability with employers — and feed demand back into learning.", c: "#f43f5e" },
];

/** The company flywheel from the blueprint as an orbit you can explore. */
export function Flywheel() {
  const [active, setActive] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive(a => (a + 1) % steps.length), 2600);
    return () => clearInterval(t);
  }, [hold]);
  const R = 150;
  return <div className="flywheel" onMouseLeave={() => setHold(false)}>
    <div className="fw-orbit" style={{ "--c": steps[active].c } as React.CSSProperties}>
      <svg viewBox="-200 -200 400 400" aria-hidden="true">
        <defs><linearGradient id="fwg" x1="0" x2="1"><stop offset="0" stopColor="#e10613" /><stop offset=".5" stopColor="#8b5cf6" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
        <circle r={R} fill="none" stroke="currentColor" strokeOpacity=".14" />
        <circle r={R} fill="none" stroke="url(#fwg)" strokeWidth="2.5" strokeDasharray="120 822" className="fw-beam" />
        <circle r={R - 44} fill="none" stroke="currentColor" strokeOpacity=".08" strokeDasharray="3 7" />
      </svg>
      {steps.map((s, i) => {
        const a = (i / steps.length) * Math.PI * 2 - Math.PI / 2;
        return <button key={s.t} type="button" className={`fw-node ${i === active ? "on" : ""}`} style={{ "--x": `${Math.cos(a) * 37.5}%`, "--y": `${Math.sin(a) * 37.5}%`, "--c": s.c } as React.CSSProperties}
          onMouseEnter={() => { setHold(true); setActive(i); }} onFocus={() => { setHold(true); setActive(i); }} onClick={() => { setHold(true); setActive(i); }} aria-pressed={i === active}>
          <span>{String(i + 1).padStart(2, "0")}</span>{s.t}
        </button>;
      })}
      <div className="fw-core"><small>The flywheel</small><strong>{steps[active].t}</strong></div>
    </div>
    <p className="fw-copy" aria-live="polite"><b style={{ color: steps[active].c }}>{steps[active].t} →</b> {steps[active].d}</p>
  </div>;
}
