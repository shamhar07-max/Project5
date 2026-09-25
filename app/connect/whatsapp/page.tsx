import type { CSSProperties } from "react";
import { Clock3, Hash, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "../../site-shell";
import { SectionHead } from "../../_ui/sections";
import { Aurora } from "../../_ui/sections";
import { leadTopics, whatsappNumber, type LeadTopic } from "../../../lib/leads";
import { WhatsAppComposer } from "./composer";
import { outcomes } from "../../brand-data";

export const dynamic = "force-dynamic";

export default async function WhatsApp({ searchParams }: { searchParams: Promise<{ topic?: string; intent?: string; timing?: string }> }) {
  const p = await searchParams;
  const topic = (p.topic && p.topic in leadTopics ? p.topic : "general") as LeadTopic;
  const available = Boolean(whatsappNumber());
  return <main className="public-site">
    <SiteHeader />
    <section className="connect-hero dark-sec">
      <Aurora hue={["#25d366", "#128c7e"]} third="#e10613" />
      <div className="shell">
        <span className="kicker kicker-glass"><i className="pulse" />WhatsApp · {available ? "Official channel" : "Guided request"}</span>
        <h1 className="hero-title" style={{ "--a": "#86efac", "--b": "#5eead4" } as CSSProperties}>Start with a <em>conversation.</em></h1>
        <p className="hero-lede">Compose a clear first message in under a minute. We route it to the right team with a reference code, so nothing gets lost between chat and workspace.</p>
        <ul className="connect-points">
          <li><Hash size={17} /> A reference code on every request</li>
          <li><Clock3 size={17} /> Routed to Academy, Studio, Business AI, Talent or Jobs</li>
          <li><ShieldCheck size={17} /> Nothing is sent without your tap</li>
        </ul>
      </div>
    </section>
    <section className="section composer-sec">
      <div className="shell">
        <SectionHead index="01" kicker="Guided composer" title={<>Say it once. <em>Say it clearly.</em></>} />
        <WhatsAppComposer available={available} initialTopic={topic} intent={outcomes.find(o => o.id === p.intent)?.label ?? ""} timing={(p.timing || "").slice(0, 20)} />
      </div>
    </section>
    <SiteFooter />
  </main>;
}
