import Link from "next/link";
import { divisions } from "./brand-data";
import { PaletteButton } from "./_ui/palette-host";
import { MobileNav } from "./_ui/mobile-nav";

export { divisions };

const nav = [
  { href: "/academy", label: "Academy" },
  { href: "/studio", label: "Studio" },
  { href: "/business", label: "Business AI" },
  { href: "/talent", label: "Talent" },
  { href: "/jobs", label: "Jobs" },
  { href: "/company", label: "Company" },
];

/** The approved wordmark, trimmed to a transparent 6 KB file; `light` is the version for dark backgrounds. */
export function Wordmark({ light = false }: { light?: boolean }) {
  // A plain <img> keeps the next/image client runtime off public pages.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="wordmark" src={light ? "/brand/wordmark-paper.png" : "/brand/wordmark-ink.png"} width={770} height={96} alt="DigitalBurj" fetchPriority={light ? "low" : "high"} decoding="async" />;
}

export function SiteHeader() {
  return <header className="site-header">
    <div className="wrap site-header-row">
      <Link href="/" className="brand" aria-label="DigitalBurj home"><Wordmark /></Link>
      <nav aria-label="Main" className="site-nav">{nav.map(n => <Link key={n.href} href={n.href}>{n.label}</Link>)}</nav>
      <div className="site-tools">
        <PaletteButton />
        <Link href="/get-started" className="btn btn-primary btn-sm header-cta">Get started</Link>
        <MobileNav />
      </div>
    </div>
  </header>;
}

const columns: [string, [string, string][]][] = [
  ["Divisions", divisions.map(d => [`/${d.slug}`, d.name] as [string, string])],
  ["Start", [["/get-started", "Find your starting point"], ["/workspace/intake?service=studio", "Start a Studio project"], ["/workspace/intake?service=business", "Book a Business AI consultation"], ["/jobs/board", "Open roles"], ["/academy/catalogue", "Academy catalogue"]]],
  ["Company", [["/company", "About DigitalBurj"], ["/technology", "Technology"], ["/ecosystem", "How it connects"], ["/contact", "Contact"], ["/status", "Service status"]]],
  ["Use DigitalBurj", [["/platform", "Web app"], ["/app", "Mobile app"], ["/connect/whatsapp", "WhatsApp"], ["/support", "Help centre"], ["/docs/api", "API for developers"]]],
];

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="wrap footer-cta">
      <h2>Tell us what you are working on. <span>We will tell you honestly where to start.</span></h2>
      <div className="footer-cta-actions">
        <Link href="/get-started" className="btn btn-light">Find your starting point</Link>
        <Link href="/connect/whatsapp" className="btn btn-outline-light">Message us on WhatsApp</Link>
      </div>
    </div>
    <div className="wrap footer-grid">
      <div className="footer-about">
        <Wordmark light />
        <p>A technology company in Dubai. We teach practical skills, build useful software and fix the processes that slow businesses down.</p>
      </div>
      {columns.map(([title, links]) => <div key={title} className="footer-col"><h3>{title}</h3><ul>{links.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></div>)}
    </div>
    <div className="wrap footer-base">
      <span>© {new Date().getFullYear()} DigitalBurj. All rights reserved.</span>
      <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span>
    </div>
  </footer>;
}
