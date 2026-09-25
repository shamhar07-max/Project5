"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PointerEvent, ReactNode } from "react";

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches;

/** Magnetic CTA with a travelling shine. Pulls toward the pointer, springs back on leave. */
export function MagneticLink({ href, children, variant = "red", className = "", icon = true, external = false }: { href: string; children: ReactNode; variant?: "red" | "light" | "glass" | "ink" | "whatsapp"; className?: string; icon?: boolean; external?: boolean }) {
  function move(e: PointerEvent<HTMLAnchorElement>) {
    if (calm()) return;
    const el = e.currentTarget, r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width - .5) * 16}px`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height - .5) * 12}px`);
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }
  function leave(e: PointerEvent<HTMLAnchorElement>) { e.currentTarget.style.setProperty("--mx", "0px"); e.currentTarget.style.setProperty("--my", "0px"); }
  const cls = `mag mag-${variant} ${className}`;
  const inner = <><span className="mag-glow" aria-hidden="true" /><span className="mag-label">{children}</span>{icon && <span className="mag-icon" aria-hidden="true"><ArrowUpRight size={17} /></span>}</>;
  if (external) return <a href={href} className={cls} onPointerMove={move} onPointerLeave={leave} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return <Link href={href} className={cls} onPointerMove={move} onPointerLeave={leave}>{inner}</Link>;
}
