import Link from "next/link";
import { SiteHeader, SiteFooter } from "../site-shell";
import { ChannelRow, SectionHead } from "../_ui/sections";
import { InstallPanel } from "./install";

export const metadata = { title: "DigitalBurj mobile app | Install on your phone" };

const features = [
  ["One tap from your home screen", "Opens full screen like a native app, with the DigitalBurj icon."],
  ["Shortcuts that matter", "Long-press the icon for My learning, Start a project, WhatsApp and Workspace."],
  ["Same account everywhere", "Your workspace, enquiries and Academy drafts are identical on web and phone."],
  ["Works when the signal drops", "If your connection goes, you see a clear offline page instead of a browser error."],
  ["WhatsApp built in", "Write a routed first message and hand it straight to WhatsApp."],
  ["No spam, no tracking SDKs", "Push notifications are off. We will ask before we ever add them."],
];

export default function MobileApp() {
  return <main className="site">
    <SiteHeader />
    <section className="page-hero">
      <div className="wrap page-hero-grid">
        <div>
          <span className="accent-bar" aria-hidden="true" />
          <span className="eyebrow">DigitalBurj mobile app</span>
          <h1 className="h1">Your progress, <em>in your pocket.</em></h1>
          <p className="lede">Install DigitalBurj on Android, iPhone or desktop in seconds, without an app store. It is the same secure workspace, sized for your thumb.</p>
          <InstallPanel />
          <p className="small muted" style={{ marginTop: 16 }}>DigitalBurj is an installable web app. App Store and Google Play listings are not published yet.</p>
        </div>
        <div className="phone" aria-hidden="true">
          <div className="phone-screen phone-app">
            <div className="pa-top"><strong>Good evening</strong><span className="sc-avatar">LH</span></div>
            <div className="pa-card"><small>Continue learning</small><b>DB-03 · Backend, APIs &amp; Databases</b><i><em style={{ width: "58%" }} /></i></div>
            <div className="pa-card"><small>Studio brief</small><b>Clinic booking app</b><span className="pill pill-ok">Discovery requested</span></div>
            <div className="pa-card"><small>Credentials</small><b>1 verified · 2 assessed</b></div>
            <nav className="pa-tabs"><span className="on">Home</span><span>Learn</span><span>Work</span><span>Me</span></nav>
          </div>
        </div>
      </div>
    </section>
    <section className="band">
      <div className="wrap">
        <SectionHead kicker="Why install" title="Built for the phone in your hand."><Link href="/connect/whatsapp" className="link">Try the WhatsApp flow →</Link></SectionHead>
        <div className="cols cols-3">{features.map(([t, d]) => <div key={t} className="rule-col" data-reveal><h3 className="h3">{t}</h3><p>{d}</p></div>)}</div>
      </div>
    </section>
    <ChannelRow title="Prefer another way in?" />
    <SiteFooter />
  </main>;
}
