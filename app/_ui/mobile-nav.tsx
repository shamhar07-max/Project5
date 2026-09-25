"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { divisions } from "../brand-data";
import { OPEN_PALETTE } from "./palette-host";

const more = [["/technology", "Technology"], ["/ecosystem", "How it connects"], ["/company", "Company"], ["/support", "Help centre"], ["/contact", "Contact"], ["/workspace", "Sign in to workspace"]];

/** Small-screen menu: one calm panel, closes on navigation, Escape or outside tap. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) { setLastPath(pathname); setOpen(false); }
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.classList.toggle("lock-scroll", open);
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);
  return <>
    <button ref={btn} type="button" className="menu-btn" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(o => !o)}>
      <span aria-hidden="true" className={open ? "menu-icon open" : "menu-icon"}><i /><i /></span>{open ? "Close" : "Menu"}
    </button>
    <div id="site-menu" className={`menu ${open ? "open" : ""}`} inert={!open} aria-hidden={!open} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      {open && <div className="menu-panel">
        <nav aria-label="Divisions" className="menu-divisions">
          {divisions.map(d => <Link key={d.slug} href={`/${d.slug}`} style={{ "--a": d.hue[0] } as React.CSSProperties} aria-current={pathname === `/${d.slug}` ? "page" : undefined}>
            <strong>{d.name}</strong><small>{d.tagline}</small>
          </Link>)}
        </nav>
        <nav aria-label="More" className="menu-more">{more.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</nav>
        <div className="menu-actions">
          <button type="button" className="btn btn-secondary" onClick={() => { setOpen(false); window.dispatchEvent(new Event(OPEN_PALETTE)); }}>Search</button>
          <Link href="/connect/whatsapp" className="btn btn-primary">Talk to us</Link>
        </div>
      </div>}
    </div>
  </>;
}
