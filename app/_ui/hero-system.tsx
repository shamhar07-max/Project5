"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Img } from "./img";
import { divisions } from "../brand-data";
import { useReducedMotion } from "./use-reduced-motion";

const verbs = ["Learn through practical work", "Build the useful product", "Improve the operation", "Make capability visible", "Connect to opportunity"];

export function HeroSystem() {
  const section = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const still = useReducedMotion();
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const el = section.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (paused || still || !visible || !tabVisible) return;
    const id = window.setInterval(() => setActive(n => (n + 1) % divisions.length), 3600);
    return () => window.clearInterval(id);
  }, [paused, still, visible, tabVisible]);
  return <div ref={section} className="hero-system" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }} aria-label="Five connected DigitalBurj divisions">
    <div className="hero-system-top"><span>ONE COMPANY / FIVE WAYS FORWARD</span><span>0{active + 1} — 05</span></div>
    <div className="hero-system-board" style={{ "--active-color": divisions[active].hue[0] } as React.CSSProperties}>
      <div className="hero-system-lines" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="hero-system-core"><Img src="/brand/digitalburj-wordmark-800.webp" alt="DigitalBurj" width={2048} height={512} loading="eager" /><span key={active}>{verbs[active]}</span><b className="hero-system-signal" /></div>
      {divisions.map((d, i) => <Link key={d.slug} href={`/${d.slug}`} className={`hero-system-node hero-system-node-${i + 1} ${active === i ? "is-active" : ""}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} style={{ "--i": i, "--a": d.hue[0] } as React.CSSProperties} aria-current={active === i ? "step" : undefined}>
        <span className="hero-system-node-n">0{i + 1}</span><strong>{d.name}</strong><small>{d.tagline}</small>
      </Link>)}
      <div className="hero-system-progress" aria-hidden="true"><i key={active} /></div>
    </div>
    <p className="hero-system-caption">Follow the path that fits your problem. The work stays connected as your needs change.</p>
  </div>;
}
