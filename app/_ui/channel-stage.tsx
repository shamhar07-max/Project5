"use client";
import { useEffect, useState } from "react";
import { AppWindow, BadgeCheck, CheckCheck, FolderKanban, GraduationCap, Layers3, MessageCircle, Smartphone, Sparkles } from "lucide-react";
import { MagneticLink } from "./magnetic";
import { useReducedMotion } from "./use-reduced-motion";

const channels = [
  { id: "web", label: "Web app", Icon: AppWindow, title: "A private workspace for the whole journey.", body: "Enquiries, engagement briefs, Academy drafts, files, messages and support — scoped to you or your organization.", href: "/platform", cta: "Tour the web app", color: "#2563eb" },
  { id: "mobile", label: "Mobile app", Icon: Smartphone, title: "DigitalBurj in your pocket.", body: "Install the app to your home screen in one tap. Shortcuts open your learning, projects and WhatsApp instantly.", href: "/app", cta: "Get the app", color: "#8b5cf6" },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle, title: "Start with a conversation.", body: "A guided composer turns your need into a clear first message — routed to the right team with a reference code.", href: "/connect/whatsapp", cta: "Start on WhatsApp", color: "#22c55e" },
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
        {channels.map(x => <button key={x.id} type="button" role="tab" aria-selected={sel === x.id} aria-controls="stage-panel" className={sel === x.id ? "on" : ""} onClick={() => { setSel(x.id); setN(0); }}><x.Icon size={16} aria-hidden="true" />{x.label}</button>)}
      </div>
      <div id="stage-panel" role="tabpanel" key={c.id} className="stage-text">
        <h3>{c.title}</h3>
        <p>{c.body}</p>
        <MagneticLink href={c.href} variant={c.id === "whatsapp" ? "whatsapp" : "red"}>{c.cta}</MagneticLink>
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
            <div className="ph-mini ph-blue"><Layers3 size={16} /><span>Studio brief</span></div>
            <div className="ph-mini ph-green"><Sparkles size={16} /><span>Automation</span></div>
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
