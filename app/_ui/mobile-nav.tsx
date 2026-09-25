"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Compass, Home, LayoutGrid, MessageCircle, Search, Smartphone, X } from "lucide-react";
import { divisions } from "../brand-data";
import { OPEN_PALETTE } from "./command-palette";

/** Full-screen premium mobile navigation with staggered division rows and channel shortcuts. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeBtn = useRef<HTMLButtonElement>(null);
  // The header uses backdrop-filter, which would trap a fixed sheet inside it; render into <body> instead.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setOpen(false); }
  useEffect(() => {
    document.documentElement.classList.toggle("lock-scroll", open);
    if (!open) return;
    closeBtn.current?.focus();
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  return <>
    <button type="button" className="burger" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-sheet" onClick={() => setOpen(true)}><span /><span /></button>
    {mounted && createPortal(<div id="mobile-sheet" className={`msheet ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" inert={!open} aria-hidden={!open}>
      <div className="msheet-aurora" aria-hidden="true" />
      <div className="msheet-top">
        <span className="msheet-kicker">DIGITALBURJ / MENU</span>
        <button ref={closeBtn} type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="msheet-close"><X size={22} /></button>
      </div>
      <button type="button" className="msheet-search" onClick={() => { setOpen(false); window.dispatchEvent(new Event(OPEN_PALETTE)); }}><Search size={18} /> Search everything</button>
      <nav aria-label="Divisions" className="msheet-divisions">
        {divisions.map((d, i) => <Link key={d.slug} href={`/${d.slug}`} style={{ "--i": i, "--a": d.hue[0], "--b": d.hue[1] } as React.CSSProperties} className={pathname === `/${d.slug}` ? "current" : ""}>
          <span className="msheet-dot" aria-hidden="true" /><span className="msheet-name">{d.name}<small>{d.tagline}</small></span><ArrowUpRight size={20} aria-hidden="true" />
        </Link>)}
      </nav>
      <nav aria-label="More" className="msheet-more">
        {[["/technology", "Technology"], ["/ecosystem", "Ecosystem"], ["/company", "Company"], ["/contact", "Contact"], ["/docs", "Guides"], ["/workspace", "Workspace"]].map(([h, l], i) => <Link key={h} href={h} style={{ "--i": i + 5 } as React.CSSProperties}>{l}</Link>)}
      </nav>
      <div className="msheet-channels">
        <Link href="/connect/whatsapp" className="ch-wa"><MessageCircle size={19} /> WhatsApp</Link>
        <Link href="/app" className="ch-app"><Smartphone size={19} /> Get the app</Link>
        <Link href="/get-started" className="ch-start">Start here <ArrowUpRight size={17} /></Link>
      </div>
    </div>, document.body)}
  </>;
}

/** Thumb-reach dock for phones. Hides while scrolling down, returns on scroll up. */
export function MobileDock() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY, tick = false;
    const on = () => { if (tick) return; tick = true; requestAnimationFrame(() => { const y = window.scrollY; setHidden(y > last && y > 240); last = y; tick = false; }); };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (pathname.startsWith("/workspace")) return null;
  const items = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/get-started", label: "Explore", Icon: Compass },
    { href: "/connect/whatsapp", label: "Chat", Icon: MessageCircle, accent: true },
    { href: "/app", label: "App", Icon: Smartphone },
    { href: "/workspace", label: "Space", Icon: LayoutGrid },
  ];
  return <nav className={`dock ${hidden ? "dock-hidden" : ""}`} aria-label="Quick actions">
    {items.map(({ href, label, Icon, accent }) => <Link key={href} href={href} className={`${pathname === href ? "on" : ""} ${accent ? "dock-accent" : ""}`} aria-current={pathname === href ? "page" : undefined}><Icon size={20} aria-hidden="true" /><span>{label}</span></Link>)}
  </nav>;
}
