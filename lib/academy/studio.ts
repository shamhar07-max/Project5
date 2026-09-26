// DigitalBurj Academy Creator Studio: data shapes, template generators and the
// JSON Schemas used when Claude drafting is enabled. Pure TypeScript — runs in the
// browser (instant template drafts) and on the server (validation and fallback).
import type { StudioTool } from "./plans";

// ------------------------------------------------------------------ shared
const clean = (s: string, max = 120) => s.replace(/\s+/g, " ").trim().slice(0, max);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
let n = 0;
export const uid = (p = "x") => `${p}${Date.now().toString(36)}${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
/** Splits "a, b and c" / newline lists into items. */
export const listOf = (s: string) => s.split(/\n|,|;| and /).map(x => clean(x, 80)).filter(Boolean);

// ------------------------------------------------------------------ explainer video
export type SceneIcon = "spark" | "alert" | "bulb" | "gear" | "chart" | "check" | "users" | "arrow";
export type VideoScene = { id: string; kind: "hook" | "problem" | "solution" | "step" | "proof" | "cta"; heading: string; onScreen: string[]; narration: string; visual: string; seconds: number; icon: SceneIcon };
export type VideoProject = { title: string; audience: string; style: "kinetic" | "whiteboard" | "cinematic"; accent: string; scenes: VideoScene[] };
export type VideoInput = { topic: string; audience: string; goal: string; points: string; duration: number; style: VideoProject["style"]; accent: string };

export function draftVideo(i: VideoInput): VideoProject {
  const topic = clean(i.topic, 80) || "Our product";
  const who = clean(i.audience, 60) || "busy teams";
  const goal = clean(i.goal, 90) || `understand ${topic}`;
  const pts = listOf(i.points).slice(0, 4);
  const steps = pts.length ? pts : ["Capture the problem", "Choose the right approach", "Measure the result"];
  const total = Math.max(20, Math.min(180, i.duration || 60));
  const weights = [0.12, 0.16, 0.16, ...steps.map(() => 0.34 / steps.length), 0.12, 0.10];
  const secs = weights.map(w => Math.max(3, Math.round(w * total)));
  const icons: SceneIcon[] = ["gear", "chart", "users", "check"];
  const scenes: VideoScene[] = [
    { id: uid("s"), kind: "hook", heading: `What if ${who} could ${goal.toLowerCase()}?`, onScreen: [cap(topic)], narration: `What if ${who} could ${goal.toLowerCase()}? Meet ${topic}.`, visual: "Bold headline builds word by word over a slow gradient; logo mark pulses once.", seconds: secs[0], icon: "spark" },
    { id: uid("s"), kind: "problem", heading: "The problem today", onScreen: ["Too many manual steps", "Information in too many places", "Decisions made on guesswork"], narration: `Right now, most ${who} lose hours to manual steps, scattered information and decisions made on guesswork.`, visual: "Three pain points slide in; each one is struck through as the next appears.", seconds: secs[1], icon: "alert" },
    { id: uid("s"), kind: "solution", heading: cap(topic), onScreen: [`Built for ${who}`, `Helps you ${goal.toLowerCase()}`], narration: `${cap(topic)} changes that. It's built for ${who}, and it's designed around one goal: helping you ${goal.toLowerCase()}.`, visual: "Product name resolves from blur to sharp; supporting line types in underneath.", seconds: secs[2], icon: "bulb" },
    ...steps.map((s, k): VideoScene => ({ id: uid("s"), kind: "step", heading: `Step ${k + 1}: ${cap(s)}`, onScreen: [cap(s)], narration: `${k === 0 ? "First" : k === steps.length - 1 ? "Finally" : "Next"}, ${s.toLowerCase()}.`, visual: `Numbered badge ${k + 1} scales in; progress rail fills to ${Math.round(((k + 1) / steps.length) * 100)}%.`, seconds: secs[3 + k], icon: icons[k % icons.length] })),
    { id: uid("s"), kind: "proof", heading: "What changes", onScreen: ["Less rework", "Clearer decisions", "Time back every week"], narration: "The result: less rework, clearer decisions and time back every single week.", visual: "Three outcome chips rise and settle into a row; accent underline sweeps across.", seconds: secs[secs.length - 2], icon: "chart" },
    { id: uid("s"), kind: "cta", heading: "Get started today", onScreen: [`Learn more about ${topic}`], narration: `Ready to see it for yourself? Get started with ${topic} today.`, visual: "Call-to-action button pulses; end card holds for two seconds.", seconds: secs[secs.length - 1], icon: "arrow" },
  ];
  // Never give a scene less time than its narration needs.
  for (const sc of scenes) sc.seconds = Math.max(sc.seconds, Math.ceil(sc.narration.split(/\s+/).length / 2.5) + 1);
  return { title: `${cap(topic)} — explainer`, audience: who, style: i.style, accent: i.accent || "#e10613", scenes };
}

// ------------------------------------------------------------------ lesson plan
export type Framework = "5E" | "Gradual release" | "Direct instruction" | "Project-based" | "Flipped";
export type LessonPhase = { name: string; minutes: number; teacher: string; students: string; check: string };
export type LessonPlanDoc = {
  title: string; subject: string; level: string; minutes: number; framework: Framework;
  objectives: string[]; successCriteria: string[]; vocabulary: string[]; materials: string[]; priorKnowledge: string;
  phases: LessonPhase[];
  differentiation: { support: string[]; extension: string[]; language: string[] };
  assessment: { formative: string[]; exitTicket: string[] };
  homework: string; reflection: string[];
};
export type LessonInput = { subject: string; topic: string; level: string; minutes: number; framework: Framework; classSize: number; needs: string; standard: string };

const FRAMEWORKS: Record<Framework, [string, number][]> = {
  "5E": [["Engage", 0.12], ["Explore", 0.25], ["Explain", 0.2], ["Elaborate", 0.28], ["Evaluate", 0.15]],
  "Gradual release": [["Warm-up", 0.1], ["I do — modelling", 0.2], ["We do — guided practice", 0.25], ["You do together — pairs", 0.2], ["You do alone", 0.15], ["Plenary", 0.1]],
  "Direct instruction": [["Review & hook", 0.1], ["Instruction", 0.25], ["Guided practice", 0.25], ["Independent practice", 0.3], ["Closure", 0.1]],
  "Project-based": [["Driving question", 0.12], ["Research sprint", 0.28], ["Build", 0.35], ["Critique & revise", 0.15], ["Share", 0.1]],
  Flipped: [["Pre-class check", 0.12], ["Clarify misconceptions", 0.18], ["Applied challenge", 0.4], ["Peer teaching", 0.18], ["Exit reflection", 0.12]],
};

function phaseText(name: string, topic: string): Omit<LessonPhase, "name" | "minutes"> {
  const t = topic;
  const k = name.toLowerCase();
  if (/engage|hook|warm|driving|pre-class/.test(k)) return { teacher: `Pose a surprising question or image about ${t}; collect first ideas on the board without judging them.`, students: "Think–pair–share initial ideas; note one question they want answered.", check: "Scan responses for prior knowledge and misconceptions." };
  if (/explore|research/.test(k)) return { teacher: `Set up a hands-on task or source pack on ${t}; circulate and prompt with open questions.`, students: "Investigate in small groups, recording observations and patterns.", check: "Listen for reasoning; ask each group to state one pattern they found." };
  if (/explain|instruction|i do|clarify|model/.test(k)) return { teacher: `Model the key idea of ${t} step by step, thinking aloud; connect to students' findings.`, students: "Take structured notes; annotate a worked example.", check: "Cold-call two students to restate the key idea in their own words." };
  if (/we do|guided/.test(k)) return { teacher: "Work through a second example together, handing over more of each step to the class.", students: "Complete steps on mini-whiteboards; compare with a partner.", check: "Mini-whiteboard hold-up after each step." };
  if (/pairs|peer|critique/.test(k)) return { teacher: "Pair students strategically; give a checklist for feedback.", students: `Solve or build a ${t} task together, then give feedback against the checklist.`, check: "Peer feedback quality against the success criteria." };
  if (/elaborate|alone|independent|applied|build/.test(k)) return { teacher: `Set a challenge that applies ${t} in a new context, with core and stretch tiers.`, students: "Work independently or in teams; choose core or stretch tier.", check: "Circulate with a success-criteria checklist; confer with 3–4 students." };
  return { teacher: "Revisit the objectives; ask students to rate their confidence and name one thing that helped.", students: "Complete the exit ticket; set a personal next step.", check: "Exit ticket responses sorted into secure / developing / not yet." };
}

