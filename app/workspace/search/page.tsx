import Link from "next/link";
import { AppShell, Btn, Empty, PageHead, Panel } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { searchAll } from "../../../lib/search";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { ctx, info } = await loadApp();
  const q = ((await searchParams).q ?? "").slice(0, 80);
  const hits = await searchAll(ctx, q);
  const groups = [...new Set(hits.map(h => h.group))];
  return <AppShell info={info} active="search">
    <PageHead kicker={`Search · ${info.context}`} title="Find anything you can access" lede="Results are filtered by your current context and permissions before they are counted, so nothing outside your access is revealed." />
    <Panel>
      <form className="app-inline" role="search"><input name="q" defaultValue={q} placeholder="Search projects, missions, evidence, jobs, files, tickets…" aria-label="Search" style={{ flex: 1 }} autoFocus /><Btn>Search</Btn></form>
    </Panel>
    {q.length >= 2 && (hits.length ? groups.map(g => <Panel key={g} title={`${g} (${hits.filter(h => h.group === g).length})`}>
      <div className="app-rows">{hits.filter(h => h.group === g).map((h, i) => <Link key={i} href={h.href} className="app-row"><div className="app-row-main"><strong>{h.title}</strong><small>{h.detail}</small></div></Link>)}</div>
    </Panel>) : <Panel><Empty title={`No results for “${q}”`}>Try a project name, a course code such as DB-02, a skill or an invoice number.</Empty></Panel>)}
  </AppShell>;
}
