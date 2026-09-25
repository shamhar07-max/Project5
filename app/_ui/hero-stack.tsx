"use client";
import { useEffect, useState } from "react";
import { BadgeCheck, Bot, Code2, GitBranch } from "lucide-react";
import { useReducedMotion } from "./use-reduced-motion";

const code = [
  ["kw", "const "], ["id", "idea"], ["op", " = "], ["fn", "discover"], ["op", "(problem);"],
  ["br", ""],
  ["kw", "const "], ["id", "decision"], ["op", " = "], ["fn", "validate"], ["op", "(idea);"],
  ["br", ""],
  ["kw", "if "], ["op", "(decision === "], ["st", "\"BUILD\""], ["op", ") "], ["fn", "ship"], ["op", "(product);"],
] as const;

const states = ["IDEA", "DESIGNED", "APPROVED", "BUILDING", "TESTING", "PILOT", "LIVE"];

/** Illustrative product surfaces floating beside the hero: editor, automation run and evidence record. */
export function HeroStack() {
  const [chars, setChars] = useState(0);
  const [stage, setStage] = useState(0);
  const still = useReducedMotion();
  const total = code.reduce((n, [, t]) => n + t.length, 0);
  useEffect(() => {
    if (still) return;
    const a = setInterval(() => setChars(c => (c >= total + 40 ? 0 : c + 1)), 55);
    const b = setInterval(() => setStage(s => (s + 1) % states.length), 1300);
    return () => { clearInterval(a); clearInterval(b); };
  }, [total, still]);
  const typed = still ? total : chars;
  const shownStage = still ? states.length - 1 : stage;
  const starts: number[] = [];
  code.reduce((acc, [, t]) => { starts.push(acc); return acc + t.length; }, 0);
  return <div className="hero-stack" aria-hidden="true">
    <div className="hs-card hs-editor" data-tilt>
      <div className="hs-bar"><i /><i /><i /><span><Code2 size={13} /> studio / validate.ts</span></div>
      <pre>{code.map(([k, t], i) => {
        if (k === "br") return <br key={i} />;
        const shown = t.slice(0, Math.max(0, typed - starts[i]));
        return <span key={i} className={`tk-${k}`}>{shown}</span>;
      })}<span className="caret" /></pre>
    </div>
    <div className="hs-card hs-flow" data-tilt>
      <div className="hs-head"><Bot size={15} /> Business AI · Invoice triage<span className={`hs-pill ${shownStage === states.length - 1 ? "ok" : ""}`}>{states[shownStage]}</span></div>
      <div className="hs-track">{states.map((s, i) => <span key={s} className={i <= shownStage ? "on" : ""} />)}</div>
      <div className="hs-rows">
        <span><GitBranch size={13} /> Human approval · high-risk step</span>
        <span><b>Baseline</b> measured before automation</span>
      </div>
    </div>
    <div className="hs-card hs-cred" data-tilt>
      <div className="hs-head"><BadgeCheck size={15} /> Evidence record</div>
      <strong>Practical mission · API design</strong>
      <div className="hs-states"><span>DECLARED</span><span>ASSESSED</span><span className="on">VERIFIED</span></div>
      <small>Illustrative interface</small>
    </div>
  </div>;
}
