// DigitalBurj Academy packages and what each one unlocks.
//
// A package is a product record; access is always decided from an *active
// entitlement* on the server, never from the package a visitor clicked. Prices
// are indicative until a payment provider is configured (see the handbook's
// "Paid access required" rule): signing in or registering never unlocks paid content.
import type { CatalogCourse, Family } from "./catalog";

export type PlanId = "explorer" | "plus" | "creator" | "professional";
export type StudioTool = "video" | "lesson" | "course" | "slides";
export type Feature = "missions" | "assessment" | "evidence" | "ai" | "export";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  audience: string;
  monthly: number; // AED per month, excluding VAT
  annual: number; // AED per year (ten months' price), excluding VAT
  status: "Live" | "Pilot";
  families: Family[] | "all";
  maxLevel: number; // highest L-level unlocked inside the families above
  extraCourses?: string[];
  tools: StudioTool[];
  toolQuota: number | null; // saved projects per tool; null = unlimited
  features: Feature[];
  support: string;
  highlights: string[];
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "explorer", name: "Explorer", tagline: "Start free. See how practical learning feels.", audience: "Everyone",
    monthly: 0, annual: 0, status: "Live", families: [], maxLevel: 0, extraCourses: ["DB-00", "PF-01"],
    tools: ["lesson", "slides"], toolQuota: 3, features: [], support: "72h",
    highlights: ["DB-00 Digital Foundations & PF-01 Workplace English", "First lesson of every unit", "Lesson Plan & Presentations (3 saves each)", "Dashboard, progress & Failure Passport"],
  },
  {
    id: "plus", name: "Academy Plus", tagline: "Technology and workplace foundations, taught through missions.", audience: "Learners & career starters",
    monthly: 99, annual: 990, status: "Live", families: ["Technology", "Foundation"], maxLevel: 2,
    tools: ["lesson", "slides"], toolQuota: 20, features: ["missions", "evidence", "export"], support: "48h",
    highlights: ["All Technology units at L1–L2", "All 10 Professional Foundation units", "12-stage practical missions & evidence", "Lesson Plan & Presentations (20 saves each)"],
  },
  {
    id: "creator", name: "Educator & Creator", tagline: "Every studio tool for teachers, trainers and course creators.", audience: "Teachers & creators",
    monthly: 149, annual: 1490, status: "Live", families: [], maxLevel: 0, extraCourses: ["DB-00", "DB-01", "DB-16", "PF-01", "PF-10"],
    tools: ["video", "lesson", "course", "slides"], toolQuota: null, features: ["ai", "export"], support: "48h",
    highlights: ["Explainer Video Generator with WebM export", "AnyLessonPlan for any subject and framework", "Course Studio for Udemy-style courses", "Presentations with presenter mode", "Claude-assisted drafting when enabled"],
  },
  {
    id: "professional", name: "Professional", tagline: "The whole Academy, plus assessment and evidence.", audience: "Professionals proving capability",
    monthly: 199, annual: 1990, status: "Live", families: "all", maxLevel: 9,
    tools: ["video", "lesson", "course", "slides"], toolQuota: null, features: ["missions", "assessment", "evidence", "ai", "export"], support: "24h", featured: true,
    highlights: ["Every Technology, Professional & Advanced unit", "DB-22 assessment readiness", "Evidence centre & Capability Record", "All four studio tools, unlimited", "24-hour support"],
  },
];

export const planById = Object.fromEntries(PLANS.map(p => [p.id, p])) as Record<PlanId, Plan>;
export const isPlanId = (v: unknown): v is PlanId => typeof v === "string" && v in planById;

export const TOOL_META: Record<StudioTool, { name: string; short: string; href: string; blurb: string }> = {
  video: { name: "Explainer Video Generator", short: "Explainer Video", href: "/academy/learn/studio/video", blurb: "Script, storyboard, animate and export a narrated explainer as a WebM video." },
  lesson: { name: "AnyLessonPlan", short: "Lesson Plan", href: "/academy/learn/studio/lesson-plan", blurb: "A complete, timed lesson plan for any subject, level and teaching framework." },
  course: { name: "Course Studio", short: "Course Studio", href: "/academy/learn/studio/course", blurb: "Plan a Udemy-style course: outcomes, sections, lectures, quizzes and a quality check." },
  slides: { name: "Presentations", short: "Presentations", href: "/academy/learn/studio/slides", blurb: "Generate an editable slide deck, then present it full screen or print it to PDF." },
};

const levelOf = (c: CatalogCourse) => Number(c.level.replace(/\D/g, "")) || 1;

export function canAccessCourse(plan: Plan | null, c: CatalogCourse) {
  const p = plan ?? planById.explorer;
  if (p.extraCourses?.includes(c.code)) return true;
  if (p.families === "all") return true;
  return p.families.includes(c.family) && levelOf(c) <= p.maxLevel;
}
export const canUseTool = (plan: Plan | null, tool: StudioTool) => (plan ?? planById.explorer).tools.includes(tool);
export const hasFeature = (plan: Plan | null, f: Feature) => (plan ?? planById.explorer).features.includes(f);
/** Cheapest plan that unlocks a course or tool — used for upgrade prompts. */
export function cheapestPlanFor(test: (p: Plan) => boolean) {
  return PLANS.filter(test).sort((a, b) => a.monthly - b.monthly)[0] ?? planById.professional;
}

export const PROMO_CODE = "DIGITALBURJ100";
export const VAT_RATE = 0.05; // UAE VAT, shown at checkout
export type Billing = "monthly" | "annual";
export const priceFor = (p: Plan, billing: Billing) => (billing === "annual" ? p.annual : p.monthly);
export const termDays = (billing: Billing) => (billing === "annual" ? 365 : 30);
export const withVat = (amount: number) => Math.round(amount * (1 + VAT_RATE) * 100) / 100;
