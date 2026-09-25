import Link from "next/link";
import { SiteHeader, SiteFooter } from "../site-shell";
import { Glyph, type GlyphName } from "../_ui/glyphs";
import { Arrow, ChannelRow, PageHero, SectionHead } from "../_ui/sections";

export const metadata = { title: "DigitalBurj web app | One private workspace" };

const areas = [
  { label: "Enquiries", href: "/workspace/intake", t: "Send a Studio or Business AI brief", d: "Describe the problem, users, current state, desired outcome, budget and timeline. Your enquiry is stored against you or your organization.", g: "contact" as GlyphName },
  { label: "Engagements", href: "/workspace/engagements", t: "Turn an enquiry into a working brief", d: "Structured discovery entries, measured vs estimated baselines, a discovery request stage and a full event history.", g: "studio" as GlyphName },
  { label: "Academy", href: "/workspace/academy", t: "Save units and practise", d: "Save catalogue units, write practice drafts across the 12-stage task model and manage your learner profile and consent.", g: "academy" as GlyphName },
  { label: "Talent", href: "/workspace/talent", t: "A private capability profile", d: "Record self-reported evidence, clearly marked Declared and Private. Nothing can self-assign a verified status.", g: "talent" as GlyphName },
  { label: "Jobs", href: "/workspace/jobs", t: "Track your opportunities", d: "A personal tracker for roles you are pursuing, with status updates that stay private to you.", g: "jobs" as GlyphName },
  { label: "Organizations", href: "/workspace/organizations", t: "Work as a team", d: "Create an organization, invite members with roles and switch context before working on shared records.", g: "enterprise" as GlyphName },
  { label: "Files & messages", href: "/workspace/messages", t: "Documents and conversation", d: "Private document storage and organization messages, scoped to the context you are working in.", g: "docs" as GlyphName },
  { label: "Security", href: "/workspace/security", t: "See what happened, and who did it", d: "Server-side authorization on every record, organization boundaries and an activity log of allowed and denied actions.", g: "security" as GlyphName },
];

const steps = [
  ["Sign in", "One identity across every division."],
  ["Choose a context", "Work as an individual or inside an organization."],
  ["Start something", "An enquiry, a learning draft, a profile or a tracker."],
  ["Follow every step", "Stages, history and files stay together."],
];

export default function Platform() {
  return <main className="site">
    <SiteHeader />
    <PageHero kicker="DigitalBurj web app" title={<>One private workspace. <em>Every step visible.</em></>} intro="Enquiries, project briefs, Academy practice, capability evidence, job tracking, files and messages — kept private to you or your organization, in any browser." scene="cardStudio" hue={["#7c3aed", "#0f2233"]}>
      <Link href="/workspace" className="btn btn-primary">Open the workspace <Arrow /></Link>
      <Link href="/app" className="btn btn-secondary">Install on your phone</Link>
    </PageHero>
    <section className="band">
      <div className="wrap">
        <SectionHead kicker="Inside the workspace" title="Everything that is live today."><p>Each area below is working in the web app now.</p></SectionHead>
        <div className="cols cols-2">
          {areas.map(a => <Link key={a.label} href={a.href} className="card channel" data-reveal>
            <Glyph name={a.g} tile size={40} />
            <span><span className="eyebrow" style={{ marginBottom: 4 }}>{a.label}</span><strong className="h3" style={{ display: "block" }}>{a.t}</strong><span className="small muted">{a.d}</span></span>
            <Arrow />
          </Link>)}
        </div>
      </div>
    </section>
    <section className="band band-ink">
      <div className="wrap">
        <SectionHead kicker="How it works" title="Four steps to get going." />
        <ol className="steps" style={{ "--n": 4 } as React.CSSProperties}>{steps.map(([t, d], i) => <li key={t} data-reveal><small className="num">Step {i + 1}</small><strong>{t}</strong><span className="small" style={{ color: "#aab7c3" }}>{d}</span></li>)}</ol>
      </div>
    </section>
    <ChannelRow title="Prefer to start somewhere else?" />
    <SiteFooter />
  </main>;
}
