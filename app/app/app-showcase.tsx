"use client";
import { useEffect, useState } from "react";
import { BadgeCheck, BookOpen, CheckCheck, Home, Layers3, MessageCircle, Sparkles, User } from "lucide-react";

const screens = ["Home", "Learning", "Project", "Chat"] as const;

/** A phone that cycles through illustrative app screens; the tabs let visitors switch manually. */
export function AppShowcase() {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI(v => (v + 1) % screens.length), 3200);
    return () => clearInterval(t);
  }, [hold]);
  return <div className="showcase">
    <div className="showcase-phone dev-phone">
      <div className="dev-notch" />
      <div className="dev-screen" key={i}>
        {i === 0 && <>
          <div className="ph-top"><b>Good evening</b><span className="ph-avatar" /></div>
          <div className="ph-card ph-violet"><small>Continue learning</small><strong>DB-03 · Backend, APIs &amp; Databases</strong><span className="ph-bar"><i style={{ width: "48%" }} /></span></div>
          <div className="ph-row"><div className="ph-mini ph-blue"><Layers3 size={16} /><span>Studio brief</span></div><div className="ph-mini ph-green"><Sparkles size={16} /><span>Diagnosis</span></div></div>
          <div className="ph-card ph-amber"><small>Evidence</small><strong>3 drafts · private</strong></div>
        </>}
        {i === 1 && <>
          <div className="ph-top"><b>My learning</b><BookOpen size={18} /></div>
          {["BRIEF", "LEARN", "INVESTIGATE", "BUILD", "TEST", "EVIDENCE"].map((s, j) => <div key={s} className={`ph-stage ${j < 4 ? "done" : ""}`}><span>{String(j + 1).padStart(2, "0")}</span>{s}{j < 4 && <CheckCheck size={14} />}</div>)}
        </>}
        {i === 2 && <>
          <div className="ph-top"><b>Studio brief</b><Layers3 size={18} /></div>
          <div className="ph-card ph-blue"><small>Fleet booking app</small><strong>Discovery requested</strong></div>
          {["Problem", "Users", "Current state", "Desired outcome"].map(s => <div key={s} className="ph-line"><small>{s}</small><i /><i className="s" /></div>)}
        </>}
        {i === 3 && <>
          <div className="ph-top"><b>WhatsApp</b><MessageCircle size={18} /></div>
          <div className="wa-msg me">We want to automate invoice entry.<CheckCheck size={13} /></div>
          <div className="wa-msg">Routed to Business AI · Ref DB-7Q2K</div>
          <div className="wa-msg me">Great — Tuesday works.<CheckCheck size={13} /></div>
        </>}
        <div className="ph-tab">{[Home, BookOpen, BadgeCheck, User].map((I, j) => <i key={j} className={j === i ? "on" : ""}><I size={14} /></i>)}</div>
      </div>
    </div>
    <div className="showcase-tabs" role="tablist" aria-label="App screens">
      {screens.map((s, j) => <button key={s} type="button" role="tab" aria-selected={i === j} className={i === j ? "on" : ""} onClick={() => { setHold(true); setI(j); }}>{s}</button>)}
    </div>
  </div>;
}
