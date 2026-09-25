"use client";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2, Download, Loader2, MessageCircle, MonitorSmartphone, Smartphone } from "lucide-react";
import { leadTopics, type LeadTopic } from "../../../lib/leads";

type Channel = "web" | "mobile" | "whatsapp";

const channels: { id: Channel; label: string; note: string; icon: typeof MessageCircle; hue: [string, string]; send: string }[] = [
  { id: "web", label: "Web app", note: "A private workspace in any browser. Every brief, file and approval in one place.", icon: MonitorSmartphone, hue: ["#2563eb", "#22d3ee"], send: "Create my workspace brief" },
  { id: "mobile", label: "Mobile app", note: "Install DigitalBurj on your home screen and follow progress on the move.", icon: Smartphone, hue: ["#8b5cf6", "#ec4899"], send: "Save and get the app" },
  { id: "whatsapp", label: "WhatsApp", note: "A guided first message with a reference code, routed to the right team.", icon: MessageCircle, hue: ["#25d366", "#128c7e"], send: "Continue on WhatsApp" },
];

const goals: Record<LeadTopic, string> = {
  academy: "Learn a skill or train a team",
  studio: "Build a web or mobile product",
  business: "Fix or automate a process",
  talent: "Show verified capability",
  jobs: "Hire or find a role",
  general: "Something else",
};
const intake: Partial<Record<LeadTopic, string>> = { studio: "/workspace/intake?service=studio", business: "/workspace/intake?service=business", academy: "/academy/catalogue", talent: "/workspace/talent", jobs: "/jobs/board" };

type Done = { reference: string; whatsappUrl: string | null; stored: boolean };

/** Three-step conversion flow: pick a channel, pick a goal, leave a short brief. Stored via /api/leads. */
export function LaunchPad() {
  const pathname = usePathname();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState<LeadTopic | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const ch = channels.find(c => c.id === channel)!;

  function pickChannel(c: Channel) { setChannel(c); if (done) { setDone(null); setStep(0); } }
  function pickGoal(t: LeadTopic) { setTopic(t); setStep(1); }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!topic) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ channel, topic, intent: goals[topic], timing: "", name, contact, company: "", message, sourcePath: pathname, website }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string; reference?: string; whatsappUrl?: string | null; stored?: boolean };
      if (!res.ok && !data.whatsappUrl) { setError(data.error || "Something went wrong. Please try again."); return; }
      setDone({ reference: data.reference ?? "", whatsappUrl: data.whatsappUrl ?? null, stored: Boolean(data.stored) });
      setStep(2);
      if (data.whatsappUrl) window.open(data.whatsappUrl, "_blank", "noopener");
    } catch { setError("You appear to be offline. Please check your connection."); }
    finally { setBusy(false); }
  }

  const Icon = ch.icon;
  return <div className="lx-launch" style={{ "--a": ch.hue[0], "--b": ch.hue[1] } as CSSProperties}>
    <div className="lx-launch-rail" role="tablist" aria-label="Choose a channel">
      {channels.map(c => { const I = c.icon; return <button key={c.id} type="button" role="tab" aria-selected={channel === c.id} className={`lx-launch-tab ${channel === c.id ? "on" : ""}`} style={{ "--a": c.hue[0], "--b": c.hue[1] } as CSSProperties} onClick={() => pickChannel(c.id)}>
        <span className="lx-launch-ico"><I size={20} /></span><span><strong>{c.label}</strong><small>{c.note}</small></span>
      </button>; })}
    </div>

    <div className="lx-launch-stage" role="tabpanel" aria-label={ch.label}>
      <div className="lx-launch-top">
        <span className="lx-launch-chip"><Icon size={15} />{ch.label}</span>
        <ol className="lx-steps" aria-label="Progress">{["Goal", "Brief", "Done"].map((s, i) => <li key={s} className={i <= step ? "on" : ""} aria-current={i === step ? "step" : undefined}><i>{i + 1}</i>{s}</li>)}</ol>
      </div>
      <div className="lx-launch-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>

      {step === 0 && <div className="lx-launch-body" key="goal">
        <h3>What should happen next?</h3>
        <div className="lx-goals">{(Object.keys(goals) as LeadTopic[]).map((t, i) => <button key={t} type="button" className={`lx-goal ${topic === t ? "on" : ""}`} style={{ "--i": i } as CSSProperties} onClick={() => pickGoal(t)}><span>{leadTopics[t]}</span><strong>{goals[t]}</strong><ArrowUpRight size={16} /></button>)}</div>
      </div>}

      {step === 1 && topic && <form className="lx-launch-body" key="brief" onSubmit={submit} noValidate>
        <button type="button" className="lx-back" onClick={() => setStep(0)}><ArrowLeft size={15} />{goals[topic]}</button>
        <h3>A short brief is enough.</h3>
        <div className="lx-fields">
          <label><span>Your name</span><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required minLength={2} placeholder="Amal Rahman" /></label>
          <label><span>Phone or email</span><input value={contact} onChange={e => setContact(e.target.value)} autoComplete="email" required placeholder={channel === "whatsapp" ? "+971 5X XXX XXXX" : "you@company.com"} /></label>
          <label className="full"><span>What are you working through?</span><textarea value={message} onChange={e => setMessage(e.target.value)} required minLength={10} rows={3} placeholder="One or two sentences is plenty." /></label>
          <label className="hp" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
        </div>
        {error && <p className="lx-error" role="alert">{error}</p>}
        <button type="submit" className="lx-send" disabled={busy}>{busy ? <Loader2 size={18} className="spin" /> : <Icon size={18} />}{ch.send}</button>
        <p className="lx-fine">Stored with a reference code. {channel === "whatsapp" ? "WhatsApp opens with the message written; nothing is sent until you tap send." : "No account needed to start."}</p>
      </form>}

      {step === 2 && done && <div className="lx-launch-body lx-done" key="done">
        <CheckCircle2 size={44} className="lx-done-ico" />
        <h3>{done.stored ? "Your request is in." : "Almost there."}</h3>
        <p>Reference <b className="lx-ref">{done.reference}</b>{done.stored ? " — keep it for any follow-up." : " — we could not save it just now, so please continue on the channel below."}</p>
        <div className="lx-done-actions">
          {channel === "whatsapp" && (done.whatsappUrl ? <a className="lx-send" href={done.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />Open WhatsApp again</a> : <Link className="lx-send" href={`/connect/whatsapp?topic=${topic}`}><MessageCircle size={18} />Open the full composer</Link>)}
          {channel === "web" && <Link className="lx-send" href={(topic && intake[topic]) || "/workspace"}><MonitorSmartphone size={18} />Continue in the web app</Link>}
          {channel === "mobile" && <Link className="lx-send" href="/app"><Download size={18} />Install the mobile app</Link>}
          <button type="button" className="lx-ghost" onClick={() => { setDone(null); setStep(0); setMessage(""); }}>Start another</button>
        </div>
      </div>}
    </div>
  </div>;
}
