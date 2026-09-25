import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "./site-shell";
import type { MediaKey } from "./brand-data";
import { ChannelRow, PageHero, SectionHead } from "./_ui/sections";
import { GenArt } from "./gen-art";

type Section = { title: string; body: string; href?: string };
type Art = { seed: string; variant: "mesh" | "orbit" | "circuit" | "bars" | "wave" };
const variants = ["mesh", "circuit", "wave", "orbit", "bars"] as const;

/** Shared template for company and resource pages. Each page passes its own photo or artwork. */
export function PublicPage({ eyebrow, title, intro, sections, image, art, hue = ["#e10613", "#8b5cf6"], lead, children }: { eyebrow: string; title: ReactNode; intro: string; sections: Section[]; image?: MediaKey; art?: Art; hue?: [string, string]; lead?: ReactNode; children?: ReactNode }) {
  const seed = eyebrow.toLowerCase().replace(/\W+/g, "-");
  return <main className="public-site" style={{ "--a": hue[0], "--b": hue[1] } as CSSProperties}>
    <SiteHeader />
    <PageHero kicker={`DigitalBurj / ${eyebrow}`} title={title} intro={intro} image={image} art={art} hue={hue} />
    <section className="section tinted-sec">
      <div className="shell">
        <SectionHead index="01" kicker={`Explore · ${eyebrow}`} title={lead || <>What you <em>need to know.</em></>} />
        <div className="gcard-grid">
          {sections.map((s, i) => {
            const inner = <>
              <div className="gcard-art"><GenArt seed={`${seed}-${i}`} variant={variants[(i + seed.length) % 5]} hue={i % 2 ? [hue[1], hue[0]] : hue} /><span>{String(i + 1).padStart(2, "0")}</span></div>
              <div className="gcard-body"><h3>{s.title}</h3><p>{s.body}</p>{s.href && <span className="link-arrow">Explore <ArrowUpRight size={16} /></span>}</div>
            </>;
            const props = { className: "gcard", "data-spotlight": true, "data-reveal": "up", style: { "--i": i % 3 } as CSSProperties };
            return s.href ? <Link key={s.title} href={s.href} {...props}>{inner}</Link> : <article key={s.title} {...props}>{inner}</article>;
          })}
        </div>
      </div>
    </section>
    {children}
    <ChannelRow />
    <SiteFooter />
  </main>;
}
