"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MessageCircle, MonitorSmartphone, Smartphone, Sparkles, X } from "lucide-react";

const routes = [
  { href: "/connect/whatsapp", label: "WhatsApp", note: "Guided first message · replies in minutes", icon: MessageCircle, cls: "wa" },
  { href: "/platform", label: "Web app", note: "Open your private workspace", icon: MonitorSmartphone, cls: "web" },
  { href: "/app", label: "Mobile app", note: "Install on your home screen", icon: Smartphone, cls: "mob" },
];

/** Floating desktop concierge: one tap to the three conversion channels. Hidden inside the workspace and admin. */
export function Concierge() {
  const pathname = usePathname();
  // Remember which page the panel was opened on, so navigating closes it without an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenOn(null); };
    const away = (e: PointerEvent) => { if (!panel.current?.parentElement?.contains(e.target as Node)) setOpenOn(null); };
    document.addEventListener("keydown", esc);
    document.addEventListener("pointerdown", away);
    return () => { document.removeEventListener("keydown", esc); document.removeEventListener("pointerdown", away); };
  }, [open]);
  if (/^\/(workspace|admin|connect)/.test(pathname) || /^\/academy\/(learn|checkout|sign-in|register)/.test(pathname)) return null;
  const topic = ["academy", "studio", "business", "talent", "jobs"].find(t => pathname.startsWith(`/${t}`));

  return <div className={`lx-concierge ${open ? "open" : ""}`}>
    <div ref={panel} className="lx-concierge-panel" id="concierge-panel" role="dialog" aria-label="Talk to DigitalBurj" aria-hidden={!open} inert={!open}>
      <div className="lx-concierge-head"><span><Sparkles size={15} />Concierge</span><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button></div>
      <p>How would you like to continue?</p>
      {routes.map(({ href, label, note, icon: Icon, cls }) => <Link key={href} href={href === "/connect/whatsapp" && topic ? `${href}?topic=${topic}` : href} className={`lx-concierge-link ${cls}`}>
        <span className="lx-concierge-ico"><Icon size={18} /></span><span><strong>{label}</strong><small>{note}</small></span><ArrowUpRight size={16} />
      </Link>)}
      <Link href="/get-started" className="lx-concierge-foot">Not sure yet? Find your path <ArrowUpRight size={14} /></Link>
    </div>
    <button type="button" className="lx-concierge-btn" aria-expanded={open} aria-controls="concierge-panel" onClick={() => setOpen(!open)}>
      <span className="lx-concierge-ring" aria-hidden="true" />
      {open ? <X size={20} /> : <MessageCircle size={20} />}
      <span className="lx-concierge-label">Talk to us</span>
    </button>
  </div>;
}