export function draftLessonPlan(i: LessonInput): LessonPlanDoc {
  const topic = clean(i.topic, 90) || "the topic";
  const subject = clean(i.subject, 50) || "General";
  const level = clean(i.level, 40) || "Mixed ability";
  const minutes = Math.max(20, Math.min(240, i.minutes || 60));
  const fw = FRAMEWORKS[i.framework] ? i.framework : "5E";
  let used = 0;
  const shape = FRAMEWORKS[fw];
  const phases = shape.map(([name, w], k) => {
    const m = k === shape.length - 1 ? minutes - used : Math.max(3, Math.round(w * minutes));
    used += m;
    return { name, minutes: m, ...phaseText(name, topic) };
  });
  const needs = listOf(i.needs);
  return {
    title: `${cap(topic)} — ${subject}`, subject, level, minutes, framework: fw,
    objectives: [`Explain the key ideas of ${topic} in their own words`, `Apply ${topic} to solve a new problem`, `Evaluate a worked example of ${topic} and identify an error or improvement`],
    successCriteria: [`I can describe ${topic} using the key vocabulary`, `I can use ${topic} to complete a task without a worked example`, "I can explain why my answer makes sense"],
    vocabulary: [cap(topic), "Evidence", "Example / non-example", "Pattern", "Justify"],
    materials: ["Slides or visual prompt", "Mini-whiteboards and markers", `Task cards on ${topic} (core and stretch)`, "Exit tickets", ...(i.classSize > 28 ? ["Group role cards for large class"] : [])],
    priorKnowledge: `Students should already be familiar with the foundations that lead into ${topic}. Use the opening activity to check.`,
    phases,
    differentiation: {
      support: ["Worked example kept visible", "Sentence starters for explanations", "Reduced number of core questions", ...needs.filter(x => /support|sen|iep|dyslex|adhd/i.test(x)).map(x => `Planned for: ${x}`)],
      extension: [`Create their own ${topic} problem for a partner`, "Explain a common misconception and how to avoid it", "Transfer the idea to an unfamiliar context"],
      language: ["Visual glossary with key terms", "Pair language learners with a supportive peer", "Accept oral or diagram responses", ...needs.filter(x => /eal|esl|ell|language|arabic|english/i.test(x)).map(x => `Planned for: ${x}`)],
    },
    assessment: {
      formative: ["Mini-whiteboard checks during guided practice", "Targeted questioning (cold-call + no-opt-out)", "Circulating with a success-criteria checklist"],
      exitTicket: [`Define ${topic} in one sentence.`, `Solve: a short ${topic} problem at core level.`, "What is one thing you are still unsure about?"],
    },
    homework: `Short retrieval task on ${topic} (10–15 minutes) plus one real-world example to bring to the next lesson.`,
    reflection: ["Which phase ran long or short, and why?", "Which students need follow-up based on exit tickets?", "What would I change next time?"],
  };
}

