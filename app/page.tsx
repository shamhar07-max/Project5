import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { BrandMark, type MarkName } from "./_ui/brand-mark";
import { HeroConstellation } from "./_ui/lux/hero-constellation";
import { DivisionPanels } from "./_ui/lux/division-panels";
import { TechBento } from "./_ui/lux/tech-bento";
import { LaunchPad } from "./_ui/lux/launch-pad";
import { HeroImage } from "./_ui/hero-image";
import { PartnerShowcase } from "./_ui/partner-showcase";
import { SiteHeader, SiteFooter } from "./site-shell";
import { outcomes, divisionBySlug, type SceneKey } from "./brand-data";
import { Scene } from "./_ui/scenes";
import { academyCourses, academyStages } from "./academy-data";
import { MagneticLink } from "./_ui/magnetic";
import { ScrubText } from "./_ui/motion";
import { Flywheel } from "./_ui/flywheel";
import { SignatureLab } from "./_ui/signature-lab";
import { Marquee, SectionHead } from "./_ui/sections";

const storyScenes: SceneKey[] = ["storyAcademy", "storyStudio", "storyBusiness"];

const stories = [
  { d: "academy", quote: "Learning should produce capability and evidence, not just completion.", flow: ["Discover", "Mission", "Submit", "Review", "Assess", "Verify", "Evidence"] },
  { d: "studio", quote: "We do not start with code. We start with the problem.", flow: ["Enquiry", "Discovery", "Validation", "Decision", "Engineering", "QA", "Deploy"] },
  { d: "business", quote: "Automating the wrong process only makes the wrong process faster.", flow: ["Observe", "Diagnose", "Baseline", "Redesign", "Approve", "Automate", "Measure"] },
] as const;
const outcomeMarks: MarkName[] = ["academy", "studio", "business", "talent", "jobs", "contact"];


const principles = ["Problems before technology", "Practical capability over passive completion", "Evidence before claims", "Validate before major engineering", "Measure before and after transformation", "Human control for consequential automation", "One identity, contextual roles", "Shared infrastructure, bounded domains"];
const disciplines = ["SaaS platforms", "AI agents & copilots", "Workflow automation", "Data pipelines", "Mobile apps", "APIs & integrations", "Cloud architecture", "Security reviews", "Design systems", "Quality engineering", "Practical missions", "Capability passports"];
export default function Home() {
  return <main className="public-site">
    <SiteHeader />

    {/* 01 — Cinematic hero */}
    <section className="lx-hero">
      <HeroImage />
      <div className="lx-hero-backdrop" aria-hidden="true"><Scene k="homeHero" /></div>
      <div className="lx-aurora" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="lx-hero-grid-lines" aria-hidden="true" />
      <div className="lx-meteors" aria-hidden="true">{[0, 1, 2, 3, 4].map(n => <i key={n} style={{ "--i": n } as CSSProperties} />)}</div>
      <div className="shell lx-hero-grid">
        <div className="lx-hero-copy">
          <span className="kicker kicker-glass beam"><i className="pulse" />DigitalBurj · Technology and opportunity</span>
          <h1 className="lx-mega">
            <span className="lx-word" style={{ "--i": 0 } as CSSProperties}>Learn.</span>{" "}
            <span className="lx-word" style={{ "--i": 1 } as CSSProperties}>Build.</span>{" "}
            <span className="lx-word lx-word-serif" style={{ "--i": 2 } as CSSProperties}>Transform.</span>
          </h1>
          <p className="lx-rotator" aria-label="For learners, founders, operations teams and employers">
            <span aria-hidden="true">Built for</span>
            <span className="lx-rotator-win" aria-hidden="true"><span className="lx-rotator-list"><b>learners</b><b>founders</b><b>operations teams</b><b>employers</b><b>learners</b></span></span>
          </p>
          <p className="hero-lede">Learn by doing, build useful software, and improve the work that happens inside a business. Your progress becomes evidence others can trust.</p>
          <div className="hero-actions">
            <MagneticLink href="/get-started">Find your path</MagneticLink>
            <MagneticLink href="/connect/whatsapp" variant="whatsapp">Chat on WhatsApp</MagneticLink>
            <Link href="/platform" className="lx-text-cta">Open the web app <ArrowUpRight size={16} /></Link>
          </div>
          <div className="lx-hero-meta">
            <span><b data-count={academyCourses.length}>{academyCourses.length}</b>Academy units</span>
            <span><b>5</b>connected divisions</span>
            <span><b>3</b>channels · web, mobile, WhatsApp</span>
          </div>
        </div>
        <HeroConstellation />
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

    {/* 03 — Divisions */}
    <section className="section lx-divisions">
      <div className="lx-divisions-glow" aria-hidden="true" />
      <div className="shell">
        <SectionHead index="02" kicker="The ecosystem" title={<>Five paths. <em>One company.</em></>}><p>Five connected teams, each with a clear job. Hover, tap or use the arrow keys to open one.</p></SectionHead>
        <DivisionPanels />
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
    <section className="section dark-sec lx-tech">
      <div className="lx-aurora lx-aurora-soft" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="shell">
        <SectionHead light index="08" kicker="Technology capabilities" title={<>Engineered for <em>real use.</em></>}><p>Software, AI, data, cloud, enterprise, security and integrations — applied where they change an outcome.</p><Link href="/technology" className="link-arrow">Technology at DigitalBurj <ArrowUpRight size={16} /></Link></SectionHead>
        <TechBento />
      </div>
    </section>

    {/* 08 — Launch pad: web app, mobile app, WhatsApp */}
    <section className="section lx-launch-sec" id="channels">
      <div className="lx-launch-bg" aria-hidden="true" />
      <div className="shell">
        <SectionHead index="09" kicker="Web app · Mobile app · WhatsApp" title={<>Start where you <em>already are.</em></>}><p>Three channels, one account and one record of progress. Pick a channel, choose a goal and leave a short brief — it takes under a minute.</p></SectionHead>
        <div data-reveal="up"><LaunchPad /></div>
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
