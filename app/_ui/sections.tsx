import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Glyph } from "./glyphs";
import type { SceneKey } from "../brand-data";
import { Scene } from "./scenes";

/** Section heading: eyebrow, serif title and an optional aside. (`index` is kept for older callers.) */
export function SectionHead({ kicker, title, children, align = "split" }: { index?: string; kicker: string; title: ReactNode; children?: ReactNode; light?: boolean; align?: "split" | "center" }) {
  return <div className={`sec-head ${align === "center" ? "sec-head-center" : ""}`}>
    <div data-reveal><span className="eyebrow">{kicker}</span><h2 className="h2">{title}</h2></div>
    {children && <div className="sec-head-aside" data-reveal>{children}</div>}
  </div>;
}

/** Page hero: eyebrow, serif title, lede, actions and, when given, one authored scene. */
export function PageHero({ kicker, title, intro, scene, hue, children }: { kicker: string; title: ReactNode; intro: string; scene?: SceneKey; hue?: readonly [string, string]; children?: ReactNode }) {
  return <section className="page-hero" style={hue ? { "--a": hue[0], "--b": hue[1] } as CSSProperties : undefined}>
    <div className={`wrap page-hero-grid ${scene ? "" : "solo"}`}>
      <div>
        <span className="accent-bar" aria-hidden="true" />
        <span className="eyebrow">{kicker}</span>
        <h1 className="h1">{title}</h1>
        <p className="lede">{intro}</p>
        {children && <div className="actions">{children}</div>}
      </div>
      {scene && <div className="figure"><Scene k={scene} /></div>}
    </div>
  </section>;
}

/** Web app, mobile app and WhatsApp — the three ways in, offered at the end of most pages. */
export function ChannelRow({ topic, title = "Continue in the way that suits you." }: { topic?: string; title?: string }) {
  const q = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  const items = [
    { href: "/platform", label: "Web app", note: "A private workspace for every enquiry, course and file.", g: "web" as const },
    { href: "/app", label: "Mobile app", note: "Install DigitalBurj on your phone in a few seconds.", g: "mobile" as const },
    { href: `/connect/whatsapp${q}`, label: "WhatsApp", note: "Write a short first message and we reply in working hours.", g: "whatsapp" as const },
  ];
  return <section className="band band-rule">
    <div className="wrap">
      <h2 className="h2" data-reveal style={{ marginBottom: 28 }}>{title}</h2>
      <div className="cols cols-3">
        {items.map(i => <Link key={i.label} href={i.href} className="card channel" data-reveal>
          <Glyph name={i.g} tile size={40} />
          <span><strong className="h3" style={{ display: "block" }}>{i.label}</strong><span className="muted small">{i.note}</span></span>
          <ArrowRight size={18} className="arr" aria-hidden="true" />
        </Link>)}
      </div>
    </div>
  </section>;
}

export function Arrow() {
  return <ArrowRight size={17} className="arr" aria-hidden="true" />;
}
