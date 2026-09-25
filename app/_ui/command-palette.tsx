"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";
import { discoveryIndex } from "../brand-data";

export const OPEN_PALETTE = "db:open-palette";

/** ⌘K / Ctrl+K discovery across every public destination and conversion route. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return discoveryIndex;
    return discoveryIndex.filter(x => `${x.title} ${x.group} ${x.keywords || ""}`.toLowerCase().includes(t));
  }, [q]);

  const close = useCallback(() => { setOpen(false); setQ(""); setIdx(0); }, []);
  const go = useCallback((href: string) => { close(); router.push(href); }, [close, router]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(o => !o); }
      else if (e.key === "Escape") close();
    };
    const openEvt = () => setOpen(true);
    window.addEventListener("keydown", key);
    window.addEventListener(OPEN_PALETTE, openEvt);
    return () => { window.removeEventListener("keydown", key); window.removeEventListener(OPEN_PALETTE, openEvt); };
  }, [close]);

  useEffect(() => { if (open) { document.documentElement.classList.add("lock-scroll"); setTimeout(() => input.current?.focus(), 30); } else document.documentElement.classList.remove("lock-scroll"); }, [open]);

  if (!open) return null;
  return (
    <div className="palette-scrim" onClick={close}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search DigitalBurj" onClick={e => e.stopPropagation()}>
        <div className="palette-input">
          <Search size={19} aria-hidden="true" />
          <input ref={input} value={q} placeholder="Search divisions, courses, channels…" aria-label="Search" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-activedescendant={results[idx] ? `pal-${idx}` : undefined}
            onChange={e => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={e => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
              if (e.key === "Enter" && results[idx]) go(results[idx].href);
            }} />
          <button type="button" onClick={close} aria-label="Close search"><X size={18} /></button>
        </div>
        <ul id="palette-list" role="listbox" className="palette-list">
          {results.map((r, i) => {
            const header = i === 0 || results[i - 1].group !== r.group ? r.group : null;
            return <li key={r.href + r.title} role="presentation">
              {header && <span className="palette-group">{header}</span>}
              <button type="button" id={`pal-${i}`} role="option" aria-selected={i === idx} className={i === idx ? "on" : ""} onMouseEnter={() => setIdx(i)} onClick={() => go(r.href)}>
                <span>{r.title}</span>{i === idx && <CornerDownLeft size={15} aria-hidden="true" />}
              </button>
            </li>;
          })}
          {!results.length && <li className="palette-empty">No match. Try “automation”, “course” or “WhatsApp”.</li>}
        </ul>
        <div className="palette-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
      </div>
    </div>
  );
}

export function PaletteButton({ className = "" }: { className?: string }) {
  return <button type="button" className={`palette-trigger ${className}`} onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))} aria-label="Search DigitalBurj (Ctrl K)">
    <Search size={16} aria-hidden="true" /><span>Search</span><kbd>⌘K</kbd>
  </button>;
}
