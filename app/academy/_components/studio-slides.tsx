"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Maximize2, Plus, Printer, Trash2, X } from "lucide-react";
import { blankSlide, draftDeck, uid, type Deck, type DeckInput, type DeckTheme, type Slide, type SlideLayout } from "../../../lib/academy/studio";
import { ExportButton, GenerateButtons, SaveButton, StudioHeader, download, slug, useStudio, type StudioProps } from "./studio-kit";

const THEMES: DeckTheme[] = ["burj", "midnight", "paper", "aurora"];
const LAYOUTS: SlideLayout[] = ["title", "agenda", "bullets", "stat", "quote", "process", "compare", "closing"];
const DEFAULT: DeckInput = { topic: "Automating client onboarding", audience: "the leadership team", slides: 10, theme: "burj", points: "Where time is lost today, The redesigned process, What we automate first, How we measure success" };

export function SlideView({ s, theme, n }: { s: Slide; theme: DeckTheme; n?: number }) {
  const body = (() => {
    switch (s.layout) {
      case "title": return <><div style={{ flex: 1 }} /><span className="s-kicker">DigitalBurj Academy</span><h1>{s.title}</h1>{s.subtitle && <p style={{ opacity: .75 }}>{s.subtitle}</p>}</>;
      case "stat": return <><h2>{s.title}</h2><div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${Math.max(1, s.stats.length)}, 1fr)`, gap: "3cqw", alignItems: "center" }}>{s.stats.map((x, i) => <div key={i} className="s-stat"><strong>{x.value}</strong><p style={{ opacity: .8 }}>{x.label}</p></div>)}</div></>;
      case "quote": return <><span className="s-kicker">{s.title}</span><div style={{ flex: 1, display: "grid", alignContent: "center", gap: "2cqw" }}><p className="s-quote">“{s.quote}”</p><p style={{ opacity: .7 }}>— {s.quoteBy}</p></div></>;
      case "compare": return <><h2>{s.title}</h2><div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3cqw", alignContent: "center" }}>{s.columns.map((c, i) => <div key={i} style={{ borderTop: "0.5cqw solid var(--sa)", paddingTop: "2cqw", opacity: i ? 1 : .8 }}><p style={{ fontWeight: 800, fontSize: "2.8cqw" }}>{c.heading}</p><ul style={{ marginTop: "1.5cqw" }}>{c.points.map((p, k) => <li key={k}>{p}</li>)}</ul></div>)}</div></>;
      case "process": return <><h2>{s.title}</h2><div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${Math.max(1, s.bullets.length)}, 1fr)`, gap: "1.6cqw", alignItems: "center" }}>{s.bullets.map((b, i) => <div key={i} style={{ padding: "2.2cqw 1.6cqw", borderRadius: "1.4cqw", background: "rgb(128 128 128 / .14)", display: "grid", gap: "1cqw" }}><span style={{ font: "800 3.4cqw var(--f-sans)", color: "var(--sa)" }}>{String(i + 1).padStart(2, "0")}</span><p style={{ fontWeight: 700 }}>{b}</p></div>)}</div></>;
      case "closing": return <><div style={{ flex: 1 }} /><h1>{s.title}</h1><ul>{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>{s.subtitle && <p className="s-kicker" style={{ marginTop: "2cqw" }}>{s.subtitle}</p>}</>;
      default: return <>{s.layout === "agenda" && <span className="s-kicker">Agenda</span>}<h2>{s.title}</h2>{s.subtitle && <p style={{ opacity: .75 }}>{s.subtitle}</p>}<ul style={{ marginTop: "1cqw" }}>{s.bullets.map((b, i) => <li key={i}>{s.layout === "agenda" ? <><strong style={{ color: "var(--sa)", marginRight: "1cqw" }}>{String(i + 1).padStart(2, "0")}</strong>{b}</> : b}</li>)}</ul></>;
    }
  })();
  return <div className={`a-slide t-${theme}`}><div className="a-slide-inner">{body}</div>{n !== undefined && <span style={{ position: "absolute", right: "3cqw", bottom: "2.4cqw", font: "600 1.3cqw var(--f-mono)", opacity: .5 }}>{n}</span>}</div>;
}

const lines = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);

