"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, count, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../../db";
import { academyAccounts, academyActivity, academyCouponRedemptions, academyCreations, academyOrders, academyPassport, academyProgress } from "../../db/schema";
import { academyAuthReady, checkPassword, clearFailures, endSession, getAcademyAccount, hashPassword, noteFailure, requireAcademyAccount, safeNext, signInBlocked, startSession } from "../../lib/academy/auth";
import { accessFor, grantPlan, logActivity } from "../../lib/academy/access";
import { canAccessCourse, canUseTool, hasFeature, isPlanId, planById, priceFor, PROMO_CODE, termDays, type StudioTool } from "../../lib/academy/plans";
import { courseDetail, STAGES } from "../../lib/academy/curriculum";
import { aiEnabled, draftWithClaude } from "../../lib/academy/ai";
import { courseByCode } from "../../lib/academy/catalog";

export type FormState = { error?: string; fields?: Record<string, string> } | null;

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(160);
const password = z.string().min(10, "Use at least 10 characters.").max(200)
  .refine(p => /[a-z]/i.test(p) && /\d/.test(p), "Include at least one letter and one number.");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email, password,
  goal: z.string().max(160).optional().default(""),
  experience: z.enum(["New to digital work", "Some practical experience", "Working practitioner", "Teacher or trainer"]).optional().default("New to digital work"),
  availability: z.enum(["1–3 hours", "4–6 hours", "7+ hours"]).optional().default("1–3 hours"),
  route: z.enum(["Technology", "Professional workplace", "Teaching & content creation", "International readiness"]).optional().default("Technology"),
  progress: z.literal("on", { errorMap: () => ({ message: "Please consent to saving your learning progress and drafts." }) }),
  plan: z.string().optional(),
  terms: z.literal("on", { errorMap: () => ({ message: "Please accept the terms and privacy notice." }) }),
  marketing: z.string().optional(),
  next: z.string().optional(),
});

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  if (!academyAuthReady()) return { error: "Registration is not configured on this deployment yet (SESSION_SECRET missing)." };
  const raw = Object.fromEntries(form) as Record<string, string>;
  const fields = { name: raw.name ?? "", email: raw.email ?? "", goal: raw.goal ?? "", experience: raw.experience ?? "", availability: raw.availability ?? "", route: raw.route ?? "" };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };
  const v = parsed.data;
  const db = getDb();
  const existing = await db.select({ id: academyAccounts.id }).from(academyAccounts).where(eq(academyAccounts.email, v.email)).get();
  if (existing) return { error: "An account with this email already exists. Sign in instead.", fields };
  const id = crypto.randomUUID();
  await db.insert(academyAccounts).values({ id, email: v.email, name: v.name, passwordHash: await hashPassword(v.password), goal: v.goal, experience: v.experience, availability: v.availability, route: v.route, progressConsent: true, marketingConsent: v.marketing === "on", createdAt: new Date(), lastSignInAt: new Date() });
  await logActivity(id, "account", "Created your Academy account");
  await startSession(id);
  // New accounts start on Explorer. A chosen paid package goes to checkout — registering never unlocks it.
  if (v.plan && isPlanId(v.plan) && v.plan !== "explorer") redirect(`/academy/checkout?plan=${v.plan}`);
  redirect(safeNext(v.next, "/academy/learn?welcome=1"));
}

export async function signInAction(_: FormState, form: FormData): Promise<FormState> {
  if (!academyAuthReady()) return { error: "Sign-in is not configured on this deployment yet (SESSION_SECRET missing)." };
  const e = email.safeParse(form.get("email"));
  const fields = { email: String(form.get("email") ?? "") };
  if (!e.success) return { error: "Enter a valid email address.", fields };
  if (signInBlocked(e.data)) return { error: "Too many attempts. Wait 15 minutes and try again.", fields };
  const account = await getDb().select().from(academyAccounts).where(eq(academyAccounts.email, e.data)).get();
  const ok = await checkPassword(String(form.get("password") ?? ""), account?.passwordHash ?? null);
  if (!account || !ok) {
    noteFailure(e.data);
    return { error: account && !account.passwordHash ? "This account signs in with DigitalBurj. Use “Continue with DigitalBurj account”." : "Email or password is incorrect.", fields };
  }
  clearFailures(e.data);
  await getDb().update(academyAccounts).set({ lastSignInAt: new Date() }).where(eq(academyAccounts.id, account.id));
  await startSession(account.id);
  redirect(safeNext(String(form.get("next") ?? "")));
}

