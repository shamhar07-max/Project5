import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { BrandMark, markForTitle } from "./_ui/brand-mark";
import { SiteHeader, SiteFooter } from "./site-shell";
import type { SceneKey } from "./brand-data";
import { ChannelRow, PageHero, SectionHead } from "./_ui/sections";

type Section = { title: string; body: string; href?: string };
/** Shared template for company and resource pages. Each page passes its own scene. */
export function PublicPage({ eyebrow, title, intro, sections, scene, hue = ["#e10613", "#8b5cf6"], lead, children }: { eyebrow: string; title: ReactNode; intro: string; sections: Section[]; scene?: SceneKey; hue?: [string, string]; lead?: ReactNode; children?: ReactNode }) {
  return <main className="public-site" style={{ "--a": hue[0], "--b": hue[1] } as CSSProperties}>
    <SiteHeader />
    <PageHero kicker={`DigitalBurj / ${eyebrow}`} title={title} intro={intro} scene={scene} hue={hue} />
    <section className="section tinted-sec">
      <div className="shell">
        <SectionHead index="01" kicker={`Explore · ${eyebrow}`} title={lead || <>What you <em>need to know.</em></>} />
        <div className="gcard-grid">
          {sections.map((s, i) => {
            const inner = <>
              <div className="gcard-index"><BrandMark name={markForTitle(s.title)} className="gcard-mark" /><span>{String(i + 1).padStart(2, "0")}</span></div>
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