// ------------------------------------------------------------------ course outline
export type LectureType = "video" | "article" | "quiz" | "assignment";
export type Lecture = { id: string; title: string; type: LectureType; minutes: number; preview: boolean };
export type Section = { id: string; title: string; lectures: Lecture[] };
export type CourseOutline = { title: string; subtitle: string; category: string; level: string; audience: string[]; outcomes: string[]; requirements: string[]; sections: Section[]; promo: string; price: string };
export type CourseInput = { topic: string; audience: string; level: string; category: string; sections: number; hours: number };

export function draftCourse(i: CourseInput): CourseOutline {
  const topic = clean(i.topic, 70) || "Your subject";
  const who = clean(i.audience, 80) || "beginners";
  const count = Math.max(3, Math.min(12, i.sections || 6));
  const perSectionMin = Math.max(20, Math.round(((i.hours || 3) * 60) / count));
  const arc = ["Introduction & course roadmap", `${cap(topic)} fundamentals`, "Core techniques", "Hands-on project: part 1", "Hands-on project: part 2", "Common mistakes & how to fix them", "Real-world workflows", "Advanced techniques", "Tools & automation", "Case studies", "Career & next steps", "Final project & wrap-up"];
  const titles = count >= arc.length ? arc : [arc[0], ...arc.slice(1, count - 1), arc[arc.length - 1]];
  const sections: Section[] = titles.map((t, s) => {
    const vids = s === 0 ? 3 : 4;
    const lectures: Lecture[] = [];
    for (let k = 0; k < vids; k++) lectures.push({ id: uid("l"), title: s === 0 ? ["Welcome — what you'll build", "How to get the most from this course", "Setting up your tools"][k] : `${t}: lesson ${k + 1}`, type: "video", minutes: Math.max(3, Math.round(perSectionMin / (vids + 1))), preview: s === 0 && k < 2 });
    if (s > 0) lectures.push({ id: uid("l"), title: `Cheat sheet: ${t}`, type: "article", minutes: 5, preview: false });
    if (s > 0 && s < titles.length - 1) lectures.push({ id: uid("l"), title: `Quiz: ${t}`, type: "quiz", minutes: 5, preview: false });
    if (/project|final/i.test(t)) lectures.push({ id: uid("l"), title: `Assignment: ${t}`, type: "assignment", minutes: 30, preview: false });
    return { id: uid("s"), title: t, lectures };
  });
  return {
    title: `${cap(topic)}: From Zero to Confident`, subtitle: `A practical, project-based course for ${who} — learn ${topic} by doing real work.`,
    category: clean(i.category, 40) || "Development", level: i.level || "Beginner",
    audience: [cap(who), `Anyone who wants practical ${topic} skills`, "Professionals changing role"],
    outcomes: [`Understand the core concepts of ${topic}`, `Build a complete ${topic} project from scratch`, "Avoid the most common beginner mistakes", "Apply professional workflows and best practices", "Create a portfolio piece you can show"],
    requirements: ["No prior experience needed — we start from the basics", "A computer with internet access", "Curiosity and about 2–3 hours per week"],
    sections, promo: `In this course you'll go from knowing nothing about ${topic} to building a real project. Every section ends with practice, so you finish with skills you can use.`, price: "Tier 3",
  };
}
export const courseMinutes = (c: CourseOutline) => c.sections.reduce((s, x) => s + x.lectures.reduce((a, l) => a + l.minutes, 0), 0);
/** Marketplace-style readiness checklist (modelled on common course-marketplace minimums). */
export function courseChecks(c: CourseOutline) {
  const lectures = c.sections.flatMap(s => s.lectures);
  const videoMin = lectures.filter(l => l.type === "video").reduce((a, l) => a + l.minutes, 0);
  return [
    { ok: lectures.length >= 5, label: "At least 5 lectures", detail: `${lectures.length} lectures` },
    { ok: videoMin >= 30, label: "30+ minutes of video", detail: `${videoMin} minutes of video` },
    { ok: c.outcomes.filter(Boolean).length >= 4, label: "4+ learning outcomes", detail: `${c.outcomes.filter(Boolean).length} outcomes` },
    { ok: c.requirements.filter(Boolean).length >= 1, label: "Requirements listed", detail: `${c.requirements.filter(Boolean).length} listed` },
    { ok: c.audience.filter(Boolean).length >= 1, label: "Target learners defined", detail: `${c.audience.filter(Boolean).length} audiences` },
    { ok: lectures.some(l => l.preview), label: "Free preview lecture", detail: `${lectures.filter(l => l.preview).length} previews` },
    { ok: lectures.some(l => l.type === "quiz" || l.type === "assignment"), label: "Practice activities", detail: `${lectures.filter(l => l.type !== "video" && l.type !== "article").length} quizzes / assignments` },
    { ok: c.title.length >= 10 && c.title.length <= 60, label: "Title 10–60 characters", detail: `${c.title.length} characters` },
    { ok: c.subtitle.length >= 40 && c.subtitle.length <= 160, label: "Subtitle 40–160 characters", detail: `${c.subtitle.length} characters` },
  ];
}

