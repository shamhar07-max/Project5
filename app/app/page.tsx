import type { CSSProperties } from "react";
import { BellOff, Fingerprint, Layers, MessageCircle, Smartphone, WifiOff, Zap } from "lucide-react";
import { SiteHeader, SiteFooter } from "../site-shell";
import { Aurora, ChannelRow, SectionHead } from "../_ui/sections";
import { MagneticLink } from "../_ui/magnetic";
import { AppShowcase } from "./app-showcase";
import { InstallPanel } from "./install";

export const metadata = { title: "DigitalBurj mobile app | Install on your phone" };

const features = [
  { Icon: Zap, t: "One tap from your home screen", d: "Launches full screen like a native app, with the DigitalBurj icon and splash." },
  { Icon: Layers, t: "Shortcuts that matter", d: "Long-press the icon for My learning, Start a project, WhatsApp and Workspace." },
  { Icon: Fingerprint, t: "Same account everywhere", d: "Your workspace, enquiries and Academy drafts are identical on web and phone." },
  { Icon: WifiOff, t: "Graceful offline", d: "If your connection drops, you get a clear offline screen instead of a browser error." },
  { Icon: MessageCircle, t: "WhatsApp built in", d: "Compose a routed first message and hand it straight to WhatsApp." },
  { Icon: BellOff, t: "No spam, no tracking SDKs", d: "Push notifications are not enabled. We will ask before we ever add them." },
];

export default function MobileApp() {
  return <main className="public-site">
    <SiteHeader />
    <section className="app-hero dark-sec">
      <Aurora hue={["#8b5cf6", "#ec4899"]} third="#2563eb" />
      <div className="shell app-hero-grid">
        <div>
          <span className="kicker kicker-glass"><i className="pulse" />DigitalBurj mobile app</span>
          <h1 className="hero-title" style={{ "--a": "#c4b5fd", "--b": "#f9a8d4" } as CSSProperties}>Your progress, <em>in your pocket.</em></h1>
          <p className="hero-lede">Install DigitalBurj on Android, iPhone or desktop in seconds — no app store download. It is the same secure workspace, designed for the thumb.</p>
          <InstallPanel />
          <p className="app-honest"><Smartphone size={15} /> DigitalBurj is an installable web app (PWA). Native App Store and Google Play listings are not published yet.</p>
        </div>
        <AppShowcase />
      </div>
    </section>
    <section className="section tinted-sec" style={{ "--a": "#8b5cf6", "--b": "#ec4899" } as CSSProperties}>
      <div className="shell">
        <SectionHead index="01" kicker="Why install" title={<>Designed for <em>the thumb.</em></>}><MagneticLink href="/connect/whatsapp">Try the WhatsApp flow</MagneticLink></SectionHead>
        <div className="feature-grid">
          {features.map((f, i) => <div key={f.t} className="feature" data-spotlight data-reveal="up" style={{ "--i": i % 3 } as CSSProperties}><span className="feature-ico"><f.Icon size={20} /></span><h3>{f.t}</h3><p>{f.d}</p></div>)}
        </div>
      </div>
    </section>
    <ChannelRow title="Prefer another channel?" />
    <SiteFooter />
  </main>;
}
