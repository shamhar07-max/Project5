import Link from "next/link";
import type { CSSProperties } from "react";
import { SiteHeader, SiteFooter } from "./site-shell";
import { divisions, divisionBySlug, type SceneKey } from "./brand-data";
import { academyCourses, academyStages } from "./academy-data";
import { Scene } from "./_ui/scenes";
import { Glyph, type GlyphName } from "./_ui/glyphs";
import { Arrow, ChannelRow } from "./_ui/sections";

const engines: { d: "academy" | "studio" | "business"; scene: SceneKey; title: string; body: string; flow: string[]; cta: string; href: string }[] = [
  { d: "academy", scene: "storyAcademy", title: "Learning that leaves evidence behind.", body: "Every Academy unit ends in practical work that a reviewer scores against a rubric. The strongest work is checked again by someone independent, and what passes becomes a credential anyone can verify.", flow: ["Mission", "Submit", "Review", "Verify", "Credential"], cta: "Explore the Academy", href: "/academy" },
  { d: "studio", scene: "storyStudio", title: "We start with the problem, not the code.", body: "Before we build, we test the idea against eight questions — from real user need to who has the authority to decide. Then we recommend one of three things: build it, reshape it, or stop.", flow: ["Enquiry", "Discovery", "Decision", "Build", "Release"], cta: "How Studio works", href: "/studio" },
  { d: "business", scene: "storyBusiness", title: "Fix the process first. Then automate it.", body: "We sit with the people who do the work, measure where time and money leak, and redesign the process. Only then do we automate — with a person approving anything that carries real risk.", flow: ["Observe", "Measure", "Redesign", "Approve", "Automate"], cta: "How Business AI works", href: "/business" },
];

const beliefs = [
  { t: "Validate before building", d: "An idea earns engineering time by passing a written decision: build, reshape or stop." },
  { t: "Measure before and after", d: "Every improvement starts with a baseline, labelled measured or estimated, so results are honest." },
  { t: "People approve what matters", d: "Automation that touches money, customers or compliance waits for a named person to approve it." },
];

// Each identity is shown as supplied, on the background colour of its own file.
const partners = [
  ["Resilianta", "resilianta.webp", "#fcfbf4"], ["Medina Bridge", "medina-bridge.webp", "#faf7ed"], ["HospyQ", "hospyq.webp", "#fffbf3"],
  ["Attesora", "attesora.webp", "#f4ece3"], ["Procurazo", "procurazo.webp", "#fefefe"], ["Rootiva Herbal", "rootiva.webp", "#000000"],
  ["The Imam Collective", "imam-collective.webp", "#000000"], ["VelozTrade", "veloztrade.webp", "#010610"], ["Loadbyton", "loadbyton.svg", "#ffffff"],
];

/** Plain <img>: already-sized thumbnails, so the next/image client runtime is not needed. */
function Logo({ src, name }: { src: string; name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`${name} logo`} width={480} height={320} loading="lazy" decoding="async" />;
}

