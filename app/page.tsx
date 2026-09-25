import Link from "next/link";
import { Img } from "./_ui/img";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { BrandMark, type MarkName } from "./_ui/brand-mark";
import { HeroSystem } from "./_ui/hero-system";
import { HeroImage } from "./_ui/hero-image";
import { PartnerShowcase } from "./_ui/partner-showcase";
import { SiteHeader, SiteFooter } from "./site-shell";
import { divisions, outcomes, divisionBySlug, type SceneKey } from "./brand-data";
import { Scene } from "./_ui/scenes";
import { Glyph, type GlyphName } from "./_ui/glyphs";
import { academyCourses, academyStages } from "./academy-data";
import { MagneticLink } from "./_ui/magnetic";
import { ScrubText } from "./_ui/motion";
import { Flywheel } from "./_ui/flywheel";
import { SignatureLab } from "./_ui/signature-lab";
import { ChannelStage } from "./_ui/channel-stage";
import { Marquee, SectionHead } from "./_ui/sections";

const cardScenes: Record<string, SceneKey> = { academy: "cardAcademy", studio: "cardStudio", business: "cardBusiness" };
const storyScenes: SceneKey[] = ["storyAcademy", "storyStudio", "storyBusiness"];

const stories = [
  { d: "academy", quote: "Learning should produce capability and evidence, not just completion.", flow: ["Discover", "Mission", "Submit", "Review", "Assess", "Verify", "Evidence"] },
  { d: "studio", quote: "We do not start with code. We start with the problem.", flow: ["Enquiry", "Discovery", "Validation", "Decision", "Engineering", "QA", "Deploy"] },
  { d: "business", quote: "Automating the wrong process only makes the wrong process faster.", flow: ["Observe", "Diagnose", "Baseline", "Redesign", "Approve", "Automate", "Measure"] },
] as const;
const outcomeMarks: MarkName[] = ["academy", "studio", "business", "talent", "jobs", "contact"];

const capabilities: { t: string; d: string; g: GlyphName; spec: string; hue: [string, string] }[] = [
  { t: "Software & SaaS", d: "Web platforms, portals, marketplaces and internal systems.", g: "code", spec: "TypeScript · React · edge runtime", hue: ["#2563eb", "#22d3ee"] },
  { t: "AI products", d: "Assistants, extraction, classification and decision support — evaluated and governed.", g: "ai", spec: "Evaluated · human approval for high risk", hue: ["#8b5cf6", "#ec4899"] },
  { t: "Data & reporting", d: "Baselines, dashboards and before/after measurement.", g: "data", spec: "Measured vs estimated, always labelled", hue: ["#10b981", "#a3e635"] },
  { t: "Cloud & reliability", d: "Deployment, monitoring, backup and rollback plans.", g: "cloud", spec: "Rollback plan with every release", hue: ["#0ea5e9", "#6366f1"] },
  { t: "Enterprise systems", d: "CRM and ERP fit, configuration and data flows.", g: "enterprise", spec: "Fit before customisation", hue: ["#f59e0b", "#f97316"] },
  { t: "Security", d: "Server-side authorization, tenant boundaries and audit trails.", g: "security", spec: "Every action checked and audited", hue: ["#e10613", "#f43f5e"] },
  { t: "APIs & integrations", d: "Identity, payments and legacy systems connected cleanly.", g: "integrations", spec: "Scoped keys · signed webhooks", hue: ["#14b8a6", "#3b82f6"] },
];

