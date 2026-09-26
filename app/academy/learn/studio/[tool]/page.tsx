import Link from "next/link";
import { notFound } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { Lock } from "lucide-react";
import { getDb } from "../../../../../db";
import { academyCreations } from "../../../../../db/schema";
import { requireAcademyAccount } from "../../../../../lib/academy/auth";
import { accessFor } from "../../../../../lib/academy/access";
import { aiEnabled } from "../../../../../lib/academy/ai";
import { TOOL_META, canUseTool, cheapestPlanFor, hasFeature, type StudioTool } from "../../../../../lib/academy/plans";
import { VideoStudio } from "../../../_components/studio-video";
import { LessonStudio } from "../../../_components/studio-lesson";
import { CourseStudio } from "../../../_components/studio-course";
import { SlidesStudio } from "../../../_components/studio-slides";

const SLUG: Record<string, StudioTool> = { video: "video", "lesson-plan": "lesson", course: "course", slides: "slides" };

export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }) {
  const t = SLUG[(await params).tool];
  return { title: t ? `${TOOL_META[t].name} · DigitalBurj Academy` : "Studio" };
}

export default async function ToolPage({ params, searchParams }: { params: Promise<{ tool: string }>; searchParams: Promise<{ id?: string }> }) {
  const tool = SLUG[(await params).tool];
  if (!tool) notFound();
  const { id } = await searchParams;
  const account = await requireAcademyAccount(TOOL_META[tool].href);
  const { plan } = await accessFor(account.id);
  if (!canUseTool(plan, tool)) {
    const need = cheapestPlanFor(p => p.tools.includes(tool));
    return <div className="a-card a-beam" style={{ maxWidth: 640, margin: "3rem auto", textAlign: "center", display: "grid", gap: "1rem", justifyItems: "center", padding: "2.5rem" }}>
      <span className="a-icon-tile" style={{ width: 56, height: 56 }}><Lock size={24} /></span>
      <h1 className="a-h2" style={{ fontSize: "1.9rem" }}>{TOOL_META[tool].name} is locked</h1>
      <p className="a-muted" style={{ lineHeight: 1.6 }}>{TOOL_META[tool].blurb} It&apos;s included in {need.name}{need.id !== "professional" ? " and Professional" : ""}. You&apos;re on {plan.name}.</p>
      <div style={{ display: "flex", gap: ".6rem" }}><Link href={`/academy/checkout?plan=${need.id}`} className="a-btn a-btn-primary">Upgrade to {need.name}</Link><Link href="/academy/learn/studio" className="a-btn a-btn-glass">Back to studio</Link></div>
    </div>;
  }
  const db = getDb();
  const row = id ? await db.select().from(academyCreations).where(and(eq(academyCreations.id, id), eq(academyCreations.accountId, account.id), eq(academyCreations.tool, tool))).get() : undefined;
  const used = await db.select({ n: count() }).from(academyCreations).where(and(eq(academyCreations.accountId, account.id), eq(academyCreations.tool, tool))).get();
  const common = {
    id: row?.id ?? null, initial: row ? JSON.parse(row.data) : null,
    canAI: aiEnabled() && hasFeature(plan, "ai"), aiConfigured: aiEnabled(), canExport: hasFeature(plan, "export"),
    quota: plan.toolQuota, used: used?.n ?? 0, planName: plan.name,
  };
  return tool === "video" ? <VideoStudio {...common} /> : tool === "lesson" ? <LessonStudio {...common} /> : tool === "course" ? <CourseStudio {...common} /> : <SlidesStudio {...common} />;
}