// ------------------------------------------------------------------ presentations
export type SlideLayout = "title" | "agenda" | "bullets" | "stat" | "quote" | "process" | "compare" | "closing";
export type Slide = { id: string; layout: SlideLayout; title: string; subtitle: string; bullets: string[]; stats: { value: string; label: string }[]; quote: string; quoteBy: string; columns: { heading: string; points: string[] }[]; notes: string };
export type DeckTheme = "burj" | "midnight" | "paper" | "aurora";
export type Deck = { title: string; subtitle: string; theme: DeckTheme; slides: Slide[] };
export type DeckInput = { topic: string; audience: string; slides: number; theme: DeckTheme; points: string };

export const blankSlide = (layout: SlideLayout = "bullets", title = "New slide"): Slide => ({ id: uid("d"), layout, title, subtitle: "", bullets: layout === "bullets" || layout === "agenda" || layout === "process" ? ["First point", "Second point", "Third point"] : [], stats: layout === "stat" ? [{ value: "3×", label: "Faster" }, { value: "40%", label: "Less rework" }, { value: "24/7", label: "Available" }] : [], quote: layout === "quote" ? "A memorable line that captures the idea." : "", quoteBy: layout === "quote" ? "Source" : "", columns: layout === "compare" ? [{ heading: "Before", points: ["Manual", "Slow"] }, { heading: "After", points: ["Automated", "Fast"] }] : [], notes: "" });

