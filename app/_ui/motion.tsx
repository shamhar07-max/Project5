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

    // Counters
    const counters = Array.from(document.querySelectorAll<HTMLElement>("[data-count]"));
    const cio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target as HTMLElement; cio.unobserve(el);
      const to = Number(el.dataset.count || 0);
      if (still) { el.textContent = String(to); return; }
      const t0 = performance.now();
      const step = (t: number) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }), { threshold: .6 });
    counters.forEach(c => cio.observe(c));
    cleanups.push(() => cio.disconnect());

    const scrubs = Array.from(document.querySelectorAll<HTMLElement>("[data-scrub]"));

    const parallax = window.matchMedia("(pointer: fine)").matches && !still ? Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")) : [];
    const stories = Array.from(document.querySelectorAll<HTMLElement>("[data-sticky-story]"));
    let ticking = false;
    const frame = () => {
      const vh = window.innerHeight;
      const max = root.scrollHeight - vh;
      root.style.setProperty("--read", `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
      root.classList.toggle("scrolled", window.scrollY > 24);
      if (!still) {
        parallax.forEach(el => { const r = el.getBoundingClientRect(); const k = Number(el.dataset.parallax || .12); el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -k).toFixed(1)}px, 0)`; });
        scrubs.forEach(el => {
          const r = el.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .45)));
          const words = el.querySelectorAll<HTMLElement>(".w");
          const lit = Math.round(p * words.length);
          words.forEach((w, i) => w.classList.toggle("lit", i < lit));
        });
      } else scrubs.forEach(el => el.querySelectorAll(".w").forEach(w => w.classList.add("lit")));
      stories.forEach(el => {
        const r = el.getBoundingClientRect();
        const p = Math.min(.999, Math.max(0, -r.top / Math.max(1, r.height - vh)));
        el.style.setProperty("--story", p.toFixed(3));
        const n = Number(el.dataset.stickyStory || 1);
        const active = Math.min(n - 1, Math.floor(p * n));
        if (el.dataset.active !== String(active)) el.dataset.active = String(active);
      });
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); });

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
