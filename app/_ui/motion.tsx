"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll choreography for the whole site, driven by data attributes:
 *  data-reveal="up|fade|scale|blur|left|right"  staggered entrance (use style --i for order)
 *  data-scrub                                     words light up as the block crosses the viewport
 *  data-parallax="0.15"                           vertical drift relative to scroll
 *  data-count="120"                               number counts up once visible
 *  data-spotlight / data-tilt                     pointer-follow glow and 3D tilt on cards
 *  data-sticky-story                              exposes --story (0..1) progress to CSS
 */
export function MotionLayer() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    const still = reduced();
    const cleanups: (() => void)[] = [];

    // Reveal
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (still || !("IntersectionObserver" in window)) reveals.forEach(el => el.classList.add("in"));
    else {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .14, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach(el => { el.classList.add("rv"); io.observe(el); });
      cleanups.push(() => io.disconnect());
    }

    // In the sticky story only the active panel is visible; keep SVG animations in the others paused.
    const syncStorySvgs = (story: HTMLElement) => {
      const active = story.dataset.active ?? "0";
      const on = !story.closest("[data-offscreen]");
      story.querySelectorAll<HTMLElement>(".story-img").forEach(img => img.querySelectorAll("svg").forEach(svg => { if (on && img.dataset.idx === active) svg.unpauseAnimations(); else svg.pauseAnimations(); }));
    };

    // Pause looping CSS animations in sections that are off screen; they resume just
    // before they scroll back into view, so nothing visible changes.
    if ("IntersectionObserver" in window) {
      const zones = Array.from(document.querySelectorAll<HTMLElement>(".public-site > section, .public-site > footer, .site-footer"));
      const zio = new IntersectionObserver(es => es.forEach(e => {
        const off = !e.isIntersecting;
        (e.target as HTMLElement).toggleAttribute("data-offscreen", off);
        // SVG (SMIL) animations ignore CSS play state, so pause them directly.
        e.target.querySelectorAll("svg").forEach(svg => { if (off) svg.pauseAnimations(); else svg.unpauseAnimations(); });
        const target = e.target as HTMLElement;
        (target.matches("[data-sticky-story]") ? [target] : Array.from(target.querySelectorAll<HTMLElement>("[data-sticky-story]"))).forEach(syncStorySvgs);
      }), { rootMargin: "200px 0px" });
      zones.forEach(z => zio.observe(z));
      cleanups.push(() => { zio.disconnect(); zones.forEach(z => z.removeAttribute("data-offscreen")); });
    }

    // Counters
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const countUp = (el: HTMLElement) => {
      const to = Number(el.dataset.count || 0);
      if (still) { el.textContent = String(to); return; }
      const t0 = performance.now();
      const step = (t: number) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement; cio.unobserve(el);
      countUp(el);
    }), { threshold: .6 });
    counters.forEach(c => cio.observe(c));
    cleanups.push(() => cio.disconnect());

    const scrubs = Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]"));
    const visibleScrubs = new Set<HTMLElement>();
    const scrubWords = new Map(scrubs.map(el => [el, Array.from(el.querySelectorAll<HTMLElement>(".w"))]));
    const scrubObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) visibleScrubs.add(el);
      else visibleScrubs.delete(el);
      onScroll();
    }), { rootMargin: "50% 0px" });
    scrubs.forEach(el => scrubObserver.observe(el));
    cleanups.push(() => scrubObserver.disconnect());

    const parallax = window.matchMedia("(pointer: fine)").matches && !still ? Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")) : [];
    const stories = Array.from(document.querySelectorAll<HTMLElement>("[data-sticky-story]"));
    const bar = document.querySelector<HTMLElement>(".read-progress");
    let ticking = false;
    const frame = () => {
      const vh = window.innerHeight;
      const max = root.scrollHeight - vh;
      // Write progress on the bar itself: a custom property on <html> would force a
      // style recalculation of every element on each scroll frame.
      const read = `${(max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(1)}%`;
      if (bar && bar.style.width !== read) bar.style.width = read;
      const scrolled = window.scrollY > 24;
      if (root.classList.contains("scrolled") !== scrolled) root.classList.toggle("scrolled", scrolled);
      if (!still) {
        parallax.forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < -vh || r.top > vh * 2) return; const k = Number(el.dataset.parallax || .12); el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -k).toFixed(1)}px, 0)`; });
        visibleScrubs.forEach(el => {
          const r = el.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .45)));
          const words = scrubWords.get(el)!;
          const lit = Math.round(p * words.length);
          if (el.dataset.lit !== String(lit)) {
            words.forEach((w, i) => w.classList.toggle("lit", i < lit));
            el.dataset.lit = String(lit);
          }
        });
      } else scrubs.forEach(el => el.querySelectorAll(".w").forEach(w => w.classList.add("lit")));
      stories.forEach(el => {
        const r = el.getBoundingClientRect();
        const p = Math.min(.999, Math.max(0, -r.top / Math.max(1, r.height - vh)));
        const progress = p.toFixed(3);
        if (el.style.getPropertyValue("--story") !== progress) el.style.setProperty("--story", progress);
        const n = Number(el.dataset.stickyStory || 1);
        const active = Math.min(n - 1, Math.floor(p * n));
        if (el.dataset.active !== String(active)) { el.dataset.active = String(active); syncStorySvgs(el); }
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking && !document.hidden) { ticking = true; requestAnimationFrame(frame); } };
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onScroll);
    cleanups.push(() => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); document.removeEventListener("visibilitychange", onScroll); });

    // Spotlight + tilt (delegated)
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine && !still) {
      const move = (e: PointerEvent) => {
        const t = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-spotlight],[data-tilt]");
        if (!t) return;
        const r = t.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        t.style.setProperty("--px", `${x}px`); t.style.setProperty("--py", `${y}px`);
        if (t.hasAttribute("data-tilt")) { t.style.setProperty("--rx", `${((y / r.height) - .5) * -7}deg`); t.style.setProperty("--ry", `${((x / r.width) - .5) * 9}deg`); }
      };
      const out = (e: PointerEvent) => { const t = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-tilt]"); if (t && !t.contains(e.relatedTarget as Node)) { t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); } };
      document.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerout", out, { passive: true });
      cleanups.push(() => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerout", out); });
    }
    return () => cleanups.forEach(f => f());
  }, [pathname]);
  return <div className="read-progress" aria-hidden="true" />;
}

/** Words rendered as spans so MotionLayer can light them progressively while scrolling. */
export function ScrubText({ text, accent = [] as string[], className = "" }: { text: string; accent?: string[]; className?: string }) {
  return <p className={`scrub ${className}`} data-scrub>{text.split(" ").map((w, i) => <span key={i} className={`w ${accent.includes(w.replace(/[.,]/g, "")) ? "acc" : ""}`}>{w} </span>)}</p>;
}