export async function signOutAction() {
  await endSession();
  redirect("/academy?signed_out=1");
}

// --------------------------------------------------------------- checkout
export type CheckoutState = { error?: string; notice?: string } | null;

export async function checkoutAction(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const account = await requireAcademyAccount("/academy/pricing");
  const planId = String(form.get("plan"));
  const billing = form.get("billing") === "annual" ? "annual" : "monthly";
  if (!isPlanId(planId)) return { error: "Choose a package." };
  const plan = planById[planId];
  if (plan.status !== "Live") return { error: "This package is not available to buy yet." };
  if (form.get("confirm") !== "on") return { error: "Please confirm the order summary." };
  const code = String(form.get("coupon") ?? "").trim();
  const price = priceFor(plan, billing);
  const db = getDb(); const now = new Date();
  const orderId = crypto.randomUUID();

  if (price === 0) {
    await db.insert(academyOrders).values({ id: orderId, accountId: account.id, plan: plan.id, billing, amount: 0, status: "free", createdAt: now, decidedAt: now });
    await grantPlan(account.id, plan, "free", orderId, null);
    await logActivity(account.id, "plan", `Switched to ${plan.name}`);
    redirect("/academy/learn?activated=explorer");
  }

  if (code) {
    if (code.toUpperCase() !== PROMO_CODE) return { error: "That promotion code is not valid." };
    const used = await db.select({ id: academyCouponRedemptions.id }).from(academyCouponRedemptions)
      .where(and(eq(academyCouponRedemptions.accountId, account.id), eq(academyCouponRedemptions.code, PROMO_CODE), eq(academyCouponRedemptions.plan, plan.id))).get();
    if (used) return { error: `You have already used ${PROMO_CODE} for ${plan.name}.` };
    await db.insert(academyOrders).values({ id: orderId, accountId: account.id, plan: plan.id, billing, amount: price, discount: price, coupon: PROMO_CODE, status: "paid", createdAt: now, decidedAt: now, decidedBy: "promotion" });
    try {
      await db.insert(academyCouponRedemptions).values({ id: crypto.randomUUID(), accountId: account.id, code: PROMO_CODE, plan: plan.id, orderId, createdAt: now });
    } catch {
      await db.update(academyOrders).set({ status: "cancelled" }).where(eq(academyOrders.id, orderId));
      return { error: `You have already used ${PROMO_CODE} for ${plan.name}.` };
    }
    await grantPlan(account.id, plan, "promotion", orderId, termDays(billing));
    await logActivity(account.id, "plan", `Activated ${plan.name} with ${PROMO_CODE}`);
    redirect(`/academy/learn?activated=${plan.id}`);
  }

  // No payment provider is connected: record the order as pending. Access starts only
  // when DigitalBurj confirms payment (Admin → Academy → Orders & access).
  // A second click never creates a duplicate: reuse an open order for the same package.
  const open = await db.select({ id: academyOrders.id }).from(academyOrders)
    .where(and(eq(academyOrders.accountId, account.id), eq(academyOrders.plan, plan.id), eq(academyOrders.billing, billing), eq(academyOrders.status, "payment_pending"))).get();
  if (open) redirect(`/academy/learn/account?order=${open.id}`);
  await db.insert(academyOrders).values({ id: orderId, accountId: account.id, plan: plan.id, billing, amount: price, status: "payment_pending", createdAt: now });
  await logActivity(account.id, "order", `Ordered ${plan.name} — payment pending`);
  redirect(`/academy/learn/account?order=${orderId}`);
}

