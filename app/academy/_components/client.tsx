"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Check, Clock, Lock, Menu, Search, Sparkles, X } from "lucide-react";
import { PLANS, cheapestPlanFor, canAccessCourse, type Billing } from "../../../lib/academy/plans";
import type { CatalogCourse, Family } from "../../../lib/academy/catalog";

export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle("lock-scroll", open); return () => document.documentElement.classList.remove("lock-scroll"); }, [open]);
  return <>
    <button type="button" className="a-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? <X size={18} /> : <Menu size={18} />}</button>
    {open && <nav className="a-mnav" aria-label="Academy mobile">{items.map(i => <Link key={i.href} href={i.href} onClick={() => setOpen(false)}>{i.label}</Link>)}</nav>}
  </>;
}

export function Rotator({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI(x => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  return <span className="a-rotator" aria-live="polite">{words.map((w, k) => <span key={w} data-on={k === i} aria-hidden={k !== i} className="a-grad">{w}</span>)}</span>;
}

export function StageExplorer({ stages, help }: { stages: string[]; help: Record<string, string> }) {
  const [on, setOn] = useState(4);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setOn(x => (x + 1) % stages.length), 2600);
    return () => clearInterval(t);
  }, [auto, stages.length]);
  const s = stages[on];
  return <div onPointerEnter={() => setAuto(false)}>
    <div className="a-stages" role="group" aria-label="Mission stages">
      {stages.map((x, k) => <button key={x} type="button" className="a-stage" aria-pressed={k === on} data-done={k < on} onClick={() => { setAuto(false); setOn(k); }}><span>{String(k + 1).padStart(2, "0")}</span>{x}</button>)}
    </div>
    <div className="a-card" style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1.2rem", alignItems: "center" }}>
      <div className="a-icon-tile" style={{ width: 56, height: 56, fontWeight: 800, fontSize: "1.1rem" }}>{String(on + 1).padStart(2, "0")}</div>
      <div><p className="a-eyebrow">Stage {on + 1} of {stages.length}</p><h3 className="a-h3" style={{ fontSize: "1.5rem", marginTop: ".4rem" }}>{s}</h3><p className="a-muted" style={{ marginTop: ".3rem", lineHeight: 1.6 }}>{help[s]}</p></div>
      <div style={{ display: "flex", gap: ".4rem" }}>
        <button type="button" className="a-btn a-btn-glass a-btn-sm" aria-label="Previous stage" onClick={() => { setAuto(false); setOn(x => (x - 1 + stages.length) % stages.length); }}><ArrowLeft size={15} /></button>
        <button type="button" className="a-btn a-btn-glass a-btn-sm" aria-label="Next stage" onClick={() => { setAuto(false); setOn(x => (x + 1) % stages.length); }}><ArrowRight size={15} /></button>
      </div>
    </div>
    <div className="a-meter" style={{ marginTop: ".9rem" }}><i style={{ width: `${((on + 1) / stages.length) * 100}%` }} /></div>
  </div>;
}

