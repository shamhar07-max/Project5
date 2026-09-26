import Link from "next/link";
import type { CSSProperties } from "react";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, Clapperboard, FileText, LayoutTemplate, Lock, Presentation, Sparkles, Trash2 } from "lucide-react";
import { getDb } from "../../../../db";
import { academyCreations } from "../../../../db/schema";
import { requireAcademyAccount } from "../../../../lib/academy/auth";
import { accessFor } from "../../../../lib/academy/access";
import { aiEnabled } from "../../../../lib/academy/ai";
import { TOOL_META, canUseTool, cheapestPlanFor, hasFeature, type StudioTool } from "../../../../lib/academy/plans";
import { deleteCreationAction } from "../../actions";

export const metadata = { title: "Creator Studio · DigitalBurj Academy" };
const ICON: Record<StudioTool, typeof FileText> = { video: Clapperboard, lesson: FileText, course: LayoutTemplate, slides: Presentation };
const HUE: Record<StudioTool, [string, string]> = { video: ["#e10613", "#f97316"], lesson: ["#7c3aed", "#a78bfa"], course: ["#0891b2", "#22d3ee"], slides: ["#4f46e5", "#a78bfa"] };

export default async function StudioHome() {
  const account = await requireAcademyAccount("/academy/learn/studio");
  const { plan } = await accessFor(account.id);
  const items = await getDb().select({ id: academyCreations.id, tool: academyCreations.tool, title: academyCreations.title, source: academyCreations.source, updatedAt: academyCreations.updatedAt }).from(academyCreations).where(eq(academyCreations.accountId, account.id)).orderBy(desc(academyCreations.updatedAt));
  const tools = Object.keys(TOOL_META) as StudioTool[];
  return <>
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
      <div><span className="a-eyebrow">Creator Studio</span><h1 className="a-h2" style={{ fontSize: "2.2rem", marginTop: ".5rem" }}>What will you create today?</h1></div>
      <span className={`a-chip ${aiEnabled() && hasFeature(plan, "ai") ? "a-chip-green" : ""}`}><Sparkles size={12} />{aiEnabled() ? (hasFeature(plan, "ai") ? "Claude drafting available" : "Claude drafting: Educator & Creator / Professional") : "Template engine (Claude drafting not configured)"}</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
      {tools.map((t, i) => { const I = ICON[t]; const ok = canUseTool(plan, t); const n = items.filter(x => x.tool === t).length; return <Link key={t} href={ok ? TOOL_META[t].href : `/academy/checkout?plan=${cheapestPlanFor(p => p.tools.includes(t)).id}`} className={`a-card ${ok ? "" : "a-locked"}`} data-spotlight data-reveal="up" style={{ "--a": HUE[t][0], "--i": i, display: "grid", gap: ".8rem", minHeight: 210 } as CSSProperties}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span className="a-icon-tile" style={{ "--a": HUE[t][0], "--b": HUE[t][1] } as CSSProperties}><I size={22} /></span>{ok ? <span className="a-chip">{n}{plan.toolQuota ? ` / ${plan.toolQuota}` : ""} saved</span> : <span className="a-chip a-chip-amber"><Lock size={11} />{cheapestPlanFor(p => p.tools.includes(t)).name}</span>}</div>
        <h2 className="a-h3" style={{ fontSize: "1.15rem" }}>{TOOL_META[t].name}</h2>
        <p className="a-muted" style={{ fontSize: ".88rem", lineHeight: 1.55 }}>{TOOL_META[t].blurb}</p>
        <span style={{ display: "inline-flex", gap: ".35rem", alignItems: "center", fontWeight: 700, fontSize: ".85rem", marginTop: "auto", color: ok ? "#c4b5fd" : "var(--mute)" }}>{ok ? "Create new" : "Unlock"} <ArrowRight size={14} /></span>
      </Link>; })}
    </div>
    <section className="a-card">
      <h2 className="a-h3">Saved projects</h2>
      {items.length ? <div className="a-list" style={{ marginTop: ".5rem" }}>{items.map(x => { const t = x.tool as StudioTool; const I = ICON[t] ?? FileText; return <div key={x.id}>
        <I size={18} color="#a78bfa" />
        <Link href={`${TOOL_META[t]?.href ?? "/academy/learn/studio"}?id=${x.id}`} style={{ flex: 1, fontWeight: 650 }}>{x.title}<br /><small className="a-muted" style={{ fontWeight: 500 }}>{TOOL_META[t]?.short} · {x.source === "claude" ? "Claude draft, edited" : "Template draft"} · updated {x.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</small></Link>
        <form action={deleteCreationAction}><input type="hidden" name="id" value={x.id} /><button className="a-btn a-btn-ghost a-btn-sm" aria-label={`Delete ${x.title}`}><Trash2 size={15} /></button></form>
      </div>; })}</div> : <p className="a-muted" style={{ marginTop: ".6rem" }}>No saved projects yet. Pick a tool above — your first draft takes seconds.</p>}
    </section>
  </>;
}