// --------------------------------------------------------------- progress
async function progressRow(accountId: string, code: string) {
  const db = getDb();
  let row = await db.select().from(academyProgress).where(and(eq(academyProgress.accountId, accountId), eq(academyProgress.courseCode, code))).get();
  if (!row) {
    const now = new Date();
    row = { id: crypto.randomUUID(), accountId, courseCode: code, lessons: "[]", stages: "[]", startedAt: now, updatedAt: now };
    await db.insert(academyProgress).values(row).onConflictDoNothing();
  }
  return row;
}

async function requireCourse(code: string) {
  const account = await requireAcademyAccount(`/academy/learn/courses/${code}`);
  const course = courseByCode(code);
  if (!course) throw new Error("Unknown unit.");
  const { plan } = await accessFor(account.id);
  return { account, course, plan, allowed: canAccessCourse(plan, course) };
}

export async function toggleLessonAction(code: string, lessonId: string, done: boolean) {
  const { account, course, allowed } = await requireCourse(code);
  const detail = courseDetail(code)!;
  const first = detail.modules[0]?.lessons[0]?.id;
  if (!allowed && lessonId !== first) throw new Error("Your package does not include this unit.");
  if (!detail.modules.some(m => m.lessons.some(l => l.id === lessonId))) throw new Error("Unknown lesson.");
  const row = await progressRow(account.id, code);
  const set = new Set<string>(JSON.parse(row.lessons));
  if (done) set.add(lessonId); else set.delete(lessonId);
  await getDb().update(academyProgress).set({ lessons: JSON.stringify([...set]), updatedAt: new Date() }).where(eq(academyProgress.id, row.id));
  if (done) await logActivity(account.id, "lesson", `${course.code} · ${detail.modules.flatMap(m => m.lessons).find(l => l.id === lessonId)?.title}`);
  revalidatePath(`/academy/learn/courses/${code}`);
  return [...set];
}

export async function toggleStageAction(code: string, stage: string, done: boolean) {
  const { account, course, plan, allowed } = await requireCourse(code);
  if (!allowed) throw new Error("Your package does not include this unit.");
  if (!hasFeature(plan, "missions") && !plan.extraCourses?.includes(code)) throw new Error("Missions are included from the Learner package.");
  if (!STAGES.includes(stage)) throw new Error("Unknown stage.");
  const row = await progressRow(account.id, code);
  const set = new Set<string>(JSON.parse(row.stages));
  if (done) set.add(stage); else set.delete(stage);
  await getDb().update(academyProgress).set({ stages: JSON.stringify(STAGES.filter(s => set.has(s))), updatedAt: new Date() }).where(eq(academyProgress.id, row.id));
  if (done) await logActivity(account.id, "stage", `${course.code} mission · ${stage}`);
  revalidatePath(`/academy/learn/courses/${code}`);
  return STAGES.filter(s => set.has(s));
}

// --------------------------------------------------------------- studio
const TOOLS: StudioTool[] = ["video", "lesson", "course", "slides"];

