import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronDown, MessageCircle, MonitorSmartphone, Smartphone } from "lucide-react";
import { channelNav, divisions, primaryNav } from "./brand-data";
import { MagneticLink } from "./_ui/magnetic";
import { PaletteButton } from "./_ui/command-palette";
import { MobileNav } from "./_ui/mobile-nav";

export { divisions };

function Wordmark({ light = false }: { light?: boolean }) {
  return <span className={`brand-wordmark ${light ? "brand-wordmark-tile" : ""}`}><Image src="/brand/digitalburj-wordmark-approved.webp" width={2048} height={512} alt="" unoptimized /></span>;
}

export function SiteHeader() {
  const channelIcons = [MonitorSmartphone, Smartphone, MessageCircle];
  return <header className="site-header">
    <div className="shell header-inner">
      <Link href="/" aria-label="DigitalBurj home" className="brand-link"><Wordmark /></Link>
      <nav aria-label="Main navigation" className="desktop-nav">
        {primaryNav.slice(0, 3).map(n => <Link key={n.href} href={n.href}>{n.label}</Link>)}
        <div className="nav-drop">
          <button type="button" aria-haspopup="true">Connect <ChevronDown size={14} aria-hidden="true" /></button>
          <div className="nav-drop-panel">
            {channelNav.map((c, i) => { const Icon = channelIcons[i]; return <Link key={c.href} href={c.href}><span className={`nav-ico nav-ico-${i}`}><Icon size={18} /></span><span><strong>{c.label}</strong><small>{c.note}</small></span></Link>; })}
          </div>
        </div>
        {primaryNav.slice(3).map(n => <Link key={n.href} href={n.href}>{n.label}</Link>)}
      </nav>
      <div className="header-tools">
        <PaletteButton />
        <MagneticLink href="/get-started" variant="ink" className="header-cta">Start</MagneticLink>
        <MobileNav />
      </div>
    </div>
  </header>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-glow" aria-hidden="true" />
    <div className="shell footer-cta">
      <div><span className="footer-cta-kicker">A good place to begin</span><h2>Tell us what you are<br /><em>working through.</em></h2><p>We will help you decide whether to learn, build, improve a process or find the right people.</p></div>
      <div className="footer-cta-actions">
        <MagneticLink href="/get-started" variant="light">Find the right path</MagneticLink>
        <MagneticLink href="/connect/whatsapp" variant="glass">Talk to our team</MagneticLink>
      </div>
    </div>
    <div className="shell footer-main">
      <div className="footer-brand">
        <Wordmark light />
        <p>Practical learning, useful software and better operations — connected by evidence of what people can do.</p>
        <div className="footer-domains">{divisions.map(d => <span key={d.slug} style={{ "--a": d.hue[0] } as React.CSSProperties}>{d.domain}</span>)}</div>
      </div>
      <div><h2>Academy</h2><Link href="/academy">Overview</Link><Link href="/academy/catalogue">Catalogue</Link><Link href="/academy/tools">Tool library</Link><Link href="/workspace/academy">My learning</Link></div>
      <div><h2>Studio &amp; AI</h2><Link href="/studio">Studio</Link><Link href="/workspace/intake?service=studio">Start a project</Link><Link href="/business">Business AI</Link><Link href="/workspace/intake?service=business">Consultation</Link></div>
      <div><h2>Ecosystem</h2><Link href="/talent">Verified Talent</Link><Link href="/jobs">Jobs</Link><Link href="/jobs/board">Open roles</Link><Link href="/ecosystem">How it connects</Link><Link href="/technology">Technology</Link></div>
      <div><h2>Resources</h2><Link href="/platform">Web app</Link><Link href="/app">Mobile app</Link><Link href="/support">Help center</Link><Link href="/docs/api">API</Link><Link href="/status">Status</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} DigitalBurj</span><Link href="/company">Evidence before claims <ArrowUpRight size={14} /></Link></div>
  </footer>;
}
