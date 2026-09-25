import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../site-shell";

const tools = [["Canva", "Create a clear evidence board for a mission.", "https://www.canva.com"], ["Spreadsheet template", "Prepare fictional records and a test log.", null], ["Figma", "Sketch a learner or customer journey.", null], ["GitHub", "Document decisions and test evidence.", null]] as const;
const labs = ["Virtual office", "Accounting", "Freight forwarding", "Real estate", "HR", "Banking operations", "Insurance operations", "Document processing", "Procurement", "Customer service"];

export default function Tools() {
  return <main className="site">
    <SiteHeader />
    <section className="page-hero"><div className="wrap">
      <nav className="crumb" aria-label="Breadcrumb"><Link href="/academy">Academy</Link><span>/</span><span>Tool library</span></nav>
      <h1 className="h1">Tool library</h1>
      <p className="lede">The right tool for each practical task. External tools have their own accounts and privacy terms; listing one here does not mean it is integrated.</p>
    </div></section>
    <section className="band-tight"><div className="wrap">
      <div className="cols cols-2">{tools.map(([name, description, url]) => <article key={name} className="card"><h2 className="h3">{name}</h2><p>{description}</p>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="link" style={{ marginTop: 14 }}>Open {name} ↗</a> : <p className="small muted" style={{ marginTop: 14 }}>Set up by your reviewer when a mission needs it.</p>}</article>)}</div>
      <div className="card" style={{ marginTop: 28 }}><h2 className="h3">Simulation labs with fictional data</h2><p>On the curriculum roadmap; not live integrations yet.</p><div className="tags" style={{ marginTop: 16 }}>{labs.map(l => <span key={l} className="tag">{l}</span>)}</div></div>
    </div></section>
    <SiteFooter />
  </main>;
}
