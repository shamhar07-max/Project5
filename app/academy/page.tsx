import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Award, BadgeCheck, BookOpen, Briefcase, Building2, Check, Clapperboard, Cpu, FileText, GraduationCap, Layers, LayoutTemplate, Lock, PlayCircle, Presentation, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { PublicFrame, SectionHead } from "./_components/chrome";
import { AnomalyDemo, CourseCarousel, PricingCards, Rotator, StageExplorer, Tabs } from "./_components/client";
import { CATALOG, FAMILIES, PATHWAYS, courseByCode } from "../../lib/academy/catalog";
import { FLAGSHIP, STAGES, STAGE_HELP } from "../../lib/academy/curriculum";
import { getAcademyAccount } from "../../lib/academy/auth";
import { accessFor } from "../../lib/academy/access";

export const metadata = { title: "DigitalBurj Academy — Learn it. Apply it. Prove it.", description: "Practical missions, honest assessment, evidence you control — and a Creator Studio for teachers and course creators." };

const TOOLS = ["VS Code", "Git / GitHub", "Figma", "Canva", "PostgreSQL", "Excel / Google Sheets", "Power BI", "AI assistants", "CRM / ERP sandboxes", "Email & calendar", "OpenCode", "Evidence storage"];
const LIFECYCLE = ["Draft", "Submitted", "In review", "Request changes", "Resubmitted", "Approved", "Pending verification", "Verified", "Evidence issued"];
const LEVELS = [["L1", "Guided basics", "Can follow guidance through foundational tasks."], ["L2", "Scenario capability", "Completes a defined scenario with appropriate support."], ["L3", "Published assessment", "Has a recorded result from the Academy assessment process."], ["L4", "Production delivery", "Separate claim — needs real production delivery evidence."], ["L5", "Repeated verified delivery", "Separate claim — repeated, independently verified delivery."]];
const FAQ = [
  ["Does registering unlock paid courses?", "No. Registering creates your account on the free Explorer package. Paid units unlock only when a package is active on your account — after payment is confirmed or an eligible promotion is applied at checkout."],
  ["Is this a certificate I can use to get a job?", "Academy records show what you learned and what was assessed. Assessment, independent verification and real workplace experience are separate claims, and participation does not guarantee employment, a licence or accreditation."],
  ["What is the Creator Studio?", "Four tools for teachers, trainers and creators: an Explainer Video Generator that exports WebM video, AnyLessonPlan for any subject, a Course Studio for Udemy-style course outlines, and Presentations with a presenter mode. They run in your browser and can use Claude for drafting when it is enabled on the deployment."],
  ["Can I use my DigitalBurj account?", "Yes. Use “Continue with DigitalBurj account” on the sign-in page to link the same identity you use in the DigitalBurj workspace."],
  ["What data do the missions use?", "Fictional or consented data only. Labs never connect to live customer, employer, government, banking or healthcare systems."],
  ["Can my company train a team?", "Yes — Academy for Business provides role-based paths, rosters and manager reports. Contact the team from the For Business page."],
];