export function SlidesStudio(props: StudioProps<{ input: DeckInput; deck: Deck }>) {
  const s = useStudio("slides", props);
  const [input, setInput] = useState<DeckInput>(props.initial?.input ?? DEFAULT);
  const [deck, setDeck] = useState<Deck>(props.initial?.deck ?? draftDeck(DEFAULT));
  const [cur, setCur] = useState(0);
  const [present, setPresent] = useState<number | null>(null);
  const slide = deck.slides[Math.min(cur, deck.slides.length - 1)];
  const update = (fn: (d: Deck) => void) => { setDeck(d => { const c = structuredClone(d); fn(c); return c; }); s.setDirty(true); };
  const patch = (p: Partial<Slide>) => update(d => { Object.assign(d.slides[cur], p); });

  const close = useCallback(() => { setPresent(null); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); }, []);
  useEffect(() => {
    if (present === null) return;
    const k = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); setPresent(p => Math.min(deck.slides.length - 1, (p ?? 0) + 1)); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) setPresent(p => Math.max(0, (p ?? 0) - 1));
      if (e.key === "Escape") close();
    };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [present, deck.slides.length, close]);

  function exportHtml() {
    const css = [...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules].map(r => r.cssText); } catch { return []; } }).filter(t => /a-slide|\.t-|s-kicker|s-stat|s-quote|font-face|:root/.test(t)).join("\n");
    const slides = document.getElementById("print-deck")?.innerHTML ?? "";
    download(`${slug(deck.title)}.html`, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${deck.title}</title><style>${css}\nbody{margin:0;background:#000;display:grid;gap:2vw;padding:2vw}.a-slide{border-radius:1vw}</style></head><body>${slides}</body></html>`, "text/html");
  }

  function fromClaude(d: unknown) {
    const x = d as Partial<Deck>;
    if (!Array.isArray(x.slides) || !x.slides.length) return;
    setDeck({ title: x.title || input.topic, subtitle: x.subtitle || "", theme: input.theme, slides: x.slides.map(sl => ({ ...blankSlide(sl.layout), ...sl, id: uid("d") })) });
    setCur(0);
  }

  return <>
    <StudioHeader eyebrow="Creator Studio · Presentations" title={deck.title}>
      <SaveButton onClick={() => s.save(deck.title, { input, deck })} saving={s.saving} dirty={s.dirty} quota={props.quota} used={props.used} hasId={!!s.id} />
      <button type="button" className="a-btn a-btn-primary a-btn-sm" onClick={() => { setPresent(cur); document.documentElement.requestFullscreen?.().catch(() => {}); }}><Maximize2 size={15} />Present</button>
      <button type="button" className="a-btn a-btn-glass a-btn-sm" onClick={() => window.print()}><Printer size={15} />Print / PDF</button>
      <ExportButton label="HTML deck" canExport={props.canExport} onClick={exportHtml} />
    </StudioHeader>

    <div className="a-studio a-no-print">
      <form className="a-card a-studio-form" onSubmit={e => e.preventDefault()}>
        <p className="a-eyebrow">Deck brief</p>
        <label className="a-field"><span>Topic</span><input className="a-input" value={input.topic} onChange={e => setInput({ ...input, topic: e.target.value })} /></label>
        <label className="a-field"><span>Audience</span><input className="a-input" value={input.audience} onChange={e => setInput({ ...input, audience: e.target.value })} /></label>
        <label className="a-field"><span>Key points <small>(comma or line separated)</small></span><textarea className="a-input" rows={3} value={input.points} onChange={e => setInput({ ...input, points: e.target.value })} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
          <label className="a-field"><span>Slides</span><input className="a-input" type="number" min={5} max={16} value={input.slides} onChange={e => setInput({ ...input, slides: +e.target.value })} /></label>
          <label className="a-field"><span>Theme</span><select className="a-input" value={deck.theme} onChange={e => { const t = e.target.value as DeckTheme; setInput({ ...input, theme: t }); update(d => { d.theme = t; }); }}>{THEMES.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}</select></label>
        </div>
        <GenerateButtons canAI={props.canAI} aiConfigured={props.aiConfigured} drafting={s.drafting}
          onTemplate={() => { setDeck(draftDeck(input)); setCur(0); s.setSource("template"); s.setDirty(true); s.toast("Deck generated"); }}
          onClaude={() => s.claude({ topic: input.topic, audience: input.audience, slides: input.slides, keyPoints: input.points }, fromClaude)} />
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "1rem", minWidth: 0 }}>
        <div className="a-thumbs" style={{ alignContent: "start", maxHeight: "78vh", overflow: "auto" }}>
          {deck.slides.map((sl, i) => <button key={sl.id} type="button" className="a-thumb" aria-current={i === cur} onClick={() => setCur(i)}><span>{i + 1}</span><SlideView s={sl} theme={deck.theme} /></button>)}
          <button type="button" className="a-btn a-btn-glass a-btn-sm" onClick={() => { update(d => { d.slides.splice(cur + 1, 0, blankSlide()); }); setCur(cur + 1); }}><Plus size={14} />Slide</button>
        </div>
        <div style={{ display: "grid", gap: "1rem", minWidth: 0, alignContent: "start" }}>
          <SlideView s={slide} theme={deck.theme} n={cur + 1} />
          <div className="a-card" style={{ display: "grid", gap: ".8rem" }}>
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", alignItems: "center" }}>
              <select className="a-input" style={{ width: "auto", minHeight: 38 }} value={slide.layout} onChange={e => patch({ ...blankSlide(e.target.value as SlideLayout, slide.title), id: slide.id, notes: slide.notes })} aria-label="Layout">{LAYOUTS.map(l => <option key={l}>{l}</option>)}</select>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={cur === 0} onClick={() => { update(d => { [d.slides[cur - 1], d.slides[cur]] = [d.slides[cur], d.slides[cur - 1]]; }); setCur(cur - 1); }} aria-label="Move up"><ArrowUp size={15} /></button>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={cur === deck.slides.length - 1} onClick={() => { update(d => { [d.slides[cur + 1], d.slides[cur]] = [d.slides[cur], d.slides[cur + 1]]; }); setCur(cur + 1); }} aria-label="Move down"><ArrowDown size={15} /></button>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => { update(d => { d.slides.splice(cur + 1, 0, { ...structuredClone(slide), id: uid("d") }); }); setCur(cur + 1); }} aria-label="Duplicate"><Copy size={15} /></button>
              <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={deck.slides.length <= 1} onClick={() => { update(d => { d.slides.splice(cur, 1); }); setCur(Math.max(0, cur - 1)); }} aria-label="Delete slide"><Trash2 size={15} /></button>
            </div>
            <label className="a-field"><span>Title</span><input className="a-input" value={slide.title} onChange={e => patch({ title: e.target.value })} /></label>
            {["title", "bullets", "agenda", "closing"].includes(slide.layout) && <label className="a-field"><span>Subtitle</span><input className="a-input" value={slide.subtitle} onChange={e => patch({ subtitle: e.target.value })} /></label>}
            {["bullets", "agenda", "process", "closing"].includes(slide.layout) && <label className="a-field"><span>{slide.layout === "process" ? "Steps" : "Bullets"} <small>(one per line)</small></span><textarea className="a-input" rows={4} value={slide.bullets.join("\n")} onChange={e => patch({ bullets: lines(e.target.value) })} /></label>}
            {slide.layout === "stat" && <label className="a-field"><span>Stats <small>(value | label, one per line)</small></span><textarea className="a-input" rows={3} value={slide.stats.map(x => `${x.value} | ${x.label}`).join("\n")} onChange={e => patch({ stats: lines(e.target.value).map(l => { const [value, ...rest] = l.split("|"); return { value: value.trim(), label: rest.join("|").trim() }; }) })} /></label>}
            {slide.layout === "quote" && <><label className="a-field"><span>Quote</span><textarea className="a-input" rows={2} value={slide.quote} onChange={e => patch({ quote: e.target.value })} /></label><label className="a-field"><span>Attribution</span><input className="a-input" value={slide.quoteBy} onChange={e => patch({ quoteBy: e.target.value })} /></label></>}
            {slide.layout === "compare" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>{[0, 1].map(k => <label key={k} className="a-field"><span>Column {k + 1} <small>(heading, then points)</small></span><textarea className="a-input" rows={4} value={[slide.columns[k]?.heading ?? "", ...(slide.columns[k]?.points ?? [])].join("\n")} onChange={e => { const [heading = "", ...points] = lines(e.target.value); const cols = [...slide.columns]; cols[k] = { heading, points }; patch({ columns: cols }); }} /></label>)}</div>}
            <label className="a-field"><span>Speaker notes</span><textarea className="a-input" rows={2} value={slide.notes} onChange={e => patch({ notes: e.target.value })} /></label>
          </div>
        </div>
      </div>
    </div>

    {/* Print / export view: every slide, one per page */}
    <div id="print-deck" className="a-print-slides" style={{ position: "absolute", left: -99999, top: 0, width: 1280 }} aria-hidden="true">{deck.slides.map((sl, i) => <SlideView key={sl.id} s={sl} theme={deck.theme} n={i + 1} />)}</div>
    <style>{`@media print { #print-deck { position: static !important; width: 100% !important; } }`}</style>

    {present !== null && <div className="a-present" role="dialog" aria-label="Presentation" onClick={() => setPresent(p => Math.min(deck.slides.length - 1, (p ?? 0) + 1))}>
      <SlideView s={deck.slides[present]} theme={deck.theme} n={present + 1} />
      <button type="button" onClick={e => { e.stopPropagation(); close(); }} className="a-btn a-btn-glass a-btn-sm" style={{ position: "fixed", top: 16, right: 16 }} aria-label="Exit presentation"><X size={15} />Esc</button>
      <div style={{ position: "fixed", bottom: 14, left: "50%", transform: "translateX(-50%)", color: "#fff9", font: "600 .75rem var(--f-mono)" }}>{present + 1} / {deck.slides.length} · ← → to navigate</div>
    </div>}
    {s.toastEl}
  </>;
}