export function draftDeck(i: DeckInput): Deck {
  const topic = clean(i.topic, 80) || "Our proposal";
  const who = clean(i.audience, 60) || "the team";
  const pts = listOf(i.points).slice(0, 6);
  const key = pts.length >= 3 ? pts : ["The opportunity", "Our approach", "Expected impact"];
  const s = (p: Partial<Slide> & { layout: SlideLayout; title: string }): Slide => ({ ...blankSlide(p.layout, p.title), bullets: [], stats: [], columns: [], quote: "", quoteBy: "", ...p });
  const slides: Slide[] = [
    s({ layout: "title", title: cap(topic), subtitle: `Prepared for ${who}`, notes: `Welcome everyone. Today we'll walk through ${topic} and what it means for ${who}.` }),
    s({ layout: "agenda", title: "Agenda", bullets: [...key.map(cap), "Next steps"], notes: "Set expectations for the session and timing." }),
    s({ layout: "bullets", title: "Why this matters now", bullets: [`${cap(who)} face growing pressure to do more with less`, "Current processes rely on manual effort", `${cap(topic)} addresses the root cause, not the symptoms`], notes: "Establish the problem before the solution." }),
    ...key.map((k, idx) => s({ layout: idx % 2 ? "process" : "bullets", title: cap(k), bullets: idx % 2 ? ["Discover", "Design", "Deliver", "Measure"] : [`What ${k.toLowerCase()} means in practice`, "What we learned so far", "What we recommend"], notes: `Speak to ${k.toLowerCase()} with one concrete example.` })),
    s({ layout: "stat", title: "The impact in numbers", stats: [{ value: "30%", label: "Time saved (target)" }, { value: "2×", label: "Faster decisions" }, { value: "90d", label: "To first results" }], notes: "These are targets to validate, not guarantees." }),
    s({ layout: "compare", title: "Before and after", columns: [{ heading: "Today", points: ["Manual hand-offs", "Scattered information", "Slow approvals"] }, { heading: `With ${topic}`, points: ["Clear ownership", "One source of truth", "Faster, auditable decisions"] }], notes: "Make the contrast tangible." }),
    s({ layout: "quote", title: "A principle to hold on to", quote: "Evidence before claims. Measure before and after.", quoteBy: "DigitalBurj operating principle", notes: "Pause here." }),
    s({ layout: "closing", title: "Next steps", bullets: ["Agree scope and success measures", "Run a two-week pilot", "Review results together"], subtitle: "Questions?", notes: "Close with a clear ask." }),
  ];
  const want = Math.max(5, Math.min(16, i.slides || slides.length));
  while (slides.length > want) slides.splice(slides.length - 3, 1);
  while (slides.length < want) slides.splice(slides.length - 1, 0, s({ layout: "bullets", title: `Deep dive ${slides.length - 2}`, bullets: ["Key idea", "Supporting evidence", "Implication"] }));
  return { title: cap(topic), subtitle: `For ${who}`, theme: i.theme || "burj", slides };
}

