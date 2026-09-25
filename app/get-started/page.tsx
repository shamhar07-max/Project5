import { SiteHeader, SiteFooter } from "../site-shell";
import { PathFinder } from "./path-finder";
import { ChannelRow, PageHero } from "../_ui/sections";

export default function GetStarted() {
  return <main className="site">
    <SiteHeader />
    <PageHero kicker="Your path · DigitalBurj" title={<>Start with the <em>outcome you need.</em></>} intro="Three quick questions. We will point you to the right team and the way you prefer to talk — web, mobile or WhatsApp." scene="getStartedHero" hue={["#e10613", "#f59e0b"]} />
    <section className="band-tight">
      <div className="wrap">
        <PathFinder />
        <p className="small muted" style={{ marginTop: 14 }}>Change your answers any time. Nothing is sent until you choose to continue.</p>
      </div>
    </section>
    <ChannelRow />
    <SiteFooter />
  </main>;
}