const principles = ["Problems before technology", "Practical capability over passive completion", "Evidence before claims", "Validate before major engineering", "Measure before and after transformation", "Human control for consequential automation", "One identity, contextual roles", "Shared infrastructure, bounded domains"];
const disciplines = ["SaaS platforms", "AI agents & copilots", "Workflow automation", "Data pipelines", "Mobile apps", "APIs & integrations", "Cloud architecture", "Security reviews", "Design systems", "Quality engineering", "Practical missions", "Capability passports"];
export default function Home() {
  return <main className="public-site">
    <SiteHeader />

    {/* 01 — Cinematic hero */}
    <section className="home-hero">
      <HeroImage />
      <div className="home-hero-backdrop"><Scene k="homeHero" /></div>
      <div className="home-hero-shade" />
      <div className="shell home-hero-grid">
        <div className="home-hero-copy">
          <span className="kicker kicker-glass beam"><i className="pulse" />DigitalBurj · Technology and opportunity</span>
          <h1 className="mega">
            <span className="mw" style={{ "--i": 0, "--a": "#93c5fd", "--b": "#7dd3fc" } as CSSProperties}>Learn.</span>{" "}
            <span className="mw" style={{ "--i": 1, "--a": "#c4b5fd", "--b": "#a5b4fc" } as CSSProperties}>Build.</span>{" "}
            <span className="mw mw-serif" style={{ "--i": 2, "--a": "#5eead4", "--b": "#86efac" } as CSSProperties}>Transform.</span>
          </h1>
          <p className="hero-lede">Learn by doing, build useful software, and improve the work that happens inside a business. Your progress can become evidence others can trust.</p>
          <div className="hero-actions">
            <MagneticLink href="/get-started">Find your path</MagneticLink>
            <MagneticLink href="/connect/whatsapp" variant="glass">Chat on WhatsApp</MagneticLink>
          </div>
          <div className="hero-meta"><span><b>{academyCourses.length}</b> Academy units</span><span><b>5</b> connected divisions</span><span><b>1</b> workspace</span></div>
        </div>
        <HeroSystem />
      </div>
      <a href="#statement" className="scroll-cue"><span className="scroll-mouse"><i /></span>Scroll to explore <ArrowDown size={15} /></a>
    </section>

    {/* 02 — Brand statement */}
    <section id="statement" className="statement section">
      <div className="shell">
        <span className="kicker" data-reveal="up"><b>01</b>The idea</span>
        <ScrubText className="statement-text" accent={["Academy", "Studio", "Business", "AI", "capability", "technology", "operations"]} text="At DigitalBurj, learning leads to practical work. Studio turns worthwhile ideas into software. Business AI helps teams repair a process before they automate it. Verified Talent makes capability visible, while Jobs gives people and employers a clearer way to connect." />
        <div className="stat-row">
          {[{ n: academyCourses.length, l: "Academy units in the catalogue", mark: "academy" }, { n: academyStages.length, l: "stages in every practical task", mark: "talent" }, { n: 7, l: "operational leak classes we diagnose", mark: "business" }, { n: 4, l: "risk tiers governing AI automation", mark: "security" }].map((s, i) => <div key={s.l} className="stat" data-reveal="up" style={{ "--i": i } as CSSProperties}><BrandMark name={s.mark as MarkName} className="stat-mark" /><strong data-count={s.n}>{s.n}</strong><span>{s.l}</span></div>)}
        </div>
      </div>
    </section>

    {/* 03 — Divisions bento */}
    <section className="section divisions-sec">
      <div className="shell">
        <SectionHead index="02" kicker="The ecosystem" title={<>Five paths. <em>One company.</em></>}><p>Five connected teams, each with a clear job. Start with the one that matches what you need today.</p></SectionHead>
        <div className="bento">
          {divisions.slice(0, 3).map((d, i) => <Link key={d.slug} href={`/${d.slug}`} className={`bcard bcard-${d.slug}`} data-spotlight data-tilt data-reveal="up" style={{ "--i": i, "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
            <span className="bcard-scene"><Scene k={cardScenes[d.slug]} /></span>
            <span className="bcard-shade" />
            <span className="bcard-top"><span className="bcard-tag">0{i + 1} · {d.verb}</span><span className="orb"><ArrowUpRight size={20} /></span></span>
            <span className="bcard-body"><span className="bcard-division-lockup"><Img src="/brand/digitalburj-wordmark-800.webp" alt="" width={2048} height={512} /><b>{d.name}</b></span><strong>{d.name}</strong><em>{d.tagline}</em><small>{d.description}</small></span>
          </Link>)}
          {divisions.slice(3).map((d, i) => { return <Link key={d.slug} href={`/${d.slug}`} className="bcard bcard-slim" data-reveal="up" style={{ "--i": i + 3, "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
            <BrandMark name={d.slug as MarkName} className="bcard-symbol-mark" lockup />
            <span className="bcard-top"><span className="bcard-tag">0{i + 4} · {d.verb}</span><span className="orb"><ArrowUpRight size={20} /></span></span>
            <span className="bcard-body"><strong>{d.name}</strong><em>{d.tagline}</em></span>
          </Link>; })}
        </div>
      </div>
    </section>

    {/* 04 — Flywheel */}
    <section className="section dark-sec flywheel-sec">
      <div className="shell flywheel-grid">
        <SectionHead light index="03" kicker="The connected ecosystem" title={<>The work <em>stays connected.</em></>}><p>A learner can build assessed work, share it with consent and pursue an opportunity. A business can take a problem from diagnosis through design and delivery without losing the context.</p><Link href="/ecosystem" className="link-arrow">How it connects <ArrowUpRight size={16} /></Link></SectionHead>
        <Flywheel />
      </div>
    </section>

    {/* 05 — Sticky storytelling */}
    <section className="story" data-sticky-story="3">
      <div className="story-sticky">
        <div className="story-media">
          {stories.map((s, i) => { return <div key={s.d} className="story-img story-scene" data-idx={i} style={{ "--a": divisionBySlug[s.d].hue[0] } as CSSProperties}><Scene k={storyScenes[i]} /><span className="story-scene-tag">0{i + 1} / {divisionBySlug[s.d].name}</span></div>; })}
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
        <SectionHead index="07" kicker="How we decide" title={<>Decisions behind <em>the work.</em></>}><p>Validate before building. Diagnose before automating. Keep humans responsible for consequential decisions.</p></SectionHead>
        <div data-reveal="scale"><SignatureLab /></div>
      </div>
    </section>

    {/* 07 — Technology bento */}
    <section className="section dark-sec tech-sec">
      <div className="shell">
        <SectionHead light index="08" kicker="Technology capabilities" title={<>Engineered for <em>real use.</em></>}><p>Software, AI, data, cloud, enterprise, security and integrations — applied where they change an outcome.</p><Link href="/technology" className="link-arrow">Technology at DigitalBurj <ArrowUpRight size={16} /></Link></SectionHead>
        <div className="tech-lanes">
          {capabilities.map((c, i) => <article key={c.t} className="tech-lane" data-reveal="up" style={{ "--i": i, "--a": c.hue[0] } as CSSProperties}>
            <div className="tech-lane-head"><span>{String(i + 1).padStart(2, "0")} / 07</span><h3>{c.t}</h3><p>{c.d}</p></div>
            <div className="tech-lane-media tech-lane-glyph" style={{ "--b": c.hue[1] } as CSSProperties}><Glyph name={c.g} size={i === 0 ? 132 : 96} /><span className="tech-lane-spec">{c.spec}</span><span className="tech-lane-scan" /></div>
          </article>)}
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
          {outcomes.map((o, i) => { const d = divisionBySlug[o.division]; return <Link key={o.id} href={o.href} className="route" data-reveal="up" style={{ "--i": i, "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
            <BrandMark name={outcomeMarks[i]} className="route-mark" />
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

    {/* Completed project identities supplied by DigitalBurj. */}
    <section className="section ventures-sec">
      <div className="shell">
        <SectionHead index="11" kicker="Completed work · Brand partners" title={<>Work we have <em>put into the world.</em></>}><p>These are identities from completed DigitalBurj projects and brand partnerships. Each mark belongs to its own story; together, they show the range of people and businesses we have worked with.</p></SectionHead>
      </div>
      <PartnerShowcase />
    </section>

    <SiteFooter />
  </main>;
}
