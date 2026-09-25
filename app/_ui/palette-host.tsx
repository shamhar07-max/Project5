"use client";
import { lazy, Suspense, useEffect, useState } from "react";

export const OPEN_PALETTE = "db:open-palette";
// The palette's code is only fetched when someone presses ⌘K or taps Search.
const CommandPalette = lazy(() => import("./command-palette"));

export function PaletteHost() {
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    if (wanted) return;
    const key = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setWanted(true); } };
    const evt = () => setWanted(true);
    window.addEventListener("keydown", key);
    window.addEventListener(OPEN_PALETTE, evt);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener(OPEN_PALETTE, evt); };
  }, [wanted]);
  return wanted ? <Suspense fallback={null}><CommandPalette /></Suspense> : null;
}

export function PaletteButton({ className = "" }: { className?: string }) {
  return <button type="button" className={`search-btn ${className}`} onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))} aria-label="Search DigitalBurj (Ctrl K)">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg><span>Search</span>
  </button>;
}
