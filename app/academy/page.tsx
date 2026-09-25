import Link from "next/link";
import type { CSSProperties } from "react";
import { academyCourses, academyStages } from "../academy-data";
import { SiteHeader, SiteFooter } from "../site-shell";
import { divisionBySlug } from "../brand-data";
import { Scene } from "../_ui/scenes";
import { Arrow, ChannelRow, PageHero, SectionHead } from "../_ui/sections";

const d = divisionBySlug.academy;
const featuredCodes = ["DB-00", "DB-01", "DB-02", "DB-03", "DB-04", "PC-AD01", "PC-AC01", "PC-LG01"];
const featured = academyCourses.filter(c => featuredCodes.includes(c.code));
const directions = [
  { t: "Technology Academy", d: "Web development, backend systems, data and applied AI, taught through practical work.", hue: ["#2563eb", "#22d3ee"] as const, v: "circuit" as const },
  { t: "Professional Career Academy", d: "Accounting, administration, logistics and operations roles, practised in realistic scenarios.", hue: ["#0284c7", "#f59e0b"] as const, v: "wave" as const },
  { t: "Advanced Programs", d: "Focused programs for people ready to deepen a professional specialism.", hue: ["#1d4ed8", "#38bdf8"] as const, v: "orbit" as const },
  { t: "Academy for Business", d: "Role-based learning paths, rosters, capability gaps and manager reports for teams.", hue: ["#0369a1", "#14b8a6"] as const, v: "bars" as const },
];

const layers = [
  ["Knowledge check", "Confirm understanding"],
  ["Practical mission", "Apply the skill in a bounded scenario"],
  ["Project assessment", "Demonstrate integrated capability"],
  ["Human review", "A professional rubric and real feedback"],
  ["Independent verification", "Separate verification for high-value capability"],
];
const states = ["Not started", "In progress", "Submitted", "Under review", "Revision required", "Resubmitted", "Passed", "Verification pending", "Verified"];

export default function Academy() {
  return <main className="site" style={{ "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
    <SiteHeader />
    <PageHero kicker="DigitalBurj Academy" title={<>Learn it. Apply it. <em>Prove it.</em></>} intro="Choose a unit, do real practical work and get honest feedback on what you can actually do. The evidence stays in your own profile." scene="heroAcademy" hue={d.hue}>
      <Link href="/academy/catalogue" className="btn btn-primary">Explore the catalogue <Arrow /></Link>
      <Link href="/workspace/academy" className="btn btn-secondary">My learning</Link>
    </PageHero>

    <section className="band">
      <div className="wrap">
        <SectionHead kicker="Choose your direction" title="Four ways in."><p>Whether you are starting a career, deepening a specialism or training a whole team.</p></SectionHead>
        <div className="cols cols-4">
          {directions.map((x, i) => <Link key={x.t} href="/academy/catalogue" className="card card-accent" style={{ "--a": x.hue[0] } as CSSProperties} data-reveal>
            <span className="num muted small">0{i + 1}</span>
            <h3 className="h3" style={{ marginTop: 10 }}>{x.t}</h3><p>{x.d}</p>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="band band-ink">
      <div className="wrap">
        <SectionHead kicker="The mission model" title="The work is the lesson."><p>Every practical task moves through twelve stages, from the brief to evidence you can defend.</p><p style={{ marginTop: 12 }}><Link href="/academy/tools" className="link">Explore the tool library <Arrow /></Link></p></SectionHead>
        <ol className="steps steps-wrap">{academyStages.map((st, i) => <li key={st} data-reveal><small className="num">{String(i + 1).padStart(2, "0")}</small><strong>{st.charAt(0) + st.slice(1).toLowerCase()}</strong></li>)}</ol>
      </div>
    </section>

    <section className="band">
      <div className="wrap split-even split">
        <div className="figure figure-tall" data-reveal><Scene k="academyReview" /></div>
        <div data-reveal>
          <span className="eyebrow">Assessment model</span>
          <h2 className="h2">Evidence, layer by layer.</h2>
          <ol className="entries" style={{ marginTop: 28 }}>{layers.map(([t, sub], i) => <li key={t}><span className="n num">0{i + 1}</span><div><h3 className="h3">{t}</h3><p>{sub}</p></div></li>)}</ol>
        </div>
      </div>
    </section>

    <section className="band band-sand">
      <div className="wrap">
        <SectionHead kicker="The catalogue" title="Find your starting point."><Link href="/academy/catalogue" className="link">View all {academyCourses.length} units <Arrow /></Link></SectionHead>
        <div className="cols cols-4">
          {featured.map(c => <Link key={c.code} href={`/academy/catalogue?course=${c.code}`} className="card" data-reveal>
            <div className="card-top"><span className="small num" style={{ fontWeight: 600, color: "var(--red-text)" }}>{c.code}</span><span className="pill">{c.maturity}</span></div>
            <h3 className="h3">{c.title}</h3><p className="small muted" style={{ marginTop: 8 }}>{c.family} · Level {c.level.replace("L", "")} · {c.hours} hours</p>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="band">
      <div className="wrap split">
        <div data-reveal><span className="eyebrow">Assessment states</span><h2 className="h2">Honest progress.</h2><p className="lede" style={{ marginTop: 16 }}>A draft is not a credential. Every piece of work carries a visible state, and only an independent reviewer can mark it verified.</p></div>
        <div className="tags" data-reveal style={{ alignSelf: "center" }}>{states.map((st, i) => <span key={st} className={i === states.length - 1 ? "tag tag-on" : "tag"}>{st}</span>)}</div>
      </div>
    </section>

    <ChannelRow topic="academy" title="Start learning in the way that suits you." />
    <SiteFooter />
  </main>;
}
