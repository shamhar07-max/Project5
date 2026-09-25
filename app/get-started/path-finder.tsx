"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, MessageCircle, MonitorSmartphone, Smartphone } from "lucide-react";
import { divisionBySlug, outcomes } from "../brand-data";
import { Glyph, type GlyphName } from "../_ui/glyphs";

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
  const progress = ((step + 1) / 3) * 100;

  return <div className="finder" style={d ? ({ "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties) : undefined}>
    <div className="finder-top">
      <ol className="finder-steps">{["Outcome", "Timing", "Your next step"].map((s, i) => <li key={s} className={i <= step ? "on" : ""}><b>{i < step ? <Check size={12} /> : i + 1}</b>{s}</li>)}</ol>
      <div className="finder-bar"><i style={{ width: `${progress}%` }} /></div>
    </div>

    {step === 0 && <div className="finder-panel" key="s0">
      <h3 className="h2">What do you need to happen?</h3>
      <div className="finder-grid">
        {outcomes.map((o, i) => { const dv = divisionBySlug[o.division]; return <button key={o.id} type="button" className={`finder-opt ${outcome?.id === o.id ? "on" : ""}`} style={{ "--a": dv.hue[0], "--b": dv.hue[1] } as CSSProperties} onClick={() => { setOutcome(o); setStep(1); }}>
          <span className="finder-n num">{String(i + 1).padStart(2, "0")}</span><strong>{o.label}</strong><small>{o.detail}</small><ArrowRight size={18} className="arr" />
        </button>; })}
      </div>
    </div>}

    {step === 1 && <div className="finder-panel" key="s1">
      <button type="button" className="finder-back" onClick={() => setStep(0)}><ArrowLeft size={16} /> Back</button>
      <h3 className="h2">When would you like to start?</h3>
      <div className="finder-grid three">
        {timings.map(t => <button key={t.id} type="button" className={`finder-opt ${timing === t.id ? "on" : ""}`} onClick={() => { setTiming(t.id); setChannel(t.id === "now" ? "whatsapp" : "web"); setStep(2); }}>
          <strong>{t.label}</strong><small>{t.note}</small><ArrowRight size={18} className="arr" />
        </button>)}
      </div>
    </div>}

    {step === 2 && outcome && d && <div className="finder-panel finder-result" key="s2" aria-live="polite">
      <button type="button" className="finder-back" onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
      <span className="eyebrow">Recommended · DigitalBurj {d.name}</span>
      <h3 className="h2">{outcome.action}</h3>
      <div className="finder-recommendation"><Glyph name={outcome.division as GlyphName} tile size={40} /><p><b>Why this path</b>{outcome.detail} {timing === "now" ? "A guided WhatsApp message can put the context in front of our team." : timing === "exploring" ? "Browse the division first, then decide when to create a workspace." : "Your workspace can keep the brief and next steps together."}</p></div>
      <p className="finder-channel-label">Choose how to continue</p><div className="finder-channels" role="radiogroup" aria-label="Preferred channel">
        {channels.map(c => <button key={c.id} type="button" role="radio" aria-checked={channel === c.id} className={channel === c.id ? "on" : ""} onClick={() => setChannel(c.id)} onKeyDown={e => { if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; e.preventDefault(); const at = channels.findIndex(x => x.id === channel); const next = (at + (e.key === "ArrowRight" ? 1 : -1) + channels.length) % channels.length; setChannel(channels[next].id); (e.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus(); }}><c.Icon size={17} />{c.label}</button>)}
      </div>
      <div className="finder-actions">
        <Link href={primary} className="btn btn-primary">{channel === "whatsapp" ? "Continue on WhatsApp" : channel === "mobile" ? "Install the app" : outcome.action} <ArrowRight size={17} className="arr" /></Link>
        <Link href={`/${d.slug}`} className="link">Learn about {d.name} <ArrowRight size={16} className="arr" /></Link>
      </div>
    </div>}
  </div>;
}
