import Link from "next/link";
import { SiteHeader, SiteFooter } from "./site-shell";
import { HeroCarousel } from "./hero-carousel";

export function PublicPage({eyebrow,title,intro,sections}:{eyebrow:string;title:string;intro:string;sections:{title:string;body:string;href?:string}[]}) {
  const image = eyebrow==="Technology"?"/brand/studio.jpg":eyebrow==="Company"?"/brand/reception.jpg":eyebrow==="Ecosystem"?"/brand/collaboration.jpg":"/brand/strategy.jpg";
  return <main className="public-site"><SiteHeader/><section className="page-hero"><HeroCarousel frames={[{src:image,label:eyebrow},{src:"/brand/hero-digitalburj-v2.webp",label:"DigitalBurj"}]}/><div className="shell page-hero-content"><span className="eyebrow eyebrow-light">DigitalBurj / {eyebrow}</span><h1>{title}</h1><p>{intro}</p></div></section><section className="shell section-pad"><span className="eyebrow">Explore / {eyebrow}</span><div className="editorial-grid mt-10">{sections.map((s,i)=><article key={s.title} className="editorial-card"><span className="eyebrow">0{i+1}</span><h2 className="mt-8">{s.title}</h2><p>{s.body}</p>{s.href && <Link href={s.href}>Explore →</Link>}</article>)}</div></section><SiteFooter/></main>;
}
