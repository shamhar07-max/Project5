import type { CSSProperties } from "react";
import { SiteHeader, SiteFooter } from "../site-shell";
import { ChannelRow, PageHero, SectionHead } from "../_ui/sections";
import { MagneticLink } from "../_ui/magnetic";
import { WorkspaceTour } from "./workspace-tour";

export const metadata = { title: "DigitalBurj web app | One private workspace" };

const steps = [
  ["Sign in", "One identity across every division."],
  ["Choose a context", "Work as an individual or inside an organization."],
  ["Start something", "An enquiry, a learning draft, a profile or a tracker."],
  ["Follow every step", "Stages, history and files stay together."],
];

export default function Platform() {
  return <main className="public-site" style={{ "--a": "#2563eb", "--b": "#22d3ee" } as CSSProperties}>
    <SiteHeader />
    <PageHero kicker="DigitalBurj web app · app.digitalburj.com" title={<>One private workspace. <em>Every step visible.</em></>} intro="Enquiries, engagement briefs, Academy practice, capability evidence, job tracking, files and messages — scoped to you or your organization, in any browser." hue={["#2563eb", "#22d3ee"]}>
      <MagneticLink href="/workspace">Open the workspace</MagneticLink>
      <MagneticLink href="/app" variant="glass">Install on your phone</MagneticLink>
    </PageHero>
    <section className="section tinted-sec">
      <div className="shell">
        <SectionHead index="01" kicker="Tour the workspace" title={<>Everything that exists <em>today.</em></>}><p>Each area below is live in the web app. The screens are simplified illustrations of it.</p></SectionHead>
        <div data-reveal="up"><WorkspaceTour /></div>
      </div>
    </section>
    <section className="section dark-sec">
      <div className="shell">
        <SectionHead light index="02" kicker="How it works" title={<>Four steps to <em>momentum.</em></>} />
        <ol className="timeline four">{steps.map(([t, d], i) => <li key={t} data-reveal="up" style={{ "--i": i } as CSSProperties}><span>{String(i + 1).padStart(2, "0")}</span><strong>{t}</strong><small>{d}</small></li>)}</ol>
      </div>
    </section>
    <ChannelRow title="Prefer to start somewhere else?" />
    <SiteFooter />
  </main>;
}
