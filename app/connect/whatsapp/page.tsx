import type { CSSProperties } from "react";
import { Clock3, Hash, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "../../site-shell";
import { leadTopics, whatsappNumber, type LeadTopic } from "../../../lib/leads";
import { WhatsAppComposer } from "./composer";
import { outcomes } from "../../brand-data";

export const dynamic = "force-dynamic";

export default async function WhatsApp({ searchParams }: { searchParams: Promise<{ topic?: string; intent?: string; timing?: string }> }) {
  const p = await searchParams;
  const topic = (p.topic && p.topic in leadTopics ? p.topic : "general") as LeadTopic;
  const available = Boolean(whatsappNumber());
  return <main className="site" style={{ "--a": "#1f7a4d" } as CSSProperties}>
    <SiteHeader />
    <section className="page-hero">
      <div className="wrap page-hero-grid solo">
        <div>
          <span className="accent-bar" aria-hidden="true" />
          <span className="eyebrow">WhatsApp · {available ? "Official channel" : "Guided request"}</span>
          <h1 className="h1">Start with a conversation.</h1>
          <p className="lede">Write a clear first message in under a minute. We route it to the right team with a reference code, so nothing gets lost between the chat and your workspace.</p>
          <ul className="points">
            <li><Hash size={17} aria-hidden="true" /> A reference code on every request</li>
            <li><Clock3 size={17} aria-hidden="true" /> Routed to Academy, Studio, Business AI, Talent or Jobs</li>
            <li><ShieldCheck size={17} aria-hidden="true" /> Nothing is sent until you press send</li>
          </ul>
        </div>
      </div>
    </section>
    <section className="band-tight">
      <div className="wrap">
        <WhatsAppComposer available={available} initialTopic={topic} intent={outcomes.find(o => o.id === p.intent)?.label ?? ""} timing={(p.timing || "").slice(0, 20)} />
      </div>
    </section>
    <SiteFooter />
  </main>;
}
