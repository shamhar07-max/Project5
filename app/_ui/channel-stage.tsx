"use client";
import { useEffect, useState } from "react";
import { BadgeCheck, CheckCheck, FolderKanban, GraduationCap, Layers3 } from "lucide-react";
import { BrandMark, type MarkName } from "./brand-mark";
import { MagneticLink } from "./magnetic";
import { useReducedMotion } from "./use-reduced-motion";

const channels = [
  { id: "web", label: "Web app", mark: "web" as MarkName, title: "A private workspace for the whole journey.", body: "Enquiries, engagement briefs, Academy drafts, files, messages and support — scoped to you or your organization.", href: "/platform", cta: "Explore the web workspace", color: "#2563eb" },
  { id: "mobile", label: "Mobile app", mark: "mobile" as MarkName, title: "DigitalBurj in your pocket.", body: "Install the app to your home screen in one tap. Shortcuts open your learning, projects and WhatsApp instantly.", href: "/app", cta: "See the mobile app", color: "#8b5cf6" },
  { id: "whatsapp", label: "WhatsApp", mark: "whatsapp" as MarkName, title: "Start with a conversation.", body: "A guided composer turns your need into a clear first message — routed to the right team with a reference code.", href: "/connect/whatsapp", cta: "Prepare a WhatsApp message", color: "#22c55e" },
] as const;

const chat = [
  { me: true, t: "Hi DigitalBurj — we lose hours re-keying invoices into our ERP." },
  { me: false, t: "Thanks! Routed to Business AI. Ref DB-7Q2K. Which systems are involved, and roughly how many invoices a week?" },
  { me: true, t: "Email + Excel + Odoo. About 400 a week." },
  { me: false, t: "Great baseline. Next step: a 30-min diagnosis call. We'll measure before we automate anything." },
];

export function ChannelStage() {
  const [sel, setSel] = useState<(typeof channels)[number]["id"]>("web");
  const [n, setN] = useState(0);
  const still = useReducedMotion();
  const c = channels.find(x => x.id === sel)!;
  useEffect(() => {
    if (sel !== "whatsapp" || still) return;
    const t = setInterval(() => setN(v => (v >= chat.length + 2 ? 0 : v + 1)), 1400);
    return () => clearInterval(t);
  }, [sel, still]);
  const shown = still ? chat.length : n;
  return <div className="stage" style={{ "--c": c.color } as React.CSSProperties}>
    <div className="stage-copy">
      <div className="seg" role="tablist" aria-label="Choose a channel">
        {channels.map(x => <button key={x.id} id={`channel-tab-${x.id}`} type="button" role="tab" aria-selected={sel === x.id} aria-controls="stage-panel" tabIndex={sel === x.id ? 0 : -1} className={sel === x.id ? "on" : ""} onClick={() => { setSel(x.id); setN(0); }} onKeyDown={e => { if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return; e.preventDefault(); const current = channels.findIndex(c => c.id === sel); const next = e.key === "Home" ? 0 : e.key === "End" ? channels.length - 1 : (current + (e.key === "ArrowRight" ? 1 : -1) + channels.length) % channels.length; setSel(channels[next].id); setN(0); (e.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus(); }}><BrandMark name={x.mark} className="seg-mark" />{x.label}</button>)}
      </div>
      <div id="stage-panel" role="tabpanel" aria-labelledby={`channel-tab-${c.id}`} tabIndex={0} key={c.id} className="stage-text">
        <h3>{c.title}</h3>
        <p>{c.body}</p>
        <MagneticLink href={c.href} variant="red">{c.cta}</MagneticLink>
      </div>
    </div>
    <div className="stage-device" aria-hidden="true">
      {sel === "web" && <div className="dev-browser">
        <div className="dev-chrome"><i /><i /><i /><span>app.digitalburj.com/workspace</span></div>
        <div className="dev-app">
          <aside><b>DB</b>{[Layers3, GraduationCap, FolderKanban, BadgeCheck].map((I, i) => <span key={i} className={i === 0 ? "on" : ""}><I size={15} /></span>)}</aside>
          <div className="dev-main">
            <div className="dev-title"><strong>Studio brief · Fleet booking app</strong><span className="chip chip-amber">Discovery requested</span></div>
            <div className="dev-grid">
              <div className="dev-tile"><small>Problem</small><em /><em className="s" /></div>
              <div className="dev-tile"><small>Users</small><em /><em className="s" /></div>
              <div className="dev-tile wide"><small>Stage history</small><div className="dev-steps">{["Enquiry", "Brief", "Discovery", "Decision"].map((s, i) => <span key={s} className={i < 3 ? "on" : ""}>{s}</span>)}</div></div>
            </div>
          </div>
        </div>
      </div>}
      {sel === "mobile" && <div className="dev-phone">
        <div className="dev-notch" />
        <div className="dev-screen">
          <div className="ph-top"><b>Good evening</b><span className="ph-avatar" /></div>
          <div className="ph-card ph-violet"><small>Continue learning</small><strong>DB-02 · APIs in practice</strong><span className="ph-bar"><i style={{ width: "62%" }} /></span></div>
          <div className="ph-row">
            <div className="ph-mini ph-blue"><BrandMark name="studio" className="ph-mark" /><span>Studio brief</span></div>
            <div className="ph-mini ph-green"><BrandMark name="business" className="ph-mark" /><span>Automation</span></div>
          </div>
          <div className="ph-card ph-amber"><small>Evidence</small><strong>2 drafts · private</strong></div>
          <div className="ph-tab"><i className="on" /><i /><i /><i /></div>
        </div>
      </div>}
      {sel === "whatsapp" && <div className="dev-phone wa">
        <div className="dev-notch" />
        <div className="dev-screen">
          <div className="wa-head"><span className="wa-av">DB</span><span><b>DigitalBurj</b><small>typically replies in business hours</small></span></div>
          <div className="wa-body">
            {chat.slice(0, shown).map((m, i) => <div key={i} className={`wa-msg ${m.me ? "me" : ""}`}>{m.t}{m.me && <CheckCheck size={13} />}</div>)}
            {shown < chat.length && shown > 0 && <div className={`wa-typing ${chat[shown].me ? "me" : ""}`}><i /><i /><i /></div>}
          </div>
        </div>
      </div>}
    </div>
  </div>;
}