export default async function AcademyHome() {
  const account = await getAcademyAccount().catch(() => null);
  const access = account ? await accessFor(account.id).catch(() => null) : null;
  const featured = ["DB-00", "DB-02", "PC-AC01", "DB-04", "PF-03", "DB-12", "PC-LG01", "AD-BA01", "DB-05", "PF-10"].map(courseByCode).filter(c => !!c);
  const counts = Object.fromEntries(FAMILIES.map(f => [f.id, CATALOG.filter(c => c.family === f.id).length]));

  return <PublicFrame>
    {/* ---------------------------------------------------------------- Hero */}
    <section className="a-hero a-noise">
      <div className="a-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="a-grid-bg" aria-hidden="true" />
      <div className="a-shell a-hero-grid">
        <div style={{ display: "grid", gap: "1.6rem" }}>
          <Link href="/academy/studio" className="a-pill" data-reveal="up" style={{ width: "fit-content" }}><b>NEW</b>Creator Studio for teachers & course creators <ArrowRight size={14} /></Link>
          <h1 className="a-h1" data-reveal="up" style={{ "--i": 1 } as CSSProperties}>Learn it.<br />Apply it.<br /><Rotator words={["Prove it.", "Build it.", "Teach it.", "Ship it."]} /></h1>
          <p className="a-lede" data-reveal="up" style={{ "--i": 2 } as CSSProperties}>An AI-native academy where every unit ends in real work: twelve-stage missions, rubric-based review and evidence you control. Plus a Creator Studio that turns an idea into a lesson plan, a course, a deck or an explainer video.</p>
          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }} data-reveal="up">
            <Link href={account ? "/academy/learn" : "/academy/register"} className="a-btn a-btn-primary a-btn-lg">{account ? "Continue learning" : "Start free"} <ArrowRight size={18} /></Link>
            <Link href="/academy/catalogue" className="a-btn a-btn-glass a-btn-lg"><BookOpen size={18} />Explore {CATALOG.length} units</Link>
          </div>
          <div style={{ display: "flex", gap: "1.2rem", flexWrap: "wrap", fontSize: ".82rem" }} className="a-muted" data-reveal="up">
            <span style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}><Check size={15} color="#34d399" />Free Explorer package</span>
            <span style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}><Check size={15} color="#34d399" />Evidence private by default</span>
            <span style={{ display: "inline-flex", gap: ".4rem", alignItems: "center" }}><Check size={15} color="#34d399" />Cancel anytime</span>
          </div>
        </div>

        <div style={{ position: "relative" }} data-reveal="scale">
          <div className="a-preview" aria-hidden="true">
            <div style={{ display: "flex", gap: ".4rem", marginBottom: ".9rem" }}><i style={{ width: 10, height: 10, borderRadius: 9, background: "#f43f5e" }} /><i style={{ width: 10, height: 10, borderRadius: 9, background: "#fbbf24" }} /><i style={{ width: 10, height: 10, borderRadius: 9, background: "#34d399" }} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
              <div className="a-card" style={{ gridColumn: "span 2", padding: "1rem" }}>
                <p className="a-eyebrow">Continue learning</p>
                <p style={{ fontWeight: 800, marginTop: ".5rem" }}>DB-02 · Professional Web Development</p>
                <p className="a-muted" style={{ fontSize: ".8rem", marginTop: ".2rem" }}>Mission: Clinic booking landing page</p>
                <div className="a-meter" style={{ marginTop: ".8rem" }}><i style={{ width: "58%" }} /></div>
                <div style={{ display: "flex", gap: ".25rem", marginTop: ".8rem", flexWrap: "wrap" }}>{STAGES.map((s, k) => <span key={s} className={`a-chip ${k < 7 ? "a-chip-green" : k === 7 ? "a-chip-violet" : ""}`} style={{ fontSize: ".55rem", padding: ".2rem .35rem" }}>{s}</span>)}</div>
              </div>
              <div className="a-card" style={{ padding: "1rem" }}><p className="a-muted" style={{ fontSize: ".75rem" }}>Stages done</p><p style={{ fontSize: "1.8rem", fontWeight: 800 }}>27</p><svg viewBox="0 0 120 34" width="100%" height="34"><polyline fill="none" stroke="#a78bfa" strokeWidth="2.5" points="0,30 20,26 40,27 60,18 80,20 100,9 120,4" /></svg></div>
              <div className="a-card" style={{ padding: "1rem" }}><p className="a-muted" style={{ fontSize: ".75rem" }}>Studio</p><p style={{ fontWeight: 800, marginTop: ".35rem", fontSize: ".9rem" }}>3 decks · 2 lesson plans</p><div style={{ display: "flex", gap: ".3rem", marginTop: ".6rem" }}>{[Clapperboard, FileText, LayoutTemplate, Presentation].map((I, k) => <span key={k} className="a-icon-tile" style={{ width: 28, height: 28, borderRadius: 8 }}><I size={14} /></span>)}</div></div>
            </div>
          </div>
          <div className="a-float a-glass" style={{ right: -10, bottom: -26, padding: ".8rem 1rem", display: "flex", gap: ".7rem", alignItems: "center" }} aria-hidden="true"><BadgeCheck size={22} color="#34d399" /><div><p style={{ fontWeight: 800, fontSize: ".85rem" }}>Approved by reviewer</p><p className="a-muted" style={{ fontSize: ".72rem" }}>Rubric 86% · pending verification</p></div></div>
          <div className="a-float a-glass" style={{ left: -18, top: -22, padding: ".7rem .9rem", display: "flex", gap: ".6rem", alignItems: "center", animationDelay: "-3s" }} aria-hidden="true"><Sparkles size={18} color="#a78bfa" /><p style={{ fontWeight: 700, fontSize: ".8rem" }}>Lesson plan drafted in 4s</p></div>
        </div>
      </div>
      <div className="a-shell" style={{ position: "relative", zIndex: 1, marginTop: "clamp(3rem, 6vw, 5rem)" }}>
        <div className="a-stats" data-reveal="up">
          <div><strong data-count={CATALOG.length}>{CATALOG.length}</strong><span>Units across five families</span></div>
          <div><strong data-count="12">12</strong><span>Stages in every mission</span></div>
          <div><strong data-count="4">4</strong><span>Creator Studio tools</span></div>
          <div><strong data-count="10">10</strong><span>Fictional-data simulation labs</span></div>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- Tools marquee */}
    <section style={{ paddingBottom: "3rem" }}>
      <p className="a-shell a-muted a-mono" style={{ fontSize: ".7rem", letterSpacing: ".16em", textTransform: "uppercase", textAlign: "center", marginBottom: "1.2rem" }}>Practise with the tools of real work · no integration implied</p>
      <div className="a-marquee">{[0, 1].map(k => <div key={k} className="a-marquee-track" aria-hidden={k === 1}>{TOOLS.map(t => <span key={t} className="a-tool-chip"><Cpu size={15} />{t}</span>)}</div>)}</div>
    </section>

    {/* ---------------------------------------------------------------- Learn / Apply / Prove */}
    <section className="a-sec">
      <div className="a-shell">
        <SectionHead eyebrow="The Academy model" title={<>Completion is not <em className="a-grad">capability.</em></>} lede="Every unit moves you from structured learning, to realistic work, to evidence a reviewer can assess." />
        <div className="a-bento">
          {[
            { I: GraduationCap, t: "Learn the structure behind the skill.", d: "Short lessons, worked examples and knowledge checks that explain why — not just how.", a: "#3b82f6", b: "#22d3ee", k: "01 · Learn" },
            { I: Target, t: "Apply knowledge to realistic work.", d: "Twelve-stage missions set in fictional SMEs: brief, investigate, build, break, fix, test, defend, ship.", a: "#8b5cf6", b: "#ec4899", k: "02 · Apply" },
            { I: Award, t: "Prove capability with evidence.", d: "Rubric review, optional independent verification and a Capability Record you choose whether to share.", a: "#e10613", b: "#f97316", k: "03 · Prove" },
          ].map((x, i) => <div key={x.k} className="a-card" data-spotlight data-reveal="up" style={{ "--i": i, "--a": x.a, minHeight: 260, display: "flex", flexDirection: "column", gap: "1rem" } as CSSProperties}>
            <span className="a-icon-tile" style={{ "--a": x.a, "--b": x.b } as CSSProperties}><x.I size={22} /></span>
            <span className="a-mono a-muted" style={{ fontSize: ".72rem", letterSpacing: ".14em" }}>{x.k}</span>
            <h3 className="a-h3" style={{ fontSize: "1.35rem", lineHeight: 1.2 }}>{x.t}</h3>
            <p className="a-muted" style={{ lineHeight: 1.6 }}>{x.d}</p>
          </div>)}
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- Directions */}
    <section className="a-sec" style={{ paddingTop: 0 }}>
      <div className="a-shell">
        <SectionHead eyebrow="Choose your direction" title={<>Five families. <em className="a-grad">One governed academy.</em></>} />
        <Tabs tabs={FAMILIES.map(f => ({ id: f.id, label: f.label, content: <div className="a-bento">
          <div className="a-card w3" style={{ display: "grid", gap: "1rem", alignContent: "start", background: "linear-gradient(160deg, #8b5cf622, transparent)" }}>
            <span className="a-chip a-chip-violet" style={{ width: "fit-content" }}>{counts[f.id]} units</span>
            <h3 className="a-h2" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>{f.label}</h3>
            <p className="a-muted" style={{ lineHeight: 1.6 }}>{f.blurb}</p>
            <Link href={`/academy/catalogue?family=${f.id}`} className="a-btn a-btn-white" style={{ width: "fit-content" }}>Browse {f.label} <ArrowRight size={16} /></Link>
          </div>
          <div className="a-card w3" style={{ padding: ".4rem 1.2rem" }}>
            <div className="a-list">{CATALOG.filter(c => c.family === f.id).slice(0, 6).map(c => <Link key={c.code} href={`/academy/courses/${c.code}`}><span className="a-chip">{c.code}</span><span style={{ fontWeight: 650, flex: 1 }}>{c.title}</span><span className="a-muted" style={{ fontSize: ".8rem" }}>{c.hours}h</span></Link>)}</div>
          </div>
        </div> }))} />
      </div>
    </section>

    {/* ---------------------------------------------------------------- Featured carousel */}
    <section className="a-sec" style={{ background: "linear-gradient(180deg, transparent, #080c18 30%, #080c18 70%, transparent)" }}>
      <div className="a-shell">
        <SectionHead eyebrow="Featured units" title={<>Find your <em className="a-grad">starting point.</em></>} lede="Flagship units carry fully authored lessons today; every other unit shows its outline, mission and rubric while materials are produced.">
          <Link href="/academy/catalogue" className="a-btn a-btn-glass">View the full catalogue <ArrowRight size={16} /></Link>
        </SectionHead>
        <CourseCarousel courses={featured} authoredCodes={FLAGSHIP} />
      </div>
    </section>

    {/* ---------------------------------------------------------------- Creator Studio bento */}
    <section className="a-sec">
      <div className="a-dots" aria-hidden="true" />
      <div className="a-shell" style={{ position: "relative" }}>
        <SectionHead eyebrow="Creator Studio" title={<>From idea to <em className="a-grad">classroom-ready</em> in minutes.</>} lede="Four professional tools for teachers, trainers and course creators — included in Educator & Creator and Professional, with Lesson Plan and Presentations on every package." />
        <div className="a-bento">
          <Link href="/academy/studio#video" className="a-card w4" data-spotlight data-reveal="up" style={{ "--a": "#e10613", minHeight: 300, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", alignItems: "center" } as CSSProperties}>
            <div style={{ display: "grid", gap: ".8rem" }}>
              <span className="a-icon-tile" style={{ "--a": "#e10613", "--b": "#f97316" } as CSSProperties}><Clapperboard size={22} /></span>
              <h3 className="a-h3" style={{ fontSize: "1.4rem" }}>Explainer Video Generator</h3>
              <p className="a-muted" style={{ lineHeight: 1.6 }}>Script, storyboard and animate a narrated explainer. Preview with voice-over, then export a WebM video.</p>
            </div>
            <div className="a-stage16" style={{ background: "radial-gradient(120% 90% at 100% 0%, #3a0a14, #070b16 55%)", display: "grid", placeItems: "center", position: "relative" }} aria-hidden="true">
              <div style={{ textAlign: "center" }}><PlayCircle size={44} color="#ff4d57" /><p style={{ fontWeight: 800, marginTop: ".4rem", fontSize: "clamp(.8rem, 1.4vw, 1.1rem)" }}>What if onboarding took 5 minutes?</p></div>
              <div style={{ position: "absolute", left: 12, right: 12, bottom: 10 }} className="a-meter"><i style={{ width: "42%" }} /></div>
            </div>
          </Link>
          <Link href="/academy/studio#lesson" className="a-card" data-spotlight data-reveal="up" style={{ "--i": 1, "--a": "#8b5cf6", display: "grid", gap: ".8rem", alignContent: "start" } as CSSProperties}>
            <span className="a-icon-tile"><FileText size={22} /></span>
            <h3 className="a-h3" style={{ fontSize: "1.25rem" }}>AnyLessonPlan</h3>
            <p className="a-muted" style={{ lineHeight: 1.6 }}>Any subject, any level. 5E, gradual release, direct instruction, PBL or flipped — timed to the minute, with differentiation and exit tickets.</p>
          </Link>
          <Link href="/academy/studio#course" className="a-card" data-spotlight data-reveal="up" style={{ "--i": 2, "--a": "#22d3ee", display: "grid", gap: ".8rem", alignContent: "start" } as CSSProperties}>
            <span className="a-icon-tile" style={{ "--a": "#0891b2", "--b": "#22d3ee" } as CSSProperties}><LayoutTemplate size={22} /></span>
            <h3 className="a-h3" style={{ fontSize: "1.25rem" }}>Course Studio</h3>
            <p className="a-muted" style={{ lineHeight: 1.6 }}>Plan a Udemy-style course: outcomes, sections, lectures, quizzes and a publish-readiness checklist.</p>
          </Link>
          <Link href="/academy/studio#slides" className="a-card w4" data-spotlight data-reveal="up" style={{ "--i": 3, "--a": "#a78bfa", display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "1.2rem", alignItems: "center" } as CSSProperties}>
            <div style={{ display: "grid", gap: ".8rem" }}>
              <span className="a-icon-tile" style={{ "--a": "#7c3aed", "--b": "#a78bfa" } as CSSProperties}><Presentation size={22} /></span>
              <h3 className="a-h3" style={{ fontSize: "1.4rem" }}>Presentations</h3>
              <p className="a-muted" style={{ lineHeight: 1.6 }}>Generate an editable deck with eight layouts and four themes, present full-screen with speaker notes, or print to PDF.</p>
            </div>
            <div className="a-slide t-aurora" aria-hidden="true"><div className="a-slide-inner"><span className="s-kicker">Quarterly review</span><h1>Evidence before claims.</h1><p style={{ opacity: .8 }}>Measure before and after.</p></div></div>
          </Link>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- 12 stages */}
    <section className="a-sec" style={{ background: "#070b16", borderBlock: "1px solid var(--line)" }}>
      <div className="a-shell">
        <SectionHead eyebrow="The exact 12-stage system" title={<>The work is <em className="a-grad">the lesson.</em></>} lede="Every mission requires a scenario, constraints, deliverables, evidence, a definition of done, failure cases, a rubric and a next action." />
        <StageExplorer stages={STAGES} help={STAGE_HELP} />
      </div>
    </section>

    {/* ---------------------------------------------------------------- Mission demo */}
    <section className="a-sec">
      <div className="a-shell a-two" style={{ alignItems: "center" }}>
        <AnomalyDemo />
        <div style={{ display: "grid", gap: "1.2rem" }}>
          <span className="a-eyebrow">Try a mission</span>
          <h2 className="a-h2">Don&apos;t just answer questions. <em className="a-grad">Do the work.</em></h2>
          <p className="a-lede">Missions put you inside a realistic workplace with fictional data. You investigate, decide and explain — then a reviewer scores you against a published rubric.</p>
          <ul className="a-check">{["Problem solving 20% · Correctness 30%", "Testing & failure handling 25%", "Communication & presentation 25%"].map(x => <li key={x}><Check size={16} />{x}</li>)}</ul>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- Assessment & evidence */}
    <section className="a-sec" style={{ paddingTop: 0 }}>
      <div className="a-shell">
        <SectionHead eyebrow="Assessment & credentials" title={<>Honest progress, <em className="a-grad">layer by layer.</em></>} lede="Learning, assessment, verification and real workplace experience are separate claims — and your records keep them visibly separate." />
        <div className="a-bento">
          <div className="a-card w6" data-reveal="up">
            <p className="a-eyebrow">Exact submission lifecycle</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: "1rem", alignItems: "center" }}>{LIFECYCLE.map((s, k) => <span key={s} style={{ display: "inline-flex", gap: ".5rem", alignItems: "center" }}><span className={`a-chip ${k === LIFECYCLE.length - 1 ? "a-chip-green" : k === 3 ? "a-chip-amber" : ""}`} style={{ fontSize: ".72rem" }}>{s}</span>{k < LIFECYCLE.length - 1 && <ArrowRight size={13} className="a-muted" />}</span>)}</div>
          </div>
          {LEVELS.map(([l, t, d], i) => <div key={l} className="a-card" data-reveal="up" style={{ "--i": i, gridColumn: i < 3 ? "span 2" : "span 3" } as CSSProperties}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span className="a-icon-tile" style={{ width: 40, height: 40, fontWeight: 800 }}>{l}</span>{i > 2 && <span className="a-chip a-chip-amber">Separate claim</span>}</div>
            <h3 className="a-h3" style={{ marginTop: "1rem" }}>{t}</h3><p className="a-muted" style={{ marginTop: ".4rem", lineHeight: 1.6, fontSize: ".92rem" }}>{d}</p>
          </div>)}
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- Pathways */}
    <section className="a-sec" style={{ paddingTop: 0 }}>
      <div className="a-shell">
        <SectionHead eyebrow="Learning pathways" title={<>Routes that <em className="a-grad">add up.</em></>}>
          <Link href="/academy/pathways" className="a-btn a-btn-glass">All pathways <ArrowRight size={16} /></Link>
        </SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {PATHWAYS.slice(0, 4).map((p, i) => <Link key={p.id} href={`/academy/pathways#${p.id}`} className="a-card" data-spotlight data-reveal="up" style={{ "--i": i, display: "grid", gap: ".8rem" } as CSSProperties}>
            <Layers size={20} color="#a78bfa" /><h3 className="a-h3">{p.name}</h3><p className="a-muted" style={{ fontSize: ".9rem" }}>{p.outcome}</p>
            <div style={{ display: "flex", gap: ".3rem", flexWrap: "wrap" }}>{p.includes.map(c => <span key={c} className="a-chip">{c}</span>)}</div>
          </Link>)}
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- Pricing */}
    <section className="a-sec" style={{ background: "linear-gradient(180deg, transparent, #0a0718 25%, #0a0718 75%, transparent)" }}>
      <div className="a-shell">
        <SectionHead center eyebrow="Packages" title={<>Choose a package. <em className="a-grad">Access follows.</em></>} lede="Everyone starts free on Explorer. Your dashboard, units and studio tools unlock according to the package active on your account." />
        <PricingCards signedIn={!!account} currentPlan={access?.plan.id} />
        <p className="a-muted" style={{ textAlign: "center", marginTop: "1.4rem", fontSize: ".82rem" }}><Lock size={12} style={{ display: "inline", marginRight: 4 }} />Access is checked on the server for every lesson, mission and tool. <Link href="/academy/pricing" style={{ textDecoration: "underline" }}>Compare packages in detail</Link></p>
      </div>
    </section>

    {/* ---------------------------------------------------------------- Business */}
    <section className="a-sec">
      <div className="a-shell">
        <div className="a-card a-beam" style={{ padding: "clamp(1.6rem, 4vw, 3rem)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", alignItems: "center", background: "linear-gradient(135deg, #111a33, #0a0f1d)" }}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <span className="a-eyebrow">Academy for Business</span>
            <h2 className="a-h2" style={{ fontSize: "clamp(1.8rem, 3.6vw, 2.8rem)" }}>Develop the capability your business <em className="a-grad">actually needs.</em></h2>
            <p className="a-muted" style={{ lineHeight: 1.6 }}>Role-based paths, employee rosters, capability gaps and manager reports — with a clear privacy boundary between personal and employer-visible learning data.</p>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}><Link href="/academy/business" className="a-btn a-btn-white">Train my team <ArrowRight size={16} /></Link><Link href="/connect/whatsapp?topic=academy" className="a-btn a-btn-glass">Talk to us</Link></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".7rem" }}>
            {[[Users, "Team rosters"], [Briefcase, "Role-based paths"], [ShieldCheck, "Privacy boundaries"], [Building2, "Manager reports"]].map(([I, t]) => { const Icon = I as typeof Users; return <div key={t as string} className="a-glass" style={{ padding: "1rem", display: "grid", gap: ".5rem" }}><Icon size={20} color="#a78bfa" /><strong style={{ fontSize: ".92rem" }}>{t as string}</strong></div>; })}
          </div>
        </div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- FAQ */}
    <section className="a-sec" style={{ paddingTop: 0 }}>
      <div className="a-shell" style={{ maxWidth: 900 }}>
        <SectionHead center eyebrow="FAQ" title={<>Questions, <em className="a-grad">answered clearly.</em></>} />
        <div className="a-faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div>
    </section>

    {/* ---------------------------------------------------------------- CTA */}
    <section className="a-sec" style={{ paddingTop: 0 }}>
      <div className="a-shell">
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 32, padding: "clamp(2.2rem, 6vw, 4.5rem)", textAlign: "center", border: "1px solid var(--line-2)", isolation: "isolate" }}>
          <div className="a-aurora" aria-hidden="true" style={{ opacity: .6 }}><i /><i /><i /></div>
          <div style={{ position: "relative", display: "grid", gap: "1.2rem", justifyItems: "center" }}>
            <h2 className="a-h2">Start with what you can <em className="a-grad">prove.</em></h2>
            <p className="a-lede">Create a free account in under a minute. Upgrade only when you are ready.</p>
            <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href={account ? "/academy/learn" : "/academy/register"} className="a-btn a-btn-primary a-btn-lg">{account ? "Open my dashboard" : "Create my free account"} <ArrowRight size={18} /></Link>
              <Link href="/academy/pricing" className="a-btn a-btn-glass a-btn-lg">See packages</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicFrame>;
}