/** Mission taster from the Academy prototype: find the anomaly in a fictional support dashboard. */
const ROWS = [
  { day: "Mon", tickets: 142, solved: 138, csat: 4.6, time: "3h 10m" },
  { day: "Tue", tickets: 151, solved: 147, csat: 4.5, time: "3h 22m" },
  { day: "Wed", tickets: 148, solved: 61, csat: 4.4, time: "3h 05m" },
  { day: "Thu", tickets: 139, solved: 135, csat: 4.7, time: "2h 58m" },
  { day: "Fri", tickets: 160, solved: 154, csat: 4.5, time: "3h 40m" },
];
export function AnomalyDemo() {
  const [pick, setPick] = useState<number | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const right = pick === 2;
  return <div className="a-card" style={{ padding: 0 }}>
    <div style={{ padding: "1.2rem 1.4rem", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
      <div><p className="a-eyebrow">Mission taster · INVESTIGATE</p><h3 className="a-h3" style={{ marginTop: ".4rem" }}>Customer Support Dashboard — identify the anomaly</h3></div>
      <span className="a-chip a-chip-amber">Fictional data</span>
    </div>
    <div className="a-table-wrap" style={{ border: 0, borderRadius: 0 }}>
      <table className="a-table">
        <thead><tr><th>Day</th><th>Tickets</th><th>Solved</th><th>CSAT</th><th>Avg. first response</th><th /></tr></thead>
        <tbody>{ROWS.map((r, k) => <tr key={r.day} style={{ background: pick === k ? (right ? "#34d39914" : "#f43f5e12") : undefined }}>
          <td><strong>{r.day}</strong></td><td>{r.tickets}</td><td>{r.solved}</td><td>{r.csat}</td><td>{r.time}</td>
          <td style={{ textAlign: "right" }}><button type="button" className="a-btn a-btn-glass a-btn-sm" onClick={() => { setPick(k); setWhy(null); }} aria-pressed={pick === k}>This one</button></td>
        </tr>)}</tbody>
      </table>
    </div>
    <div style={{ padding: "1.2rem 1.4rem", display: "grid", gap: ".8rem" }}>
      {pick === null && <p className="a-muted">Pick the day that needs investigating. There is one clear signal.</p>}
      {pick !== null && !right && <div className="a-alert a-alert-warn">Not quite. Look at the relationship between tickets received and tickets solved.</div>}
      {right && <>
        <div className="a-alert a-alert-ok"><Check size={18} /> Wednesday: 148 tickets but only 61 solved — a 41% resolution rate against ~97% on other days. CSAT hasn&apos;t dropped yet, which suggests a reporting or tooling issue rather than service quality.</div>
        <p style={{ fontWeight: 700 }}>What would you do next?</p>
        <div className="a-quiz" style={{ display: "grid", gap: ".5rem" }}>
          {["Report it to the manager as poor staff performance", "Check whether the ticketing export or status workflow failed on Wednesday", "Ignore it — CSAT is fine"].map((o, k) => <button key={o} type="button" data-state={why === o ? (k === 1 ? "right" : "wrong") : undefined} onClick={() => setWhy(o)}><span className="a-mono a-muted">{String.fromCharCode(65 + k)}</span>{o}</button>)}
        </div>
        {why && <p className="a-muted" style={{ lineHeight: 1.6 }}>{why.startsWith("Check") ? "Exactly — INVESTIGATE before you conclude. In a full mission you would TRY a query, BUILD a short report, BREAK it with edge cases and DEFEND your conclusion to a reviewer." : "A professional checks the evidence before blaming people or dismissing a signal. Try again."}</p>}
      </>}
    </div>
  </div>;
}

export function PricingCards({ signedIn, currentPlan }: { signedIn: boolean; currentPlan?: string }) {
  const [billing, setBilling] = useState<Billing>("monthly");
  return <div style={{ display: "grid", gap: "1.6rem" }}>
    <div style={{ display: "flex", justifyContent: "center", gap: ".8rem", alignItems: "center", flexWrap: "wrap" }}>
      <div className="a-seg" role="tablist" aria-label="Billing period">
        <button type="button" role="tab" aria-selected={billing === "monthly"} onClick={() => setBilling("monthly")}>Monthly</button>
        <button type="button" role="tab" aria-selected={billing === "annual"} onClick={() => setBilling("annual")}>Annual</button>
      </div>
      <span className="a-chip a-chip-green">Annual = 2 months free</span>
    </div>
    <div className="a-price-grid">
      {PLANS.map((p, i) => {
        const amount = billing === "annual" ? p.annual : p.monthly;
        const current = currentPlan === p.id;
        const href = !signedIn ? `/academy/register?plan=${p.id}` : p.monthly === 0 ? "/academy/learn" : `/academy/checkout?plan=${p.id}&billing=${billing}`;
        return <div key={p.id} className={`a-card a-price ${p.featured ? "a-price-featured a-beam" : ""}`} data-reveal="up" style={{ "--i": i } as React.CSSProperties}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".5rem" }}>
            <h3 className="a-h3" style={{ fontSize: "1.25rem" }}>{p.name}</h3>
            {p.featured ? <span className="a-chip a-chip-violet"><Sparkles size={12} />Most complete</span> : p.id === "creator" ? <span className="a-chip a-chip-cyan">For teachers</span> : null}
          </div>
          <p className="a-muted" style={{ fontSize: ".9rem", lineHeight: 1.5, minHeight: "2.7em" }}>{p.tagline}</p>
          <div className="a-price-amt"><span className="a-muted" style={{ fontWeight: 700 }}>AED</span><strong>{amount.toLocaleString()}</strong><span className="a-muted">/{billing === "annual" ? "year" : "month"}</span></div>
          <p className="a-muted" style={{ fontSize: ".75rem", marginTop: "-.6rem" }}>{amount ? "+5% VAT · indicative until payments go live" : "Free forever · no card needed"}</p>
          <Link href={href} className={`a-btn a-btn-block ${p.featured ? "a-btn-primary" : "a-btn-glass"}`} aria-disabled={current}>{current ? "Your current package" : !signedIn ? (p.monthly ? `Register & choose ${p.name}` : "Register free") : p.monthly ? `Choose ${p.name}` : "Go to dashboard"}</Link>
          <ul className="a-check">{p.highlights.map(h => <li key={h}><Check size={16} />{h}</li>)}</ul>
          <p className="a-muted" style={{ fontSize: ".75rem", marginTop: "auto" }}>Support response: {p.support} · {p.audience}</p>
        </div>;
      })}
    </div>
  </div>;
}