async function requireTool(tool: StudioTool) {
  if (!TOOLS.includes(tool)) throw new Error("Unknown tool.");
  const account = await getAcademyAccount();
  if (!account) throw new Error("Please sign in again.");
  const { plan } = await accessFor(account.id);
  if (!canUseTool(plan, tool)) throw new Error("Your package does not include this tool.");
  return { account, plan };
}

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveCreationAction(tool: StudioTool, id: string | null, title: string, data: unknown, source: "template" | "claude"): Promise<SaveResult> {
  try {
    const { account, plan } = await requireTool(tool);
    const json = JSON.stringify(data);
    if (json.length > 250_000) return { ok: false, error: "This project is too large to save." };
    const db = getDb(); const now = new Date();
    const cleanTitle = (title || "Untitled").slice(0, 120);
    if (id) {
      const own = await db.select({ id: academyCreations.id }).from(academyCreations).where(and(eq(academyCreations.id, id), eq(academyCreations.accountId, account.id))).get();
      if (!own) return { ok: false, error: "Project not found." };
      await db.update(academyCreations).set({ title: cleanTitle, data: json, source, updatedAt: now }).where(eq(academyCreations.id, id));
      revalidatePath("/academy/learn/studio");
      return { ok: true, id };
    }
    if (plan.toolQuota !== null) {
      const used = await db.select({ n: count() }).from(academyCreations).where(and(eq(academyCreations.accountId, account.id), eq(academyCreations.tool, tool))).get();
      if ((used?.n ?? 0) >= plan.toolQuota) return { ok: false, error: `${plan.name} includes ${plan.toolQuota} saved projects per tool. Delete one or upgrade.` };
    }
    const newId = crypto.randomUUID();
    await db.insert(academyCreations).values({ id: newId, accountId: account.id, tool, title: cleanTitle, data: json, source, createdAt: now, updatedAt: now });
    await logActivity(account.id, "studio", `Saved “${cleanTitle}”`);
    revalidatePath("/academy/learn/studio");
    return { ok: true, id: newId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save." };
  }
}

export async function deleteCreationAction(form: FormData) {
  const account = await requireAcademyAccount("/academy/learn/studio");
  const id = String(form.get("id"));
  await getDb().delete(academyCreations).where(and(eq(academyCreations.id, id), eq(academyCreations.accountId, account.id)));
  revalidatePath("/academy/learn/studio");
}

const CLAUDE_DAILY_LIMIT = 30;

export type DraftResult = { ok: true; data: unknown } | { ok: false; reason: string };

/** Claude drafting. Returns a reason instead of throwing so the client can fall back to templates. */
export async function claudeDraftAction(tool: StudioTool, brief: Record<string, unknown>): Promise<DraftResult> {
  try {
    const { account, plan } = await requireTool(tool);
    if (!hasFeature(plan, "ai")) return { ok: false, reason: "plan" };
    if (!aiEnabled()) return { ok: false, reason: "not_configured" };
    // Keep API spend bounded: at most CLAUDE_DAILY_LIMIT drafts per account per 24 hours.
    const since = new Date(Date.now() - 86_400_000);
    const used = await getDb().select({ n: count() }).from(academyActivity).where(and(eq(academyActivity.accountId, account.id), eq(academyActivity.kind, "claude"), gte(academyActivity.createdAt, since))).get();
    if ((used?.n ?? 0) >= CLAUDE_DAILY_LIMIT) return { ok: false, reason: "daily limit reached — try again tomorrow" };
    await logActivity(account.id, "claude", `Claude draft · ${tool}`);
    const safeBrief = Object.fromEntries(Object.entries(brief).slice(0, 12).map(([k, v]) => [k.slice(0, 30), typeof v === "string" ? v.slice(0, 600) : typeof v === "number" ? v : String(v).slice(0, 60)]));
    return await draftWithClaude(tool, safeBrief);
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : "error" };
  }
}

// --------------------------------------------------------------- failure passport
export async function addPassportAction(_: FormState, form: FormData): Promise<FormState> {
  const account = await requireAcademyAccount("/academy/learn/evidence");
  const v = z.object({
    course: z.string().refine(c => !!courseByCode(c), "Choose a unit."),
    stage: z.string().refine(s => STAGES.includes(s), "Choose a stage."),
    what: z.string().trim().min(5, "Describe what broke.").max(500),
    cause: z.string().trim().min(3, "Describe the cause.").max(500),
    fix: z.string().trim().min(3, "Describe the fix or lesson.").max(500),
  }).safeParse(Object.fromEntries(form));
  if (!v.success) return { error: v.error.issues[0].message };
  await getDb().insert(academyPassport).values({ id: crypto.randomUUID(), accountId: account.id, courseCode: v.data.course, stage: v.data.stage, what: v.data.what, cause: v.data.cause, fix: v.data.fix, createdAt: new Date() });
  await logActivity(account.id, "passport", `${v.data.course} · ${v.data.stage}: ${v.data.what}`);
  revalidatePath("/academy/learn/evidence");
  return { fields: { ok: "1" } };
}
