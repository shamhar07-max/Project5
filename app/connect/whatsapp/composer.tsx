"use client";
import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, CheckCheck, CheckCircle2, Copy, Loader2, MessageCircle } from "lucide-react";
import { composeWhatsAppMessage, leadTopics, type LeadTopic } from "../../../lib/leads";

const hue: Record<LeadTopic, [string, string]> = {
  academy: ["#2563eb", "#38bdf8"], studio: ["#7c3aed", "#818cf8"], business: ["#0d9488", "#22c55e"],
  talent: ["#f59e0b", "#f97316"], jobs: ["#f43f5e", "#fb923c"], general: ["#25d366", "#128c7e"],
};
const starters: Record<LeadTopic, string[]> = {
  academy: ["I want to start a technology career", "I'd like to train my team", "Which unit should I start with?"],
  studio: ["I have an app idea to validate", "We need a web platform built", "We need a mobile app"],
  business: ["We lose hours to manual data entry", "Our leads aren't followed up fast enough", "We want to use AI safely"],
  talent: ["I want to build a capability profile", "How does verification work?"],
  jobs: ["I'm looking for opportunities", "We want to hire with better evidence"],
  general: ["I'd like to partner with DigitalBurj", "I have a question"],
};

type Result = { reference: string; whatsappUrl: string | null; stored: boolean };

export function WhatsAppComposer({ available, initialTopic, intent = "", timing = "" }: { available: boolean; initialTopic: LeadTopic; intent?: string; timing?: string }) {
  const pathname = usePathname();
  const [topic, setTopic] = useState<LeadTopic>(initialTopic);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => composeWhatsAppMessage({ topic, intent, timing, name: name || "Your name", company, message: message || "Your message will appear here…" }, result?.reference), [topic, intent, timing, name, company, message, result]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ channel: "whatsapp", topic, intent, timing, name, contact, company, message, sourcePath: pathname, website }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string; field?: string; reference?: string; whatsappUrl?: string | null; stored?: boolean };
      if (!res.ok && !data.whatsappUrl) { setError({ text: data.error || "Something went wrong. Please try again.", field: data.field }); return; }
      setResult({ reference: data.reference ?? "", whatsappUrl: data.whatsappUrl ?? null, stored: Boolean(data.stored) });
      if (data.whatsappUrl) window.open(data.whatsappUrl, "_blank", "noopener");
    } catch {
      setError({ text: "You appear to be offline. Please check your connection." });
    } finally { setBusy(false); }
  }

  const [a, b] = hue[topic];
  return <div className="composer" style={{ "--a": a, "--b": b } as CSSProperties}>
    <div className="composer-form">
      {!result ? <form onSubmit={submit} noValidate>
        <fieldset>
          <legend>1 · What is it about?</legend>
          <div className="choice">{(Object.keys(leadTopics) as LeadTopic[]).map(t => <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)}>{leadTopics[t]}</button>)}</div>
        </fieldset>
        <fieldset>
          <legend>2 · Your details</legend>
          <div className="form-grid">
            <label className={`field ${error?.field === "name" ? "err" : ""}`}><span>Name</span><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required maxLength={80} placeholder="Aisha Rahman" /></label>
            <label className={`field ${error?.field === "contact" ? "err" : ""}`}><span>Phone or email</span><input value={contact} onChange={e => setContact(e.target.value)} autoComplete="tel" inputMode="email" required maxLength={120} placeholder="+971 50 000 0000" /></label>
          </div>
          <label className="field"><span>Company <small>(optional)</small></span><input value={company} onChange={e => setCompany(e.target.value)} autoComplete="organization" maxLength={120} /></label>
          <label className="hp" aria-hidden="true"><span>Website</span><input tabIndex={-1} value={website} onChange={e => setWebsite(e.target.value)} autoComplete="off" /></label>
        </fieldset>
        <fieldset>
          <legend>3 · Your message</legend>
          <div className="choice choice-sm">{starters[topic].map(s => <button key={s} type="button" onClick={() => setMessage(m => (m ? `${m} ${s}` : s))}>+ {s}</button>)}</div>
          <label className={`field ${error?.field === "message" ? "err" : ""}`}><span className="sr-only">Message</span><textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} required maxLength={1500} placeholder="What would you like to learn, build or improve?" /></label>
          <small className="count muted">{message.length}/1500</small>
        </fieldset>
        {error && <p className="form-error" role="alert">{error.text}</p>}
        <button type="submit" className="btn btn-primary btn-wide" disabled={busy}>{busy ? <Loader2 size={18} className="spin" /> : <MessageCircle size={18} />}{available ? "Continue on WhatsApp" : "Send my request"}<ArrowUpRight size={17} /></button>
        <p className="small muted">{available ? "We save your request with a reference code, then open WhatsApp with the message pre-written. Nothing is sent until you press send in WhatsApp." : "Our official WhatsApp number is being connected. Your request is saved with a reference code and the team will reply on the contact you give."}</p>
      </form> : <div className="card composer-done" role="status">
        <CheckCircle2 size={44} />
        <h3 className="h2">{result.whatsappUrl ? "WhatsApp is ready." : result.stored ? "Request received." : "Almost there."}</h3>
        <p>Your reference is <b>{result.reference}</b>. {result.whatsappUrl ? "If WhatsApp did not open, use the button below." : result.stored ? "We will reply on the contact you provided." : ""}</p>
        <div className="actions">
          {result.whatsappUrl && <a className="btn btn-primary" href={result.whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Open WhatsApp <ArrowUpRight size={17} /></a>}
          <button type="button" className="btn btn-secondary" onClick={async () => { try { await navigator.clipboard.writeText(preview); setCopied(true); } catch { setCopied(false); } }}><Copy size={16} /> {copied ? "Copied" : "Copy message"}</button>
          <Link href="/workspace" className="link">Track it in your workspace <ArrowUpRight size={16} /></Link>
        </div>
      </div>}
    </div>

    <div className="composer-preview" aria-label="Message preview">
      <div className="phone">
        <div className="phone-screen">
          <div className="wa-head"><span className="wa-av">DB</span><span><b>DigitalBurj</b><small>{available ? "Official business account" : "Number being connected"}</small></span></div>
          <div className="wa-body">
            <div className="wa-msg me preview-msg">{preview}<CheckCheck size={13} /></div>
            {result && <div className="wa-msg">Thanks {name.split(" ")[0] || "there"}! Routed to {leadTopics[topic]}. Ref {result.reference}.</div>}
          </div>
          <div className="wa-input"><span>Message</span><i><MessageCircle size={15} /></i></div>
        </div>
      </div>
      <small className="caption">Live preview of your first message</small>
    </div>
  </div>;
}