const FAMILY_TABS: (Family | "All")[] = ["All", "Technology", "Foundation", "Professional", "Advanced", "Assessment"];
export function CatalogueBrowser({ courses, initialFamily = "All", authoredCodes }: { courses: CatalogCourse[]; initialFamily?: Family | "All"; authoredCodes: string[] }) {
  const [family, setFamily] = useState<Family | "All">(initialFamily);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("All");
  const list = useMemo(() => courses.filter(c => (family === "All" || c.family === family) && (level === "All" || c.level === level) && `${c.code} ${c.title}`.toLowerCase().includes(q.trim().toLowerCase())), [courses, family, q, level]);
  return <div style={{ display: "grid", gap: "1.4rem" }}>
    <div style={{ display: "flex", gap: ".8rem", flexWrap: "wrap", alignItems: "center" }}>
      <div className="a-seg" role="tablist" aria-label="Family">{FAMILY_TABS.map(f => <button key={f} type="button" role="tab" aria-selected={family === f} onClick={() => setFamily(f)}>{f}</button>)}</div>
      <label style={{ position: "relative", flex: "1 1 240px" }}><span className="sr-only">Search units</span><Search size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--mute)" }} /><input className="a-input" style={{ paddingLeft: "2.5rem" }} placeholder="Search by title or code…" value={q} onChange={e => setQ(e.target.value)} /></label>
      <label><span className="sr-only">Level</span><select className="a-input" value={level} onChange={e => setLevel(e.target.value)}>{["All", "L1", "L2", "L3", "L4", "L5"].map(l => <option key={l}>{l}</option>)}</select></label>
    </div>
    <p className="a-muted" style={{ fontSize: ".85rem" }} aria-live="polite">{list.length} unit{list.length === 1 ? "" : "s"}</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1rem" }}>
      {list.map(c => <CourseCard key={c.code} c={c} authored={authoredCodes.includes(c.code)} />)}
    </div>
    {!list.length && <div className="a-card" style={{ textAlign: "center" }}>No units match. <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => { setQ(""); setFamily("All"); setLevel("All"); }}>Clear filters</button></div>}
  </div>;
}