export default function Home() {
  return <main className="site">
    <SiteHeader />

    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">Technology company · Dubai</span>
          <h1 className="display">We teach, build and fix the way work gets done.</h1>
          <p className="lede">DigitalBurj brings practical education, product engineering and process improvement under one roof — so the skills people learn, the software we build and the operations we repair all pull in the same direction.</p>
          <div className="actions">
            <Link href="/get-started" className="btn btn-primary">Find your starting point <Arrow /></Link>
            <Link href="/connect/whatsapp" className="btn btn-secondary">Talk to our team</Link>
          </div>
        </div>
        <figure>
          <div className="figure figure-tall"><Scene k="homeHero" /></div>
          <figcaption className="caption">Named after the tallest tower in the world. We build the same way: foundations first.</figcaption>
        </figure>
      </div>
    </section>

    <section className="band-tight">
      <div className="wrap">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
          <span className="eyebrow" style={{ margin: 0 }}>Five divisions, one company</span>
          <Link href="/ecosystem" className="link small">How they connect <Arrow /></Link>
        </div>
        <nav className="index" aria-label="Divisions">
          {divisions.map((d, i) => <Link key={d.slug} href={`/${d.slug}`} style={{ "--a": d.hue[0] } as CSSProperties} data-reveal>
            <span className="n num">0{i + 1}</span><strong>{d.name}</strong><span className="d">{d.description}</span><Arrow />
          </Link>)}
        </nav>
      </div>
    </section>

    <section className="band band-sand">
      <div className="wrap split">
        <div data-reveal><span className="eyebrow">Why we exist</span><h2 className="h2">Most technology projects go wrong before anyone writes a line of code.</h2></div>
        <div className="prose lede" data-reveal>
          <p>They start with a tool instead of a problem. They automate a process nobody has looked at closely. They hire on a CV instead of evidence of what someone can actually do.</p>
          <p>We built DigitalBurj to work the other way round. Learn by doing real work. Build only what has earned it. Improve the process, measure it, and then automate it. Keep people in charge of the decisions that matter.</p>
          <p className="muted small">— The DigitalBurj team, Dubai</p>
        </div>
      </div>
    </section>

    {engines.map((e, i) => { const d = divisionBySlug[e.d]; return <section key={e.d} className="band band-rule" style={{ "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
      <div className="wrap split-even split engine" data-flip={i % 2 === 1 ? "" : undefined}>
        <div className="figure" data-reveal><Scene k={e.scene} /></div>
        <div data-reveal>
          <span className="accent-bar" aria-hidden="true" />
          <span className="eyebrow">{d.name}</span>
          <h2 className="h2">{e.title}</h2>
          <p className="lede" style={{ marginTop: 18 }}>{e.body}</p>
          <ol className="steps" style={{ marginTop: 28 }}>{e.flow.map((f, j) => <li key={f}><small className="num">Step {j + 1}</small><strong>{f}</strong></li>)}</ol>
          <div className="actions"><Link href={e.href} className="link">{e.cta} <Arrow /></Link></div>
        </div>
      </div>
    </section>; })}

    <section className="band band-rule">
      <div className="wrap">
        <div className="sec-head"><div data-reveal><span className="eyebrow">Connected to the work</span><h2 className="h2">Capability that is shown, not claimed.</h2></div><p className="sec-head-aside" data-reveal>Credentials earned in the Academy feed a profile the owner controls, and verified employers hire from it through a clear, structured process.</p></div>
        <div className="cols cols-2">
          {(["talent", "jobs"] as const).map(s => { const d = divisionBySlug[s]; return <Link key={s} href={`/${s}`} className="card card-accent" style={{ "--a": d.hue[0] } as CSSProperties} data-reveal>
            <div className="card-top"><Glyph name={s as GlyphName} tile size={40} /><Arrow /></div>
            <h3 className="h3">{d.name}</h3><p>{d.description}</p><p className="muted small" style={{ marginTop: 10 }}>{d.tagline}</p>
          </Link>; })}
        </div>
      </div>
    </section>

    <section className="band band-ink">
      <div className="wrap">
        <div className="sec-head"><div data-reveal><span className="eyebrow">Built on structure</span><h2 className="h2">The numbers behind the method.</h2></div><p className="sec-head-aside muted" data-reveal>Not vanity metrics — the building blocks every learner, client and team works with.</p></div>
        <div className="facts">
          {[[academyCourses.length, "Academy units in the catalogue"], [academyStages.length, "stages in every practical task"], [7, "kinds of operational leak we diagnose"], [4, "risk tiers that decide who approves automation"]].map(([n, l]) => <div key={l} data-reveal><strong className="num">{n}</strong><span>{l}</span></div>)}
        </div>
      </div>
    </section>

    <section className="band">
      <div className="wrap">
        <div className="sec-head"><div data-reveal><span className="eyebrow">How we decide</span><h2 className="h2">Three rules we do not bend.</h2></div></div>
        <div className="cols cols-3">
          {beliefs.map((b, i) => <div key={b.t} className="rule-col" data-reveal><span className="num muted small">0{i + 1}</span><h3 className="h3">{b.t}</h3><p>{b.d}</p></div>)}
        </div>
      </div>
    </section>

    <section className="band band-rule">
      <div className="wrap">
        <div className="sec-head"><div data-reveal><span className="eyebrow">Completed work</span><h2 className="h2">Brands we have helped put into the world.</h2></div><p className="sec-head-aside" data-reveal>Identities from completed projects and partnerships, shown as supplied.</p></div>
        <ul className="logos" style={{ padding: 0 }}>
          {partners.map(([name, file, bg]) => <li key={name} title={name} style={{ background: bg }}><Logo src={`/brand/partners/thumbs/${file}`} name={name} /></li>)}
        </ul>
      </div>
    </section>

    <ChannelRow title="Start in the way that suits you." />
    <SiteFooter />
  </main>;
}
