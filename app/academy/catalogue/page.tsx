import Link from "next/link";
import { academyCourses } from "../../academy-data";
import { divisionBySlug } from "../../brand-data";
import { SiteHeader, SiteFooter } from "../../site-shell";
import { Arrow } from "../../_ui/sections";

const d = divisionBySlug.academy;

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ q?: string; family?: string; course?: string }> }) {
  const p = await searchParams;
  const selected = academyCourses.find(c => c.code === p.course);
  const query = (p.q || "").trim().toLowerCase();
  const family = p.family || "All";
  const courses = academyCourses.filter(c => (family === "All" || c.family === family) && (c.title.toLowerCase().includes(query) || c.code.toLowerCase().includes(query)));
  return <main className="site" style={{ "--a": d.hue[0] } as React.CSSProperties}>
    <SiteHeader />
    <section className="page-hero">
      <div className="wrap">
        <nav className="crumb" aria-label="Breadcrumb"><Link href="/academy">Academy</Link><span>/</span><span>Catalogue</span></nav>
        <h1 className="h1">Technology and professional learning</h1>
        <p className="lede">Units from the Academy curriculum. Planned and proposed units are listed so you can see what is coming; enrolment opens when teaching material and assessment are ready.</p>
        <form className="row" style={{ marginTop: 28, maxWidth: 760 }}>
          <input name="q" defaultValue={p.q || ""} placeholder="Search by title or code" aria-label="Search units" style={{ flex: "1 1 260px", width: "auto" }} />
          <select name="family" defaultValue={family} aria-label="Family" style={{ width: "auto" }}><option>All</option><option>Technology</option><option>Professional</option><option>Assessment</option></select>
          <button className="btn btn-primary">Search</button>
        </form>
      </div>
    </section>
    <section className="band-tight">
      <div className="wrap catalogue">
        <div className="cols cols-2" style={{ alignContent: "start" }}>
          {courses.map(c => <Link key={c.code} href={`/academy/catalogue?course=${encodeURIComponent(c.code)}${p.q ? `&q=${encodeURIComponent(p.q)}` : ""}${family !== "All" ? `&family=${family}` : ""}`} className={`card ${selected?.code === c.code ? "card-selected" : ""}`} scroll={false}>
            <div className="card-top"><span className="small num" style={{ fontWeight: 600, color: "var(--red-text)" }}>{c.code}</span><span className="pill">{c.maturity}</span></div>
            <h2 className="h3">{c.title}</h2><p className="small muted" style={{ marginTop: 8 }}>Level {c.level.replace("L", "")} · {c.hours} hours · {c.family}</p>
          </Link>)}
          {!courses.length && <p className="card">No units match that search.</p>}
        </div>
        <aside className="card catalogue-aside">
          {selected ? <>
            <span className="eyebrow">{selected.code} · {selected.family}</span>
            <h2 className="h2" style={{ fontSize: "1.7rem" }}>{selected.title}</h2>
            <dl className="kv" style={{ marginTop: 20 }}><dt>Status</dt><dd>{selected.maturity}</dd><dt>Level</dt><dd>{selected.level}</dd><dt>Learning hours</dt><dd>{selected.hours}</dd><dt>Prerequisite</dt><dd>{selected.prereq}</dd></dl>
            <p className="small muted" style={{ marginTop: 20 }}>Every unit follows the same contract: foundations, scenario practice, a practical mission and an evidence review.</p>
            <Link href={`/workspace/academy?course=${encodeURIComponent(selected.code)}`} className="btn btn-primary" style={{ marginTop: 20, width: "100%" }}>Open in my learning <Arrow /></Link>
          </> : <><h2 className="h3">Choose a unit</h2><p className="small muted" style={{ marginTop: 8 }}>Select a unit to see its level, prerequisite, learning hours and status.</p></>}
        </aside>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