const HUES: Record<string, [string, string]> = { Technology: ["#3b82f6", "#22d3ee"], Foundation: ["#10b981", "#a3e635"], Professional: ["#f59e0b", "#f43f5e"], Advanced: ["#8b5cf6", "#ec4899"], Assessment: ["#e10613", "#f97316"] };
export function CourseCard({ c, authored, locked, href }: { c: CatalogCourse; authored?: boolean; locked?: boolean; href?: string }) {
  const [a, b] = HUES[c.family] ?? HUES.Technology;
  const minPlan = cheapestPlanFor(p => canAccessCourse(p, c));
  return <Link href={href ?? `/academy/courses/${c.code}`} className="a-card" data-spotlight style={{ "--a": a, display: "flex", flexDirection: "column", gap: ".9rem", minHeight: 230 } as React.CSSProperties}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className="a-icon-tile" style={{ "--a": a, "--b": b, width: 40, height: 40, fontSize: ".7rem", fontWeight: 800 } as React.CSSProperties}>{c.code.split("-")[0]}</span>
      <span className="a-chip">{c.code}</span>
    </div>
    <h3 className="a-h3" style={{ lineHeight: 1.3 }}>{c.title}</h3>
    <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginTop: "auto" }}>
      <span className="a-chip"><Clock size={11} />{c.hours}h</span>
      <span className="a-chip">{c.level}</span>
      {authored ? <span className="a-chip a-chip-green">Full lessons</span> : <span className={`a-chip ${c.maturity === "Active" ? "a-chip-green" : "a-chip-amber"}`}>{c.maturity}</span>}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".8rem" }} className="a-muted">
      <span>{locked ? <><Lock size={12} style={{ display: "inline", marginRight: 4 }} />Needs {minPlan.name}</> : `From ${minPlan.name}`}</span>
      <ArrowRight size={15} />
    </div>
  </Link>;
}

export function CourseCarousel({ courses, authoredCodes }: { courses: CatalogCourse[]; authoredCodes: string[] }) {
  const [ref, api] = useEmblaCarousel({ align: "start", loop: true, dragFree: true });
  const [sel, setSel] = useState(0);
  const onSel = useCallback(() => api && setSel(api.selectedScrollSnap()), [api]);
  useEffect(() => { if (!api) return; api.on("select", onSel); return () => { api.off("select", onSel); }; }, [api, onSel]);
  useEffect(() => {
    if (!api || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => api.scrollNext(), 4200);
    return () => clearInterval(t);
  }, [api]);
  return <div>
    <div ref={ref} style={{ overflow: "hidden" }} aria-roledescription="carousel">
      <div style={{ display: "flex", gap: "1rem" }}>
        {courses.map(c => <div key={c.code} style={{ flex: "0 0 min(82%, 300px)" }}><CourseCard c={c} authored={authoredCodes.includes(c.code)} /></div>)}
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.2rem" }}>
      <div style={{ display: "flex", gap: ".35rem" }}>{courses.map((c, k) => <button key={c.code} type="button" aria-label={`Go to ${c.title}`} onClick={() => api?.scrollTo(k)} style={{ width: k === sel ? 22 : 8, height: 8, borderRadius: 99, border: 0, background: k === sel ? "var(--violet-2)" : "rgb(255 255 255 / .15)", transition: "width .3s", cursor: "pointer" }} />)}</div>
      <div style={{ display: "flex", gap: ".4rem" }}>
        <button type="button" className="a-btn a-btn-glass a-btn-sm" aria-label="Previous" onClick={() => api?.scrollPrev()}><ArrowLeft size={15} /></button>
        <button type="button" className="a-btn a-btn-glass a-btn-sm" aria-label="Next" onClick={() => api?.scrollNext()}><ArrowRight size={15} /></button>
      </div>
    </div>
  </div>;
}

export function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [on, setOn] = useState(tabs[0].id);
  return <div style={{ display: "grid", gap: "1.4rem" }}>
    <div className="a-seg" role="tablist">{tabs.map(t => <button key={t.id} type="button" role="tab" aria-selected={on === t.id} onClick={() => setOn(t.id)}>{t.label}</button>)}</div>
    <div role="tabpanel">{tabs.find(t => t.id === on)?.content}</div>
  </div>;
}
