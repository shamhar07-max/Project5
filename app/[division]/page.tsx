import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter } from "../site-shell";
import { divisionBySlug, type DivisionSlug, type SceneKey } from "../brand-data";
import { Arrow, ChannelRow, PageHero, SectionHead } from "../_ui/sections";

type Content = {
  hero: SceneKey; title: [string, string]; intro: string;
  position: string; signature: string; output: string;
  services: { t: string; d: string }[];
  flow: string[];
  states?: { k: string; d: string }[]; statesTitle?: string;
  models: string[];
  cta: string; href: string; note?: string;
};

const content: Record<Exclude<DivisionSlug, "academy">, Content> = {
  studio: {
    hero: "heroStudio", title: ["Build what", "deserves to exist."],
    intro: "Bring us the idea and the problem behind it. We will test the assumptions, agree on a useful scope, then design, build and support the product.",
    position: "Validation-first product engineering, not commodity development.", signature: "BUILD / RESHAPE / STOP", output: "Validated products, production software, architecture and measured delivery.",
    services: [
      { t: "Discovery & validation", d: "Problem definition, users, market signals, assumptions, feasibility and a clear decision." },
      { t: "Product strategy", d: "Value proposition, MVP, prioritization, success metrics, roadmap and risk." },
      { t: "Product design", d: "Research, information architecture, flows, UI, design systems and prototypes." },
      { t: "Software engineering", d: "SaaS, web, mobile, enterprise portals, marketplaces and internal systems." },
      { t: "AI product engineering", d: "AI search, assistants, document intelligence, recommendations and copilots." },
      { t: "Architecture & integrations", d: "System, database, API, cloud, identity, payment and legacy integration." },
      { t: "Quality & maintenance", d: "Functional, regression, performance, security and accessibility testing; monitoring and upkeep." },
    ],
    flow: ["Enquiry", "Qualification", "Discovery", "Validation", "Feasibility", "Decision", "Scope", "Design", "Engineering", "QA", "Deployment", "Measurement"],
    statesTitle: "The validation decision", states: [
      { k: "BUILD", d: "Evidence supports proceeding; define scope and commercial terms." },
      { k: "RESHAPE", d: "The opportunity exists, but scope, positioning or implementation should change." },
      { k: "STOP", d: "Evidence does not justify a broader build at this time." },
    ],
    models: ["Discovery fee", "Fixed project", "Milestone billing", "Time & materials", "Dedicated team", "Monthly retainer", "Maintenance / SLA"],
    cta: "Start a project enquiry", href: "/workspace/intake?service=studio",
  },
  business: {
    hero: "heroBusiness", title: ["Fix the process.", "Then automate it."],
    intro: "We start by watching how the work gets done. Then we measure delays and errors, simplify the process and automate the steps that benefit from it.",
    position: "Business transformation using systems, automation and AI.", signature: "Technology is not the starting point; the operation is.", output: "Redesigned workflows, controlled automation and measured improvement.",
    services: [
      { t: "Operational diagnosis", d: "Process mapping, bottlenecks, cost, time and error analysis, root cause." },
      { t: "Process improvement", d: "Remove, simplify, standardize, assign ownership and define controls." },
      { t: "Workflow automation", d: "Rules, integrations, orchestration, exception handling and monitoring." },
      { t: "AI integration", d: "Assistants, extraction, classification, summarization and decision support." },
      { t: "CRM / ERP / systems", d: "Process fit, configuration, integration, data flows and reporting." },
      { t: "Data & reporting", d: "Baseline metrics, dashboards, management reporting and alerts." },
      { t: "Continuous optimization", d: "Managed automation, measurement, evaluation and an improvement backlog." },
    ],
    flow: ["Enquiry", "Observe", "Diagnose", "Baseline", "Measure loss", "Redesign", "Approve", "Implement", "Verify", "Deploy", "Measure", "Improve"],
    statesTitle: "Human control by risk", states: [
      { k: "LOW", d: "Automatic where policy allows." },
      { k: "MEDIUM", d: "Automatic with strong logging and monitoring." },
      { k: "HIGH", d: "Human approval required." },
      { k: "CRITICAL", d: "No autonomous execution; a controlled human process." },
    ],
    models: ["Consultation", "Operational diagnostic", "Transformation project", "Automation implementation", "AI integration", "Managed automation", "Optimization retainer"],
    cta: "Request a consultation", href: "/workspace/intake?service=business", note: "Consequential automation always keeps a human in control.",
  },
  talent: {
    hero: "heroTalent", title: ["Capability you can see.", "Evidence you can trust."],
    intro: "Show the work behind your skills. Your profile separates what you have listed, what has been assessed and what has been independently verified. You control its visibility.",
    position: "Evidence-backed professional capability platform.", signature: "Declared ≠ assessed ≠ verified.", output: "A Capability Passport with evidence, projects, assessments and verification history.",
    services: [
      { t: "Professional profile", d: "Experience, education, specialization and availability in one place." },
      { t: "Skills & projects", d: "Practical work with its role and context, not just keywords." },
      { t: "Evidence records", d: "Artifacts linked to assessments, with visibility you control." },
      { t: "Capability Passport", d: "Identity, skills, verified capabilities and verification history." },
      { t: "Privacy centre", d: "Profile, search, contact, evidence and employer access — each switchable." },
      { t: "Employer discovery", d: "Search and shortlists for verified organizations, with consent." },
    ],
    flow: ["Evidence submitted", "Identity check", "Evidence review", "Assessment", "Verifier decision", "Verified"],
    statesTitle: "Capability states", states: [
      { k: "DECLARED", d: "Self-reported by the professional." },
      { k: "ASSESSED", d: "Evaluated through an assessment." },
      { k: "VERIFIED", d: "An authorized verification confirms the evidence." },
      { k: "EXPIRED", d: "Previously valid evidence is no longer current." },
    ],
    models: ["Free profile", "Assessment requests", "Employer search", "Verification services"],
    cta: "Open Talent workspace", href: "/workspace/talent", note: "Academy and client work never becomes public evidence automatically.",
  },
  jobs: {
    hero: "heroJobs", title: ["More than applications.", "Better hiring decisions."],
    intro: "Find open roles, track each application and choose which evidence to share. Employers can review candidates through a clear process.",
    position: "Structured recruitment platform.", signature: "Academy participation is not required to apply.", output: "Transparent applications, reviews, interviews and outcomes.",
    services: [
      { t: "Find opportunities", d: "Listings organized by category and company." },
      { t: "Track applications", d: "Every application and status in your own tracker." },
      { t: "Share capability", d: "Optionally attach your Capability Passport to an application." },
      { t: "Employer recruitment", d: "Publish roles, review, shortlist and assess with consent." },
      { t: "Interviews & offers", d: "Structured stages from interview to offer or decision." },
      { t: "Career resources", d: "Guidance on preparing, applying and interviewing." },
    ],
    flow: ["Publish", "Apply", "Review", "Shortlist", "Assessment", "Interview", "Offer", "Hire"],
    models: ["Candidate access", "Employer listings", "Recruitment services", "Assessment add-ons"],
    cta: "Open Jobs workspace", href: "/workspace/jobs", note: "Hiring decisions remain with employers. DigitalBurj does not guarantee jobs or visas.",
  },
};

