import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "../site-shell";
import { SectionHead } from "../_ui/sections";
import { ARTICLES, CATEGORIES } from "../../lib/kb";

export default async function HelpCenter({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").toLowerCase().slice(0, 60);
  const shown = ARTICLES.filter(a => !q || `${a.title} ${a.purpose} ${a.steps.join(" ")}`.toLowerCase().includes(q));
  return <main className="site" style={{ "--a": "#2563eb", "--b": "#0d9488" } as CSSProperties}>
    <SiteHeader />
    <section className="band-tight page-top">
      <div className="wrap">
        <SectionHead index="?" kicker="Help center" title={<>Answers, <em>step by step.</em></>}><p>Can&apos;t find it? <Link href="/workspace/support" style={{ textDecoration: "underline" }}>Open a support ticket</Link> — it keeps your division and organization context.</p></SectionHead>
        <form className="board-filters"><input name="q" defaultValue={q} placeholder="Search help articles" aria-label="Search help" /><button className="btn btn-primary">Search</button></form>
        {CATEGORIES.map(c => { const items = shown.filter(a => a.category === c); return items.length ? <div key={c} style={{ marginBottom: "1.6rem" }}><h3 className="h3 subhead">{c}</h3><div className="board-list">{items.map(a => <Link key={a.slug} href={`/support/${a.slug}`} className="board-item"><div><strong>{a.title}</strong><span>{a.purpose}</span></div><span /><ArrowUpRight size={20} className="board-arrow" /></Link>)}</div></div> : null; })}
        {!shown.length && <p className="app-note">No articles match “{q}”.</p>}
      </div>
    </section>
    <SiteFooter />
  </main>;
}
