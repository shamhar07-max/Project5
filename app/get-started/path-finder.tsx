"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, MessageCircle, MonitorSmartphone, Smartphone } from "lucide-react";
import { divisionBySlug, outcomes } from "../brand-data";
import { MagneticLink } from "../_ui/magnetic";

const timings = [
  { id: "exploring", label: "Just exploring", note: "Browse first, decide later." },
  { id: "soon", label: "In the next month", note: "Ready to plan a first step." },
  { id: "now", label: "It is urgent", note: "Let’s talk as soon as possible." },
] as const;
const channels = [
  { id: "web", label: "Web app", Icon: MonitorSmartphone },
  { id: "mobile", label: "Mobile app", Icon: Smartphone },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
] as const;

/** Three quick choices → one recommended next step on the visitor’s preferred channel. */
export function PathFinder() {
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState<(typeof outcomes)[number] | null>(null);
  const [timing, setTiming] = useState<(typeof timings)[number]["id"] | null>(null);
  const [channel, setChannel] = useState<(typeof channels)[number]["id"]>("web");
  const d = outcome ? divisionBySlug[outcome.division] : null;
  const waHref = `/connect/whatsapp?topic=${outcome?.division ?? "general"}&intent=${outcome?.id ?? ""}&timing=${timing ?? ""}`;
  const primary = channel === "whatsapp" ? waHref : channel === "mobile" ? "/app" : outcome?.href ?? "/workspace";
  const progress = ((step + (step === 2 ? 1 : 0)) / 3) * 100;

  return <div className="finder" style={d ? ({ "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties) : undefined}>
    <div className="finder-top">
      <div className="finder-steps">{["Outcome", "Timing", "Your next step"].map((s, i) => <span key={s} className={i <= step ? "on" : ""}><b>{i < step ? <Check size={12} /> : i + 1}</b>{s}</span>)}</div>
      <div className="finder-bar"><i style={{ width: `${progress}%` }} /></div>
    </div>

    {step === 0 && <div className="finder-panel" key="s0">
      <h3>What do you need to happen?</h3>
      <div className="finder-grid">
        {outcomes.map((o, i) => { const dv = divisionBySlug[o.division]; return <button key={o.id} type="button" className={`finder-opt ${outcome?.id === o.id ? "on" : ""}`} style={{ "--a": dv.hue[0], "--b": dv.hue[1] } as CSSProperties} onClick={() => { setOutcome(o); setStep(1); }}>
          <span className="finder-n">{String(i + 1).padStart(2, "0")}</span><strong>{o.label}</strong><small>{o.detail}</small><ArrowUpRight size={18} className="finder-arrow" />
        </button>; })}
      </div>
    </div>}

    {step === 1 && <div className="finder-panel" key="s1">
      <button type="button" className="finder-back" onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button>
      <h3>When would you like to start?</h3>
      <div className="finder-grid three">
        {timings.map(t => <button key={t.id} type="button" className={`finder-opt ${timing === t.id ? "on" : ""}`} onClick={() => { setTiming(t.id); setChannel(t.id === "now" ? "whatsapp" : "web"); setStep(2); }}>
          <strong>{t.label}</strong><small>{t.note}</small><ArrowUpRight size={18} className="finder-arrow" />
        </button>)}
      </div>
    </div>}

    {step === 2 && outcome && d && <div className="finder-panel finder-result" key="s2" aria-live="polite">
      <button type="button" className="finder-back" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
      <span className="kicker">Recommended · DigitalBurj {d.name}</span>
      <h3>{outcome.action}</h3>
      <p>{outcome.detail} {timing === "now" ? "WhatsApp is the fastest way to reach the right team." : timing === "exploring" ? "Explore freely — sign in only when you want to save progress." : "Your workspace keeps every step in one place."}</p>
      <div className="finder-channels" role="radiogroup" aria-label="Preferred channel">
        {channels.map(c => <button key={c.id} type="button" role="radio" aria-checked={channel === c.id} className={channel === c.id ? "on" : ""} onClick={() => setChannel(c.id)}><c.Icon size={17} />{c.label}</button>)}
      </div>
      <div className="finder-actions">
        <MagneticLink href={primary} variant={channel === "whatsapp" ? "whatsapp" : "red"}>{channel === "whatsapp" ? "Continue on WhatsApp" : channel === "mobile" ? "Install the app" : outcome.action}</MagneticLink>
        <Link href={`/${d.slug}`} className="link-arrow">Learn about {d.name} <ArrowUpRight size={16} /></Link>
      </div>
    </div>}
  </div>;
}
