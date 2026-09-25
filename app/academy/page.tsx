import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, BookOpenCheck, BriefcaseBusiness, Building2, Code2, GraduationCap } from "lucide-react";
import { academyCourses, academyStages } from "../academy-data";
import { BrandMark } from "../_ui/brand-mark";
import { SiteHeader, SiteFooter } from "../site-shell";
import { divisionBySlug, media } from "../brand-data";
import { MagneticLink } from "../_ui/magnetic";
import { ChannelRow, PageHero, SectionHead } from "../_ui/sections";

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
  return <main className="public-site" style={{ "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties}>
    <SiteHeader />
    <PageHero kicker={`DigitalBurj Academy · ${d.domain}`} title={<>Learn it. Apply it. <em>Prove it.</em></>} intro="Choose a unit, complete practical work and get feedback on what you can actually do. Keep the resulting evidence in your own profile." image="heroAcademy" hue={d.hue}>
      <MagneticLink href="/academy/catalogue">Explore the catalogue</MagneticLink>
      <MagneticLink href="/workspace/academy" variant="glass">My learning</MagneticLink>
    </PageHero>

    <section className="section">
      <div className="shell">
        <SectionHead index="01" kicker="Choose your direction" title={<>Four ways <em>in.</em></>}><p>Whether you are starting a career, deepening a specialism or training a whole team.</p></SectionHead>
        <div className="directions">
          {directions.map((x, i) => { return <Link key={x.t} href="/academy/catalogue" className="direction" data-reveal="up" style={{ "--i": i, "--a": x.hue[0], "--b": x.hue[1] } as CSSProperties}>
            <BrandMark name={(["studio", "jobs", "academy", "business"] as const)[i]} className="direction-mark" />
            <span className="direction-n">0{i + 1}</span>
            <strong>{x.t}</strong><small>{x.d}</small>
            <span className="orb"><ArrowUpRight size={18} /></span>
          </Link>; })}
        </div>
      </div>
    </section>

    <section className="section dark-sec">
      <div className="shell">
        <SectionHead light index="02" kicker="The mission model" title={<>The work is <em>the lesson.</em></>}><p>Every practical task moves through twelve stages — from the brief to evidence you can defend.</p><Link href="/academy/tools" className="link-arrow">Explore the tool library <ArrowUpRight size={16} /></Link></SectionHead>
        <ol className="stage-rail">
          {academyStages.map((s, i) => <li key={s} data-reveal="up" style={{ "--i": i % 6, "--h": `${200 + i * 3}` } as CSSProperties}><span>{String(i + 1).padStart(2, "0")}</span><strong>{s}</strong></li>)}
        </ol>
      </div>
    </section>

    <section className="split-feature">
      <div className="split-photo" style={{ backgroundImage: `url('${media.academySpace}')` }} role="img" aria-label="Illustrative scene of learners discussing practical work" data-reveal="image" />
      <div className="split-copy">
        <span className="kicker" data-reveal="up"><b>03</b>Assessment model</span>
        <h2 className="display" data-reveal="up">Evidence, <em>layer by layer.</em></h2>
        <ol className="layers">{layers.map(([t, s], i) => <li key={t} data-reveal="left" style={{ "--i": i } as CSSProperties}><span>{i + 1}</span><div><strong>{t}</strong><small>{s}</small></div></li>)}</ol>
      </div>
    </section>

    <section className="section tinted-sec">
      <div className="shell">
        <SectionHead index="04" kicker="The catalogue" title={<>Find your <em>starting point.</em></>}><Link href="/academy/catalogue" className="link-arrow">View all {academyCourses.length} units <ArrowUpRight size={16} /></Link></SectionHead>
        <div className="course-grid">
          {featured.map((c, i) => <Link key={c.code} href={`/academy/catalogue?course=${c.code}`} className="gcard course" data-spotlight data-reveal="up" style={{ "--i": i % 4 } as CSSProperties}>
            <div className="gcard-index"><BrandMark name="academy" className="gcard-mark" /><span>{c.code}</span></div>
            <div className="gcard-body"><h3>{c.title}</h3><p>{c.family} · Level {c.level.replace("L", "")} · {c.hours} proposed hours</p><span className={`maturity m-${c.maturity.toLowerCase()}`}>{c.maturity}</span></div>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="shell mosaic">
        <div className="mosaic-copy" data-reveal="up">
          <span className="kicker"><b>05</b>Assessment states</span>
          <h2 className="display">Honest <em>progress.</em></h2>
          <p>A draft is not a credential. Every piece of work carries a visible state, and only an independent process can mark it verified.</p>
          <div className="state-chips">{states.map((s, i) => <span key={s} className={i === states.length - 1 ? "on" : ""}>{s}</span>)}</div>
        </div>
      </div>
    </section>

    <ChannelRow topic="academy" title="Start learning on the channel that suits you." />
    <SiteFooter />
  </main>;
}
