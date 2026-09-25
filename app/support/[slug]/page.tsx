import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { SiteHeader, SiteFooter } from "../../site-shell";
import { SectionHead } from "../../_ui/sections";
import { ARTICLES } from "../../../lib/kb";

export function generateStaticParams() { return ARTICLES.map(a => ({ slug: a.slug })); }

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = ARTICLES.find(x => x.slug === slug);
  if (!a) notFound();
  return <main className="public-site" style={{ "--a": "#2563eb", "--b": "#0d9488" } as CSSProperties}>
    <SiteHeader />
    <section className="section" style={{ paddingTop: "8rem" }}>
      <div className="shell" style={{ maxWidth: 860 }}>
        <Link href="/support" className="link-arrow" style={{ marginTop: 0 }}>← Help center</Link>
        <SectionHead index={a.category} kicker="Guide" title={a.title} />
        <dl className="kb-meta"><dt>Purpose</dt><dd>{a.purpose}</dd><dt>Who this is for</dt><dd>{a.audience}</dd><dt>Permissions required</dt><dd>{a.permissions}</dd></dl>
        <h3 className="job-h">Steps</h3><ol className="kb-steps">{a.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        <h3 className="job-h">Expected result</h3><p className="job-p">{a.result}</p>
        <h3 className="job-h">Troubleshooting</h3><ul className="kb-steps">{a.troubleshooting.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <p className="app-note" style={{ marginTop: "2rem" }}>Still stuck? <Link href="/workspace/support" style={{ textDecoration: "underline" }}>Open a support ticket</Link>.</p>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
