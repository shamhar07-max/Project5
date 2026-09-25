import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { SiteHeader, SiteFooter } from "./site-shell";
import type { SceneKey } from "./brand-data";
import { Arrow, ChannelRow, PageHero } from "./_ui/sections";

type Section = { title: string; body: string; href?: string };

/** Shared template for company and resource pages: hero, then an editorial ruled list. */
export function PublicPage({ eyebrow, title, intro, sections, scene, hue = ["#e10613", "#0f2233"], lead, children }: { eyebrow: string; title: ReactNode; intro: string; sections: Section[]; scene?: SceneKey; hue?: [string, string]; lead?: ReactNode; children?: ReactNode }) {
  return <main className="site" style={{ "--a": hue[0], "--b": hue[1] } as CSSProperties}>
    <SiteHeader />
    <PageHero kicker={eyebrow} title={title} intro={intro} scene={scene} hue={hue} />
    <section className="band">
      <div className="wrap split">
        <div data-reveal><span className="eyebrow">In brief</span><h2 className="h2">{lead || "What you need to know."}</h2></div>
        <ol className="entries">
          {sections.map((s, i) => <li key={s.title} data-reveal>
            <span className="n num">{String(i + 1).padStart(2, "0")}</span>
            <div><h3 className="h3">{s.title}</h3><p>{s.body}</p>{s.href && <Link href={s.href} className="link">Continue <Arrow /></Link>}</div>
          </li>)}
        </ol>
      </div>
    </section>
    {children}
    <ChannelRow />
    <SiteFooter />
  </main>;
}