// ------------------------------------------------------------------ JSON Schemas (Claude structured output)
const str = { type: "string" } as const;
const strs = { type: "array", items: str } as const;
const obj = (props: Record<string, unknown>) => ({ type: "object", properties: props, required: Object.keys(props), additionalProperties: false });

export const SCHEMAS: Record<StudioTool, Record<string, unknown>> = {
  video: obj({ title: str, scenes: { type: "array", items: obj({ kind: { type: "string", enum: ["hook", "problem", "solution", "step", "proof", "cta"] }, heading: str, onScreen: strs, narration: str, visual: str, seconds: { type: "integer" }, icon: { type: "string", enum: ["spark", "alert", "bulb", "gear", "chart", "check", "users", "arrow"] } }) } }),
  lesson: obj({ title: str, objectives: strs, successCriteria: strs, vocabulary: strs, materials: strs, priorKnowledge: str, phases: { type: "array", items: obj({ name: str, minutes: { type: "integer" }, teacher: str, students: str, check: str }) }, differentiation: obj({ support: strs, extension: strs, language: strs }), assessment: obj({ formative: strs, exitTicket: strs }), homework: str, reflection: strs }),
  course: obj({ title: str, subtitle: str, audience: strs, outcomes: strs, requirements: strs, promo: str, sections: { type: "array", items: obj({ title: str, lectures: { type: "array", items: obj({ title: str, type: { type: "string", enum: ["video", "article", "quiz", "assignment"] }, minutes: { type: "integer" }, preview: { type: "boolean" } }) } }) } }),
  slides: obj({ title: str, subtitle: str, slides: { type: "array", items: obj({ layout: { type: "string", enum: ["title", "agenda", "bullets", "stat", "quote", "process", "compare", "closing"] }, title: str, subtitle: str, bullets: strs, stats: { type: "array", items: obj({ value: str, label: str }) }, quote: str, quoteBy: str, columns: { type: "array", items: obj({ heading: str, points: strs }) }, notes: str }) } }),
};

export const PROMPTS: Record<StudioTool, string> = {
  video: "Write a storyboard for a short animated explainer video. Keep on-screen text to at most 6 words per line and 3 lines per scene. Narration must be speakable in the scene's seconds (about 2.5 words per second). The sum of seconds should match the requested duration. Start with a hook and end with a clear call to action.",
  lesson: "Write a complete, practical lesson plan a teacher could use tomorrow. Phases must follow the requested framework and their minutes must add up to the requested duration. Objectives use measurable verbs. Include genuine differentiation and three exit-ticket questions specific to the topic.",
  course: "Design a course outline for an online course marketplace. Between the requested number of sections, each with 3–6 lectures; mostly video lectures of 3–12 minutes, with quizzes and at least one assignment. Mark the first two lectures as free previews. Outcomes start with a verb.",
  slides: "Create a presentation deck. Use a variety of layouts. Bullets are short (max 10 words). Stats use realistic, clearly-labelled target values, never invented facts about real organisations. Include speaker notes for every slide.",
};
