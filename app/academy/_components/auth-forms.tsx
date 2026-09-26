"use client";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { registerAction, signInAction, type FormState } from "../actions";
import { PLANS } from "../../../lib/academy/plans";

function strength(p: string) {
  let s = 0;
  if (p.length >= 10) s++; if (p.length >= 14) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++; if (/[^a-z0-9]/i.test(p)) s++;
  return Math.min(4, s);
}
const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];

function Password({ name = "password", autoComplete, show: showMeter }: { name?: string; autoComplete: string; show?: boolean }) {
  const [v, setV] = useState("");
  const [vis, setVis] = useState(false);
  const s = strength(v);
  return <div className="a-field">
    <span>Password</span>
    <div style={{ position: "relative" }}>
      <input className="a-input" name={name} type={vis ? "text" : "password"} autoComplete={autoComplete} required minLength={showMeter ? 10 : 1} value={v} onChange={e => setV(e.target.value)} style={{ paddingRight: "3rem" }} />
      <button type="button" onClick={() => setVis(x => !x)} aria-label={vis ? "Hide password" : "Show password"} style={{ position: "absolute", right: 8, top: 8, width: 32, height: 32, display: "grid", placeItems: "center", background: "none", border: 0, color: "var(--mute)", cursor: "pointer" }}>{vis ? <EyeOff size={17} /> : <Eye size={17} />}</button>
    </div>
    {showMeter && <><div style={{ display: "flex", gap: 4 }} aria-hidden="true">{[0, 1, 2, 3].map(i => <i key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < s ? ["#f43f5e", "#fb923c", "#facc15", "#34d399"][s - 1] : "rgb(255 255 255 / .1)", transition: "background .3s" }} />)}</div>
      <small aria-live="polite">{v ? LABELS[s] : "At least 10 characters with a letter and a number."}</small></>}
  </div>;
}

function Err({ state }: { state: FormState }) {
  return state?.error ? <div className="a-alert a-alert-error" role="alert"><AlertCircle size={18} style={{ flex: "none" }} />{state.error}</div> : null;
}

export function SignInForm({ next, linkHref }: { next: string; linkHref: string }) {
  const [state, action, pending] = useActionState(signInAction, null);
  return <form action={action} className="a-auth-card" noValidate={false}>
    <div><h1 className="a-h2" style={{ fontSize: "2.2rem" }}>Welcome back</h1><p className="a-muted" style={{ marginTop: ".5rem" }}>Sign in to continue learning and creating.</p></div>
    <a href={linkHref} className="a-btn a-btn-glass a-btn-block a-btn-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/db-iconmark.png" alt="" width={20} height={20} style={{ borderRadius: 5 }} />Continue with DigitalBurj account</a>
    <div className="a-or">or with email</div>
    <Err state={state} />
    <input type="hidden" name="next" value={next} />
    <label className="a-field"><span>Email</span><input className="a-input" name="email" type="email" autoComplete="email" required defaultValue={state?.fields?.email} /></label>
    <Password autoComplete="current-password" />
    <button className="a-btn a-btn-primary a-btn-block a-btn-lg" disabled={pending}>{pending ? <Loader2 size={18} className="animate-spin" /> : null}Sign in <ArrowRight size={17} /></button>
    <p className="a-muted" style={{ fontSize: ".88rem", textAlign: "center" }}>New to the Academy? <Link href={`/academy/register${next !== "/academy/learn" ? `?next=${encodeURIComponent(next)}` : ""}`} style={{ color: "#c4b5fd", fontWeight: 700 }}>Create a free account</Link></p>
    <p className="a-muted" style={{ fontSize: ".75rem", textAlign: "center", lineHeight: 1.5 }}>Forgot your password? Contact <Link href="/support" style={{ textDecoration: "underline" }}>support</Link> — self-service reset needs the email service to be configured.</p>
  </form>;
}

const EXPERIENCE = ["New to digital work", "Some practical experience", "Working practitioner", "Teacher or trainer"];
const AVAIL = ["1–3 hours", "4–6 hours", "7+ hours"];
const ROUTES = ["Technology", "Professional workplace", "Teaching & content creation", "International readiness"];

