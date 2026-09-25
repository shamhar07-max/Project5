"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Img } from "./img";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useReducedMotion } from "./use-reduced-motion";

const partners = [
  { name: "Resilianta", image: "resilianta.webp" }, { name: "Medina Bridge", image: "medina-bridge.webp" },
  { name: "HospyQ", image: "hospyq.webp" }, { name: "Attesora", image: "attesora.webp" },
  { name: "Procurazo", image: "procurazo.webp" }, { name: "Rootiva Herbal", image: "rootiva.webp" },
  { name: "The Imam Collective", image: "imam-collective.webp" }, { name: "VelozTrade", image: "veloztrade.webp" },
  { name: "Loadbyton", image: "loadbyton.svg" },
] as const;

export function PartnerShowcase() {
  const rail = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const still = useReducedMotion();
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!section.current || !("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  const go = useCallback((index: number) => {
    const next = (index + partners.length) % partners.length;
    const card = rail.current?.children[next] as HTMLElement | undefined;
    if (card && rail.current) rail.current.scrollTo({ left: card.offsetLeft - rail.current.offsetLeft, behavior: still ? "instant" : "smooth" });
    setActive(next);
  }, [still]);
  useEffect(() => {
    if (paused || still || !visible || !tabVisible) return;
    const id = window.setInterval(() => go(active + 1), 5200);
    return () => window.clearInterval(id);
  }, [active, paused, still, visible, tabVisible, go]);
  return <div ref={section} className="partner-showcase" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>
    <div className="shell partner-showcase-top"><span>SELECTED IDENTITIES / 01—09</span><div className="partner-controls"><span aria-live="polite">{String(active + 1).padStart(2, "0")} / {String(partners.length).padStart(2, "0")}</span><button type="button" aria-label="Previous project" onClick={() => go(active - 1)}><ArrowLeft size={19} /></button><button type="button" aria-label="Next project" onClick={() => go(active + 1)}><ArrowRight size={19} /></button></div></div>
    <div className="partner-gallery" ref={rail} onScroll={() => { const el = rail.current; if (!el) return; const cards = Array.from(el.children) as HTMLElement[]; let closest = 0, distance = Infinity; cards.forEach((card, i) => { const d = Math.abs(card.offsetLeft - el.offsetLeft - el.scrollLeft); if (d < distance) { distance = d; closest = i; } }); setActive(closest); }} aria-label="Completed DigitalBurj projects and brand partners">
      {partners.map((partner, i) => <article className={`partner-feature ${i === active ? "is-active" : ""}`} key={partner.name}>
        <div className="partner-feature-art"><Img src={`/brand/partners/${partner.image}`} alt={`${partner.name} logo`} width={1200} height={800} loading="lazy" /><span className="partner-feature-sheen" aria-hidden="true" /></div>
        <div className="partner-feature-meta"><span>{String(i + 1).padStart(2, "0")}</span><strong>{partner.name}</strong><small>Completed project · Brand partner</small></div>
      </article>)}
    </div>
    <div className="shell partner-showcase-foot"><p>Each identity is shown as supplied. Project scope varies by partner.</p><span>Drag or use arrows to explore</span></div>
  </div>;
}
