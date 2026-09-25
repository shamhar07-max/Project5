import { SiteHeader, SiteFooter } from "../site-shell";
import { PathFinder } from "./path-finder";
import { HeroCarousel } from "../hero-carousel";
export default function GetStarted(){
  return <main className="public-site"><SiteHeader/><section className="page-hero path-hero"><HeroCarousel frames={[{src:"/brand/collaboration.jpg",label:"Grow together"},{src:"/brand/hero-digitalburj-v2.webp",label:"Find your path"}]}/><div className="shell page-hero-content"><span className="eyebrow eyebrow-light">Your path / DigitalBurj</span><h1>Start with what<br/><span className="serif-accent">matters to you.</span></h1><p>Choose a goal. We&apos;ll take you to the right place to explore or tell us what you need.</p></div></section><PathFinder/><SiteFooter/></main>;
}