export default async function DivisionPage({ params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const c = content[division as keyof typeof content];
  if (!c) notFound();
  const d = divisionBySlug[division as DivisionSlug];
  const accent = { "--a": d.hue[0], "--b": d.hue[1] } as CSSProperties;
  return <main className="site" style={accent}>
    <SiteHeader />
    <PageHero kicker={`DigitalBurj ${d.name}`} title={<>{c.title[0]} <em>{c.title[1]}</em></>} intro={c.intro} scene={c.hero} hue={d.hue}>
      <Link href={c.href} className="btn btn-primary">{c.cta} <Arrow /></Link>
      <Link href={`/connect/whatsapp?topic=${division}`} className="btn btn-secondary">Ask on WhatsApp</Link>
    </PageHero>

    <section className="band-tight band-rule">
      <div className="wrap">
        <dl className="cols cols-3 pillars">
          {[["Our position", c.position], ["What makes it different", c.signature], ["What you leave with", c.output]].map(([k, v]) => <div key={k} className="rule-col" data-reveal><dt className="eyebrow">{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </div>
    </section>

    <section className="band band-sand">
      <div className="wrap split">
        <div data-reveal><span className="eyebrow">What we do</span><h2 className="h2">Built around the problem you actually have.</h2><p className="muted" style={{ marginTop: 16 }}>Start with the service closest to your need. We bring in other specialists when the work calls for it.</p></div>
        <ol className="entries">{c.services.map((sv, i) => <li key={sv.t} data-reveal><span className="n num">{String(i + 1).padStart(2, "0")}</span><div><h3 className="h3">{sv.t}</h3><p>{sv.d}</p></div></li>)}</ol>
      </div>
    </section>

    <section className="band band-ink">
      <div className="wrap">
        <SectionHead kicker="How the work runs" title="From first question to outcome."><p>Each step has a clear owner and a clear decision before the next one starts.</p></SectionHead>
        <ol className="steps steps-wrap">{c.flow.map((f, i) => <li key={f} data-reveal><small className="num">Step {i + 1}</small><strong>{f}</strong></li>)}</ol>
      </div>
    </section>

    {c.states && <section className="band">
      <div className="wrap">
        <SectionHead kicker={c.statesTitle || "Statuses"} title="What each status means." />
        <div className="cols cols-3">{c.states.map(st => <div key={st.k} className="card" data-reveal><h3 className="h3">{st.k}</h3><p>{st.d}</p></div>)}</div>
        {c.note && <p className="note" style={{ marginTop: 28 }}><ShieldCheck size={18} aria-hidden="true" /> {c.note}</p>}
      </div>
    </section>}
    {!c.states && c.note && <section className="band-tight"><div className="wrap"><p className="note"><ShieldCheck size={18} aria-hidden="true" /> {c.note}</p></div></section>}

    <section className="band band-rule">
      <div className="wrap split">
        <div data-reveal><span className="eyebrow">Ways to work together</span><h2 className="h2">Pick the arrangement that fits.</h2></div>
        <div data-reveal>
          <div className="tags">{c.models.map(m => <span key={m} className="tag">{m}</span>)}</div>
          <p style={{ marginTop: 24 }}><Link href="/get-started" className="link">Not sure which? Find your starting point <Arrow /></Link></p>
        </div>
      </div>
    </section>

    <ChannelRow topic={division} title={`Talk to ${d.name} in the way that suits you.`} />
    <SiteFooter />
  </main>;
}
