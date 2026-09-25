"use client";
import { useRef } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { BadgeCheck, Bot, CheckCheck, GitBranch, ShieldCheck, Sparkles } from "lucide-react";

const bars = [38, 54, 46, 70, 62, 84, 76, 92];

/**
 * Hero visual: the three places DigitalBurj work happens — the web workspace, the phone
 * and WhatsApp — floating as one layered, pointer-responsive constellation. Pure CSS motion;
 * the pointer only writes two custom properties.
 */
export function HeroConstellation() {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--tx", ((e.clientX - r.left) / r.width - .5).toFixed(3));
    el.style.setProperty("--ty", ((e.clientY - r.top) / r.height - .5).toFixed(3));
  }
  function leave() { ref.current?.style.setProperty("--tx", "0"); ref.current?.style.setProperty("--ty", "0"); }

  return <div ref={ref} className="lx-const" onPointerMove={move} onPointerLeave={leave} role="img" aria-label="The DigitalBurj web workspace, mobile app and WhatsApp conversation working together">
    <div className="lx-const-halo" aria-hidden="true" />
    <div className="lx-const-orbit" aria-hidden="true"><i /><i /><i /></div>

    {/* Web workspace */}
    <div className="lx-layer lx-browser" style={{ "--z": 1 } as CSSProperties} aria-hidden="true">
      <div className="lx-browser-bar"><span /><span /><span /><em>app.digitalburj.com/workspace</em></div>
      <div className="lx-browser-body">
        <aside>{["Overview", "Academy", "Studio", "Business AI", "Talent"].map((t, i) => <b key={t} className={i === 0 ? "on" : ""} style={{ "--i": i } as CSSProperties}>{t}</b>)}</aside>
        <div className="lx-browser-main">
          <div className="lx-kpis">
            <div className="lx-kpi k1"><small>Hours saved / wk</small><strong>8.8</strong><span>measured</span></div>
            <div className="lx-kpi k2"><small>Missions verified</small><strong>14</strong><span>+3 this week</span></div>
            <div className="lx-kpi k3"><small>Release readiness</small><strong>7/9</strong><span>2 to go</span></div>
          </div>
          <div className="lx-chart">{bars.map((h, i) => <i key={i} style={{ "--h": `${h}%`, "--i": i } as CSSProperties} />)}<svg viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 50 C30 44 40 30 70 32 S120 14 150 18 S190 6 200 4" /></svg></div>
        </div>
      </div>
    </div>

    {/* Phone */}
    <div className="lx-layer lx-phone" style={{ "--z": 3 } as CSSProperties} aria-hidden="true">
      <div className="lx-phone-notch" />
      <small className="lx-phone-k">Academy · Mission 03</small>
      <div className="lx-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" /><circle cx="50" cy="50" r="42" className="lx-ring-v" /></svg><strong>72<small>%</small></strong></div>
      <p>Booking flow without double-booking</p>
      <ul>{["Solves the problem", "Prevents overlaps", "Explains trade-offs"].map((t, i) => <li key={t} className={i < 2 ? "ok" : ""}><CheckCheck size={12} />{t}</li>)}</ul>
    </div>

    {/* WhatsApp */}
    <div className="lx-layer lx-wa" style={{ "--z": 4 } as CSSProperties} aria-hidden="true">
      <div className="lx-wa-head"><span className="lx-wa-av">DB</span><span><b>DigitalBurj</b><small>typically replies in minutes</small></span></div>
      <p className="lx-bub me">We lose hours re-typing invoices.</p>
      <p className="lx-bub">Ref DB-7Q2K · routed to Business AI. Let’s map the process first.</p>
      <p className="lx-typing"><i /><i /><i /></p>
    </div>

    {/* Floating chips */}
    <span className="lx-layer lx-chip c1" style={{ "--z": 5 } as CSSProperties} aria-hidden="true"><BadgeCheck size={15} />Credential verified</span>
    <span className="lx-layer lx-chip c2" style={{ "--z": 6 } as CSSProperties} aria-hidden="true"><GitBranch size={15} />v2.4 deployed</span>
    <span className="lx-layer lx-chip c3" style={{ "--z": 5 } as CSSProperties} aria-hidden="true"><ShieldCheck size={15} />High-risk: human approved</span>
    <span className="lx-layer lx-chip c4" style={{ "--z": 2 } as CSSProperties} aria-hidden="true"><Bot size={15} />AI draft · awaiting review</span>
    <span className="lx-layer lx-spark" style={{ "--z": 6 } as CSSProperties} aria-hidden="true"><Sparkles size={18} /></span>
  </div>;
}
