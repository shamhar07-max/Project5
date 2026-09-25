import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight, Cloud, Cpu, Database, Link2, Lock, Server, Terminal } from "lucide-react";
import { SiteHeader, SiteFooter } from "./site-shell";
import { divisions, media, outcomes, divisionBySlug } from "./brand-data";
import { academyCourses, academyStages } from "./academy-data";
import { MagneticLink } from "./_ui/magnetic";
import { ScrubText } from "./_ui/motion";
import { HeroStack } from "./_ui/hero-stack";
import { Flywheel } from "./_ui/flywheel";
import { SignatureLab } from "./_ui/signature-lab";
import { ChannelStage } from "./_ui/channel-stage";
import { Aurora, Marquee, SectionHead } from "./_ui/sections";
import { GenArt } from "./gen-art";

const cardImages = { academy: media.cardAcademy, studio: media.cardStudio, business: media.cardBusiness } as const;

const stories = [
  { d: "academy", img: media.storyAcademy, quote: "Learning should produce capability and evidence, not just completion.", flow: ["Discover", "Mission", "Submit", "Review", "Assess", "Verify", "Evidence"] },
  { d: "studio", img: media.storyStudio, quote: "We do not start with code. We start with the problem.", flow: ["Enquiry", "Discovery", "Validation", "Decision", "Engineering", "QA", "Deploy"] },
  { d: "business", img: media.storyBusiness, quote: "Automating the wrong process only makes the wrong process faster.", flow: ["Observe", "Diagnose", "Baseline", "Redesign", "Approve", "Automate", "Measure"] },
] as const;

const capabilities = [
  { t: "Software & SaaS", d: "Web platforms, portals, marketplaces and internal systems.", Icon: Terminal, cls: "cap-code", hue: ["#2563eb", "#22d3ee"] },
  { t: "AI products", d: "Assistants, extraction, classification and decision support — evaluated and governed.", Icon: Cpu, cls: "cap-ai", hue: ["#8b5cf6", "#ec4899"] },
  { t: "Data & reporting", d: "Baselines, dashboards and before/after measurement.", Icon: Database, cls: "cap-data", hue: ["#10b981", "#a3e635"] },
  { t: "Cloud & reliability", d: "Deployment, monitoring, backup and rollback plans.", Icon: Cloud, cls: "cap-cloud", hue: ["#0ea5e9", "#6366f1"] },
  { t: "Enterprise systems", d: "CRM and ERP fit, configuration and data flows.", Icon: Server, cls: "cap-ent", hue: ["#f59e0b", "#f97316"] },
  { t: "Security", d: "Server-side authorization, tenant boundaries and audit trails.", Icon: Lock, cls: "cap-sec", hue: ["#e10613", "#f43f5e"] },
  { t: "APIs & integrations", d: "Identity, payments and legacy systems connected cleanly.", Icon: Link2, cls: "cap-int", hue: ["#14b8a6", "#3b82f6"] },
] as const;

const principles = ["Problems before technology", "Practical capability over passive completion", "Evidence before claims", "Validate before major engineering", "Measure before and after transformation", "Human control for consequential automation", "One identity, contextual roles", "Shared infrastructure, bounded domains"];
const disciplines = ["SaaS platforms", "AI agents & copilots", "Workflow automation", "Data pipelines", "Mobile apps", "APIs & integrations", "Cloud architecture", "Security reviews", "Design systems", "Quality engineering", "Practical missions", "Capability passports"];
const ventures = ["LoadByTon", "VelozTrade", "The Imam Collective", "Rootiva Herbal", "Procurazo", "Attesora", "HospyQ", "Elite Escape", "MedinaBridge", "Resilianta"];

