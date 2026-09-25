import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight, MessageCircle, MonitorSmartphone, Smartphone } from "lucide-react";
import { media, type MediaKey } from "../brand-data";
import { GenArt } from "../gen-art";

export function Aurora({ hue = ["#e10613", "#2563eb"], third = "#8b5cf6" }: { hue?: readonly [string, string]; third?: string }) {
  return <div className="aurora" aria-hidden="true" style={{ "--a1": hue[0], "--a2": hue[1], "--a3": third } as CSSProperties}><i /><i /><i /><span className="grid-lines" /></div>;
}

export function SectionHead({ index, kicker, title, children, light = false, align = "split" }: { index: string; kicker: string; title: ReactNode; children?: ReactNode; light?: boolean; align?: "split" | "center" }) {
  return <div className={`sec-head sec-head-${align} ${light ? "on-dark" : ""}`}>
    <div data-reveal="up">
      <span className="kicker"><b>{index}</b>{kicker}</span>
      <h2 className="display">{title}</h2>
    </div>
    {children && <div className="sec-head-aside" data-reveal="up" style={{ "--i": 1 } as CSSProperties}>{children}</div>}
  </div>;
}

/** Page hero: either one registered photograph or an original generated artwork. */
export function PageHero({ kicker, title, intro, image, art, hue = ["#e10613", "#2563eb"], children }: { kicker: string; title: ReactNode; intro: string; image?: MediaKey; art?: { seed: string; variant: "mesh" | "orbit" | "circuit" | "bars" | "wave" }; hue?: readonly [string, string]; children?: ReactNode }) {
  return <section className="page-hero" style={{ "--a": hue[0], "--b": hue[1] } as CSSProperties}>
    <div className="page-hero-media" data-parallax="0.08">
      {image ? <div className="page-hero-photo" style={{ backgroundImage: `url('${media[image]}')` }} /> : art ? <GenArt seed={art.seed} variant={art.variant} hue={hue} /> : null}
    </div>
    <div className="page-hero-shade" />
    <Aurora hue={hue} />
    <div className="shell page-hero-inner">
      <span className="kicker kicker-glass"><i className="pulse" />{kicker}</span>
      <h1 className="hero-title">{title}</h1>
      <p className="hero-lede">{intro}</p>
      {children && <div className="hero-actions">{children}</div>}
    </div>
  </section>;
}

/** Web app, mobile app and WhatsApp — the three conversion channels, carried into every page. */
export function ChannelRow({ topic, title = "Continue on the channel that suits you." }: { topic?: string; title?: string }) {
  const q = topic ? `?topic=${encodeURIComponent(topic)}` : "";
  const items = [
    { href: `/platform`, label: "Web app", note: "Open a private workspace and track every step.", Icon: MonitorSmartphone, cls: "ch-web" },
    { href: `/app`, label: "Mobile app", note: "Install DigitalBurj to your home screen.", Icon: Smartphone, cls: "ch-mobile" },
    { href: `/connect/whatsapp${q}`, label: "WhatsApp", note: "Compose a guided first message in seconds.", Icon: MessageCircle, cls: "ch-whatsapp" },
  ];
  return <section className="channel-row-wrap">
    <div className="shell">
      <p className="channel-row-title" data-reveal="up">{title}</p>
      <div className="channel-row">
        {items.map(({ href, label, note, Icon, cls }, i) => <Link key={label} href={href} className={`channel-card ${cls}`} data-spotlight data-reveal="up" style={{ "--i": i } as CSSProperties}>
          <span className="channel-ico"><Icon size={22} /></span>
          <span className="channel-txt"><strong>{label}</strong><small>{note}</small></span>
          <ArrowUpRight size={20} className="channel-arrow" aria-hidden="true" />
        </Link>)}
      </div>
    </div>
  </section>;
}

export function Marquee({ items, reverse = false, className = "" }: { items: string[]; reverse?: boolean; className?: string }) {
  const row = [...items, ...items];
  return <div className={`marquee ${reverse ? "rev" : ""} ${className}`}><ul className="sr-only">{items.map(t => <li key={t}>{t}</li>)}</ul><div className="marquee-track" aria-hidden="true">{row.map((t, i) => <span key={i}>{t}<i>✦</i></span>)}</div></div>;
}
