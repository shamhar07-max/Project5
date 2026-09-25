"use client";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { ArrowUpRight, BadgeCheck, Check } from "lucide-react";
import { divisions, type DivisionSlug } from "../../brand-data";

const offers: Record<DivisionSlug, string[]> = {
  academy: ["Practical missions", "Rubric review", "Verified credentials"],
  studio: ["Validation sprint", "Product engineering", "Release readiness"],
  business: ["Leak diagnosis", "Process redesign", "Governed automation"],
  talent: ["Capability passport", "Evidence per skill", "Consent-based sharing"],
  jobs: ["Verified employers", "Structured pipeline", "Evidence-led offers"],
};
const cta: Record<DivisionSlug, string> = { academy: "Explore Academy", studio: "Build with Studio", business: "Diagnose a process", talent: "Build your passport", jobs: "See open roles" };

/** Each division gets its own motif, so no two panels look alike. */
function Visual({ slug }: { slug: DivisionSlug }) {
  switch (slug) {
    case "academy": return <div className="dv dv-academy" aria-hidden="true">
      <div className="dv-rings"><i /><i /><i /><strong>Stage 8<small>of 12</small></strong></div>
      {["Discover", "Mission", "Review", "Verify"].map((t, i) => <span key={t} className="dv-float" style={{ "--i": i } as CSSProperties}>{t}</span>)}
    </div>;
    case "studio": return <div className="dv dv-studio" aria-hidden="true">
      <div className="dv-code"><div className="dv-code-bar"><span /><span /><span /><em>booking.ts</em></div>
        {[["k", "export async function"], ["f", " reserve(slot)"], ["c", "  // validate before we build"], ["k", "  if (clash(slot))"], ["s", "    return 'RESHAPE'"], ["k", "  return"], ["s", " 'BUILD'"]].map(([c, t], i) => <code key={i} className={`t-${c}`} style={{ "--i": i } as CSSProperties}>{t}</code>)}
      </div>
      <span className="dv-deploy"><Check size={13} /> Deployed · 0 regressions</span>
    </div>;
    case "business": return <div className="dv dv-business" aria-hidden="true">
      <svg viewBox="0 0 320 200"><defs><linearGradient id="dvb" x1="0" x2="1"><stop offset="0" stopColor="#2dd4bf" /><stop offset="1" stopColor="#a3e635" /></linearGradient></defs>
        <path className="dv-flow" d="M30 150 C90 150 90 60 150 60 S210 150 290 120" />
        <path className="dv-flow f2" d="M30 60 C100 60 110 140 170 140 S240 50 290 60" />
        {[[30, 150], [30, 60], [150, 60], [170, 140], [290, 120], [290, 60]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="11" className="dv-node" style={{ "--i": i } as CSSProperties} /><circle cx={x} cy={y} r="4" fill="#ecfeff" /></g>)}
        <circle cx="150" cy="60" r="20" className="dv-leak" />
      </svg>
      <span className="dv-metric"><b>12h → 3.2h</b> invoice handling / week</span>
    </div>;
    case "talent": return <div className="dv dv-talent" aria-hidden="true">
      <div className="dv-pass"><div className="dv-pass-head"><span className="dv-pass-av" /><span><b>Capability Passport</b><small>talent.digitalburj.com/p/amal</small></span></div>
        {[["React & TypeScript", "Verified", 92], ["Process mapping", "Assessed", 74], ["SQL", "Declared", 48]].map(([s, l, v]) => <div key={s as string} className="dv-skill"><span>{s}</span><em className={`lv-${(l as string).toLowerCase()}`}>{l}</em><i style={{ "--v": `${v}%` } as CSSProperties} /></div>)}
        <span className="dv-stamp"><BadgeCheck size={18} />Verified</span>
      </div>
    </div>;
    case "jobs": return <div className="dv dv-jobs" aria-hidden="true">
      {["Applied", "Interview", "Offer"].map((col, c) => <div key={col} className="dv-col"><small>{col}</small>{Array.from({ length: 3 - c }, (_, i) => <span key={i} className="dv-card" style={{ "--i": i + c } as CSSProperties}><i /><b /></span>)}</div>)}
      <span className="dv-hired">Offer approved · Hired</span>
    </div>;
  }
}

/** Expanding panel gallery: one division opens at a time; hover, focus, tap or arrow keys switch it. */
export function DivisionPanels() {
  const [active, setActive] = useState(0);
  function keys(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : divisions.length - 1)) % divisions.length;
    setActive(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>(".lx-panel-tab")[next]?.focus();
  }
  return <div className="lx-panels" onKeyDown={keys} data-reveal="up">
    {divisions.map((d, i) => {
      const on = i === active;
      return <article key={d.slug} className={`lx-panel lx-panel-${d.slug} ${on ? "on" : ""}`} style={{ "--a": d.hue[0], "--b": d.hue[1], "--i": i } as CSSProperties} onPointerEnter={e => { if (e.pointerType === "mouse") setActive(i); }}>
        <button type="button" className="lx-panel-tab" aria-expanded={on} aria-controls={`panel-${d.slug}`} onClick={() => setActive(i)} onFocus={() => setActive(i)}>
          <span className="lx-panel-n">0{i + 1}</span>
          <span className="lx-panel-verb">{d.verb}</span>
          <span className="lx-panel-name">{d.name}</span>
        </button>
        <div id={`panel-${d.slug}`} className="lx-panel-body" inert={!on}>
          <Visual slug={d.slug} />
          <div className="lx-panel-copy">
            <span className="lx-panel-domain">{d.domain}</span>
            <h3>{d.name}</h3>
            <p className="lx-panel-tag">{d.tagline}</p>
            <p>{d.description}</p>
            <ul>{offers[d.slug].map(o => <li key={o}>{o}</li>)}</ul>
            <Link href={d.slug === "jobs" ? "/jobs/board" : `/${d.slug}`} className="lx-panel-cta">{cta[d.slug]} <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </article>;
    })}
  </div>;
}