export default function Home() {
  return <main className="public-site">
    <SiteHeader />

    {/* 01 — Cinematic hero */}
    <section className="home-hero">
      <div className="home-hero-photo" style={{ backgroundImage: `url('${media.homeHero}')` }} data-parallax="0.06" />
      <div className="home-hero-shade" />
      <Aurora hue={["#e10613", "#2563eb"]} third="#8b5cf6" />
      <div className="shell home-hero-grid">
        <div className="home-hero-copy">
          <span className="kicker kicker-glass beam"><i className="pulse" />One technology company · Three engines of progress</span>
          <h1 className="mega">
            <span className="mw" style={{ "--i": 0, "--a": "#c4b5fd", "--b": "#f0abfc" } as CSSProperties}>Learn.</span>{" "}
            <span className="mw" style={{ "--i": 1, "--a": "#93c5fd", "--b": "#67e8f9" } as CSSProperties}>Build.</span>{" "}
            <span className="mw mw-serif" style={{ "--i": 2, "--a": "#fda4af", "--b": "#fde68a" } as CSSProperties}>Transform.</span>
          </h1>
          <p className="hero-lede">Develop real capability. Engineer software that deserves to exist. Redesign how your business works — then automate it, with humans in control.</p>
          <div className="hero-actions">
            <MagneticLink href="/get-started">Find your path</MagneticLink>
            <MagneticLink href="/connect/whatsapp" variant="glass">Chat on WhatsApp</MagneticLink>
          </div>
          <div className="hero-meta"><span><b>{academyCourses.length}</b> Academy units</span><span><b>5</b> connected divisions</span><span><b>1</b> workspace</span></div>
        </div>
        <HeroStack />
      </div>
      <a href="#statement" className="scroll-cue"><span className="scroll-mouse"><i /></span>Scroll to explore <ArrowDown size={15} /></a>
      <Marquee items={disciplines} className="hero-marquee" />
    </section>

    {/* 02 — Brand statement */}
    <section id="statement" className="statement section">
      <div className="shell">
        <span className="kicker" data-reveal="up"><b>01</b>The idea</span>
        <ScrubText className="statement-text" accent={["Academy", "Studio", "Business", "AI", "capability", "technology", "operations"]} text="DigitalBurj is one technology company with three engines. Academy develops capability. Studio engineers technology. Business AI improves how organizations operate — and Verified Talent and Jobs turn that progress into opportunity." />
        <div className="stat-row">
          {[{ n: academyCourses.length, l: "Academy units in the catalogue" }, { n: academyStages.length, l: "stages in every practical task" }, { n: 7, l: "operational leak classes we diagnose" }, { n: 4, l: "risk tiers governing AI automation" }].map((s, i) => <div key={s.l} className="stat" data-reveal="up" style={{ "--i": i } as CSSProperties}><strong data-count={s.n}>{s.n}</strong><span>{s.l}</span></div>)}
        </div>
      </div>
    </section>

    {/* 03 — Divisions bento */}
    <section className="section divisions-sec">
      <div className="shell">
        <SectionHead index="02" kicker="The ecosystem" title={<>One company. <em>Three engines.</em></>}><p>Learn what matters. Build what deserves to exist. Transform what can work better.</p></SectionHead>
        <div className="bento">
          {divisions.slice(0, 3).map((d, i) => <Link key={d.slug} href={`/${d.slug}`} className={`bcard bcard-${d.slug}`} data-spotlight data-tilt data-reveal="up" style={{ "--i": i, "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
            <span className="bcard-img" style={{ backgroundImage: `url('${cardImages[d.slug as keyof typeof cardImages]}')` }} />
            <span className="bcard-shade" />
            <span className="bcard-top"><span className="bcard-tag">0{i + 1} · {d.verb}</span><span className="orb"><ArrowUpRight size={20} /></span></span>
            <span className="bcard-body"><strong>{d.name}</strong><em>{d.tagline}</em><small>{d.description}</small></span>
          </Link>)}
          {divisions.slice(3).map((d, i) => <Link key={d.slug} href={`/${d.slug}`} className="bcard bcard-slim" data-spotlight data-reveal="up" style={{ "--i": i + 3, "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
            <GenArt seed={`home-${d.slug}`} variant={i ? "bars" : "orbit"} hue={d.hue} className="bcard-art" />
            <span className="bcard-top"><span className="bcard-tag">0{i + 4} · {d.verb}</span><span className="orb"><ArrowUpRight size={20} /></span></span>
            <span className="bcard-body"><strong>{d.name}</strong><em>{d.tagline}</em></span>
          </Link>)}
        </div>
      </div>
    </section>

    {/* 04 — Flywheel */}
    <section className="section dark-sec flywheel-sec">
      <Aurora hue={["#8b5cf6", "#22d3ee"]} third="#e10613" />
      <div className="shell flywheel-grid">
        <SectionHead light index="03" kicker="The connected ecosystem" title={<>Every engine <em>feeds the next.</em></>}><p>Capability becomes products. Products transform operations. Verified evidence creates opportunity — and demand flows back into learning.</p><Link href="/ecosystem" className="link-arrow">How it connects <ArrowUpRight size={16} /></Link></SectionHead>
        <Flywheel />
      </div>
    </section>

    {/* 05 — Sticky storytelling */}
    <section className="story" data-sticky-story="3">
      <div className="story-sticky">
        <div className="story-media">
          {stories.map((s, i) => <div key={s.d} className="story-img" data-idx={i} style={{ backgroundImage: `url('${s.img}')`, "--a": divisionBySlug[s.d].hue[0] } as CSSProperties} />)}
          <div className="story-media-shade" />
          <div className="story-counter"><span className="story-bar" /><span className="story-dots">{stories.map((s, i) => <i key={s.d} data-idx={i} />)}</span></div>
        </div>
      </div>
      <div className="story-chapters">
        {stories.map((s, i) => { const d = divisionBySlug[s.d]; return <article key={s.d} className="chapter" style={{ "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
          <span className="kicker"><b>0{i + 4}</b>{d.name} story</span>
          <blockquote>“{s.quote}”</blockquote>
          <ol className="flow-chips">{s.flow.map((f, j) => <li key={f} style={{ "--i": j } as CSSProperties}>{f}</li>)}</ol>
          <Link href={`/${d.slug}`} className="link-arrow">Explore {d.name} <ArrowUpRight size={16} /></Link>
        </article>; })}
      </div>
    </section>

    {/* 06 — Signature decisions */}
    <section className="section lab-sec">
      <div className="shell">
        <SectionHead index="07" kicker="How we decide" title={<>Principles you can <em>press.</em></>}><p>The decisions that make DigitalBurj different — validate before building, diagnose before automating, keep humans in control.</p></SectionHead>
        <div data-reveal="scale"><SignatureLab /></div>
      </div>
    </section>

    {/* 07 — Technology bento */}
    <section className="section dark-sec tech-sec">
      <Aurora hue={["#2563eb", "#10b981"]} third="#f59e0b" />
      <div className="shell">
        <SectionHead light index="08" kicker="Technology capabilities" title={<>Engineered for <em>real use.</em></>}><p>Software, AI, data, cloud, enterprise, security and integrations — applied where they change an outcome.</p><Link href="/technology" className="link-arrow">Technology at DigitalBurj <ArrowUpRight size={16} /></Link></SectionHead>
        <div className="cap-grid">
          {capabilities.map((c, i) => <div key={c.t} className={`cap ${c.cls}`} data-spotlight data-reveal="up" style={{ "--i": i, "--a": c.hue[0], "--b": c.hue[1] } as CSSProperties}>
            <div className="cap-visual" aria-hidden="true">
              {c.cls === "cap-code" && <div className="v-code">{["import { validate }", "export async function build()", "  await qa.regression()", "  return deploy({ rollback })"].map((l, j) => <span key={j} style={{ "--j": j } as CSSProperties}>{l}</span>)}</div>}
              {c.cls === "cap-ai" && <div className="v-neural">{Array.from({ length: 12 }, (_, j) => <i key={j} style={{ "--j": j } as CSSProperties} />)}</div>}
              {c.cls === "cap-data" && <div className="v-bars">{[40, 64, 52, 80, 70, 92, 60, 86].map((h, j) => <i key={j} style={{ "--h": `${h}%`, "--j": j } as CSSProperties} />)}</div>}
              {c.cls === "cap-cloud" && <div className="v-orbit"><i /><i /><i /><b /></div>}
              {c.cls === "cap-ent" && <div className="v-stack"><i /><i /><i /></div>}
              {c.cls === "cap-sec" && <div className="v-shield"><Lock size={34} /><i /></div>}
              {c.cls === "cap-int" && <div className="v-beam"><b /><b /><b /><i /><i /></div>}
            </div>
            <c.Icon size={20} className="cap-ico" aria-hidden="true" />
            <h3>{c.t}</h3>
            <p>{c.d}</p>
          </div>)}
        </div>
      </div>
    </section>

    {/* 08 — Channels: web app, mobile app, WhatsApp */}
    <section className="section channels-sec" id="channels">
      <div className="shell">
        <SectionHead index="09" kicker="Web app · Mobile app · WhatsApp" title={<>Start where you <em>already are.</em></>}><p>Three channels, one account and one record of progress. The conversation shown is illustrative.</p></SectionHead>
        <div data-reveal="up"><ChannelStage /></div>
      </div>
    </section>

    {/* 09 — Outcome router */}
    <section className="section router-sec">
      <div className="shell">
        <SectionHead index="10" kicker="Outcome router" title={<>What do you <em>need to happen?</em></>}><Link href="/get-started" className="link-arrow">Open the full path finder <ArrowUpRight size={16} /></Link></SectionHead>
        <div className="router">
          {outcomes.map((o, i) => { const d = divisionBySlug[o.division]; return <Link key={o.id} href={o.href} className="route" data-spotlight data-reveal="up" style={{ "--i": i, "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
            <span className="route-n">{String(i + 1).padStart(2, "0")}</span>
            <strong>{o.label}</strong>
            <small>{o.detail}</small>
            <span className="route-cta">{o.action} <ArrowUpRight size={15} /></span>
          </Link>; })}
        </div>
      </div>
    </section>

    {/* 10 — Principles */}
    <section className="principles-sec" aria-label="Operating principles">
      <Marquee items={principles} className="marquee-xl" />
      <Marquee items={disciplines.slice().reverse()} reverse className="marquee-sm" />
    </section>

    {/* 11 — Ventures (honest status) */}
    <section className="section ventures-sec">
      <div className="shell">
        <SectionHead index="11" kicker="Portfolio & ventures" title={<>Products in the <em>DigitalBurj orbit.</em></>}><p>Named in the company blueprint. Availability and stage are confirmed individually — no product is presented here as live until it is.</p></SectionHead>
        <ul className="ventures">
          {ventures.map((v, i) => <li key={v} data-reveal="up" style={{ "--i": i % 5 } as CSSProperties}>
            <GenArt seed={`venture-${v}`} variant={(["mesh", "circuit", "wave", "orbit", "bars"] as const)[(i + Math.floor(i / 5) * 2) % 5]} hue={divisions[(i * 3 + Math.floor(i / 5)) % 5].hue} className="venture-art" />
            <span className="venture-n">{String(i + 1).padStart(2, "0")}</span><strong>{v}</strong><span className="venture-status">Status under review</span>
          </li>)}
        </ul>
      </div>
    </section>

    <SiteFooter />
  </main>;
}
