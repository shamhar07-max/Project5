"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const decisions = [
  { k: "BUILD", c: "#10b981", d: "Evidence supports proceeding. Define scope, acceptance criteria and commercial terms." },
  { k: "RESHAPE", c: "#f59e0b", d: "The opportunity exists, but scope, positioning, product or implementation should change first." },
  { k: "STOP", c: "#f43f5e", d: "Evidence does not justify a broader build right now — the cheapest software is the software you did not need." },
];
const leaks = [
  { k: "Time leak", m: "Cycle time, manual hours, wait time", f: "Remove steps, combine duplicates, automate the deterministic hand-offs." },
  { k: "Cost leak", m: "Process cost, rework, exception rate", f: "Standardize data and ownership before paying for another tool." },
  { k: "Revenue leak", m: "Conversion, response time, backlog", f: "Route and follow up leads automatically, with a human on the high-value calls." },
  { k: "Customer experience leak", m: "Resolution time, satisfaction", f: "AI-assisted triage and summaries, with approvals where the answer matters." },
  { k: "Data quality leak", m: "Error rate, correction rate", f: "Validate at entry, reconcile systems through integrations, alert on drift." },
  { k: "Compliance risk", m: "Audit completeness, exceptions", f: "Define approvals, log every action, keep prohibited actions out of automation." },
  { k: "Process control risk", m: "Unowned steps, exception rate", f: "Clarify ownership and approval gates before automation touches it." },
];
const risk = [
  { k: "Low", e: "Automatic where policy allows", c: "#10b981" },
  { k: "Medium", e: "Automatic with strong logging and monitoring", c: "#22d3ee" },
  { k: "High", e: "Human approval required", c: "#f59e0b" },
  { k: "Critical", e: "No autonomous execution — a controlled human process", c: "#f43f5e" },
];

/** Signature decisions from Studio and Business AI, made tangible. */
export function SignatureLab() {
  const [tab, setTab] = useState<"decide" | "leak" | "risk">("decide");
  const [d, setD] = useState(0);
  const [l, setL] = useState(0);
  const [r, setR] = useState(2);
  const tabs = [["decide", "Studio · Build / Reshape / Stop"], ["leak", "Business AI · Leak finder"], ["risk", "AI · Human control dial"]] as const;
  return <div className="lab">
    <div className="lab-tabs" role="tablist" aria-label="Signature decisions">
      {tabs.map(([id, label]) => <button key={id} role="tab" type="button" id={`lab-${id}`} aria-selected={tab === id} aria-controls="lab-panel" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{label}</button>)}
    </div>
    <div className="lab-panel" role="tabpanel" id="lab-panel" aria-labelledby={`lab-${tab}`} key={tab}>
      {tab === "decide" && <div className="lab-decide">
        <div className="lab-choices">{decisions.map((x, i) => <button key={x.k} type="button" onClick={() => setD(i)} className={d === i ? "on" : ""} style={{ "--c": x.c } as React.CSSProperties} aria-pressed={d === i}>{x.k}</button>)}</div>
        <div className="lab-result" style={{ "--c": decisions[d].c } as React.CSSProperties}><span className="lab-kicker">Validation decision</span><strong>{decisions[d].k}</strong><p>{decisions[d].d}</p><Link href="/workspace/intake?service=studio">Validate my idea <ArrowUpRight size={16} /></Link></div>
      </div>}
      {tab === "leak" && <div className="lab-leak">
        <div className="lab-list">{leaks.map((x, i) => <button key={x.k} type="button" onClick={() => setL(i)} className={l === i ? "on" : ""} aria-pressed={l === i}><span>{String(i + 1).padStart(2, "0")}</span>{x.k}</button>)}</div>
        <div className="lab-result" style={{ "--c": "#10b981" } as React.CSSProperties}><span className="lab-kicker">We measure</span><strong>{leaks[l].m}</strong><p>{leaks[l].f}</p><Link href="/workspace/intake?service=business">Diagnose my process <ArrowUpRight size={16} /></Link></div>
      </div>}
      {tab === "risk" && <div className="lab-risk">
        <div className="dial" style={{ "--c": risk[r].c, "--p": (r + .5) / risk.length } as React.CSSProperties}>
          <svg viewBox="0 0 200 110" aria-hidden="true"><path d="M15 100 A85 85 0 0 1 185 100" fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="14" strokeLinecap="round" /><path d="M15 100 A85 85 0 0 1 185 100" fill="none" stroke="var(--c)" strokeWidth="14" strokeLinecap="round" pathLength="1" strokeDasharray={`${(r + 1) / risk.length} 1`} className="dial-arc" /></svg>
          <strong>{risk[r].k}</strong>
        </div>
        <input type="range" min={0} max={3} step={1} value={r} onChange={e => setR(Number(e.target.value))} aria-label="Risk level" aria-valuetext={risk[r].k} />
        <p className="lab-risk-exec"><span className="lab-kicker">Execution</span>{risk[r].e}</p>
      </div>}
    </div>
  </div>;
}