export function RegisterForm({ plan: initialPlan, next, linkHref }: { plan: string; next: string; linkHref: string }) {
  const [state, action, pending] = useActionState(registerAction, null);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(PLANS.some(p => p.id === initialPlan) ? initialPlan : "explorer");
  const [route, setRoute] = useState(state?.fields?.route || (initialPlan === "creator" ? "Teaching & content creation" : "Technology"));
  const recommended = useMemo(() => route === "Teaching & content creation" ? "creator" : route === "Professional workplace" ? "professional" : "plus", [route]);
  const [err, setErr] = useState<string | null>(null);

  function nextStep(e: React.MouseEvent<HTMLButtonElement>) {
    const fs = (e.currentTarget.closest("form") as HTMLFormElement).querySelectorAll<HTMLInputElement>(`[data-step="${step}"] input, [data-step="${step}"] select`);
    for (const f of fs) if (!f.checkValidity()) { f.reportValidity(); return; }
    setErr(null); setStep(s => s + 1);
  }
  const show = (n: number) => ({ display: step === n ? "grid" : "none", gap: "1rem" });

  return <form action={action} className="a-auth-card">
    <div style={{ display: "grid", gap: ".8rem" }}>
      <div className="a-steps" aria-hidden="true">{[0, 1, 2].map(i => <i key={i} data-on={i <= step} />)}</div>
      <p className="a-mono a-muted" style={{ fontSize: ".7rem", letterSpacing: ".12em" }}>STEP {step + 1} OF 3 · {["ACCOUNT", "YOUR ROUTE", "PACKAGE"][step]}</p>
      <h1 className="a-h2" style={{ fontSize: "2rem" }}>{["Create your account", "Set up your learner route", "Choose your package"][step]}</h1>
    </div>
    <Err state={state} />{err && <div className="a-alert a-alert-error">{err}</div>}
    <input type="hidden" name="next" value={next} />

    <div data-step="0" style={show(0)}>
      <a href={linkHref} className="a-btn a-btn-glass a-btn-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/db-iconmark.png" alt="" width={20} height={20} style={{ borderRadius: 5 }} />Continue with DigitalBurj account</a>
      <div className="a-or">or with email</div>
      <label className="a-field"><span>Full name</span><input className="a-input" name="name" autoComplete="name" required minLength={2} maxLength={80} defaultValue={state?.fields?.name} /></label>
      <label className="a-field"><span>Email</span><input className="a-input" name="email" type="email" autoComplete="email" required defaultValue={state?.fields?.email} /></label>
      <Password autoComplete="new-password" show />
      <button type="button" className="a-btn a-btn-primary a-btn-block a-btn-lg" onClick={nextStep}>Continue <ArrowRight size={17} /></button>
    </div>

    <div data-step="1" style={show(1)}>
      <p className="a-muted" style={{ fontSize: ".9rem", lineHeight: 1.55 }}>Your diagnostic helps recommend a route. Experienced learners may bypass validated foundation instruction — never assessment or evidence.</p>
      <label className="a-field"><span>Experience</span><select className="a-input" name="experience" defaultValue={state?.fields?.experience || EXPERIENCE[0]}>{EXPERIENCE.map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="a-field"><span>Weekly availability</span><select className="a-input" name="availability" defaultValue={state?.fields?.availability || AVAIL[0]}>{AVAIL.map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="a-field"><span>Preferred route</span><select className="a-input" name="route" value={route} onChange={e => setRoute(e.target.value)}>{ROUTES.map(x => <option key={x}>{x}</option>)}</select></label>
      <label className="a-field"><span>Learning goal <small>(optional)</small></span><textarea className="a-input" name="goal" maxLength={160} rows={2} placeholder="e.g. Move into a junior developer role within a year" defaultValue={state?.fields?.goal} /></label>
      <div style={{ display: "flex", gap: ".6rem" }}><button type="button" className="a-btn a-btn-glass" onClick={() => setStep(0)}><ArrowLeft size={16} />Back</button><button type="button" className="a-btn a-btn-primary" style={{ flex: 1 }} onClick={nextStep}>Continue <ArrowRight size={17} /></button></div>
    </div>

    <div data-step="2" style={show(2)}>
      <div role="radiogroup" aria-label="Package" style={{ display: "grid", gap: ".6rem" }}>
        {PLANS.map(p => <label key={p.id} className="a-card" style={{ padding: ".9rem 1rem", cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: ".8rem", alignItems: "center", borderColor: plan === p.id ? "#a78bfa" : undefined, boxShadow: plan === p.id ? "0 0 0 3px #8b5cf62a" : undefined }}>
          <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} style={{ accentColor: "#8b5cf6", width: 18, height: 18 }} />
          <span><strong>{p.name}</strong>{p.id === recommended && <span className="a-chip a-chip-violet" style={{ marginLeft: ".5rem" }}>Recommended</span>}<br /><small className="a-muted">{p.tagline}</small></span>
          <strong style={{ whiteSpace: "nowrap" }}>{p.monthly ? `AED ${p.monthly}` : "Free"}<small className="a-muted" style={{ fontWeight: 500 }}>{p.monthly ? "/mo" : ""}</small></strong>
        </label>)}
      </div>
      {plan !== "explorer" && <div className="a-alert a-alert-info">You&apos;ll start on Explorer and go to checkout next. {PLANS.find(p => p.id === plan)?.name} unlocks after payment is confirmed or a promotion is applied.</div>}
      <label className="a-check-row"><input type="checkbox" name="progress" required />I consent to DigitalBurj Academy saving my progress, drafts and evidence records. Sharing evidence or a talent profile needs separate consent.</label>
      <label className="a-check-row"><input type="checkbox" name="terms" required />I accept the <Link href="/terms" target="_blank" style={{ textDecoration: "underline" }}>terms</Link> and <Link href="/privacy" target="_blank" style={{ textDecoration: "underline" }}>privacy notice</Link>.</label>
      <label className="a-check-row"><input type="checkbox" name="marketing" />Send me occasional product updates (optional).</label>
      <div style={{ display: "flex", gap: ".6rem" }}><button type="button" className="a-btn a-btn-glass" onClick={() => setStep(1)}><ArrowLeft size={16} />Back</button><button className="a-btn a-btn-primary" style={{ flex: 1 }} disabled={pending}>{pending ? <Loader2 size={18} className="animate-spin" /> : <Check size={17} />}{plan === "explorer" ? "Create free account" : "Create account & continue"}</button></div>
    </div>
    <p className="a-muted" style={{ fontSize: ".88rem", textAlign: "center" }}>Already registered? <Link href="/academy/sign-in" style={{ color: "#c4b5fd", fontWeight: 700 }}>Sign in</Link></p>
  </form>;
}
