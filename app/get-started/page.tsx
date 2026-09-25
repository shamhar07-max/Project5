import { SiteHeader, SiteFooter } from "../site-shell";
import { PathFinder } from "./path-finder";
import { ChannelRow, PageHero, SectionHead } from "../_ui/sections";

export default function GetStarted() {
  return <main className="public-site">
    <SiteHeader />
    <PageHero kicker="Your path · DigitalBurj" title={<>Start with the <em>outcome you need.</em></>} intro="Three quick choices. We will point you to the right team and the channel you prefer — web, mobile or WhatsApp." image="getStartedHero" hue={["#e10613", "#f59e0b"]} />
    <section className="section tinted-sec">
      <div className="shell">
        <SectionHead index="01" kicker="Path finder" title={<>What brings <em>you here?</em></>}><p>Change your answers any time. Nothing is submitted until you choose to.</p></SectionHead>
        <div data-reveal="up"><PathFinder /></div>
      </div>
    </section>
    <ChannelRow />
    <SiteFooter />
  </main>;
}
