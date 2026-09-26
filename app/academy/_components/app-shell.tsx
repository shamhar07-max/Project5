"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Clapperboard, FileText, Home, LayoutDashboard, LayoutTemplate, Lock, LogOut, Menu, Presentation, Sparkles, Trophy, UserCog, X } from "lucide-react";
import type { StudioTool } from "../../../lib/academy/plans";
import { signOutAction } from "../actions";

type Props = { name: string; email: string; planName: string; planId: string; daysLeft: number | null; tools: StudioTool[]; children: React.ReactNode };

export function LearnShell({ name, email, planName, planId, daysLeft, tools, children }: Props) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState(path);
  if (last !== path) { setLast(path); setOpen(false); }
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const is = (href: string, exact = false) => (exact ? path === href : path === href || path.startsWith(`${href}/`)) ? "page" as const : undefined;
  const tool = (t: StudioTool, href: string, label: string, Icon: typeof Home) => <Link href={href} aria-current={is(href)}><Icon size={17} />{label}{!tools.includes(t) && <Lock size={13} className="a-lock" aria-label="Locked" />}</Link>;
  return <div className="acad a-app">
    <aside className="a-side" data-open={open} aria-label="Academy navigation">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/academy" className="a-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/db-iconmark.png" alt="" width={34} height={34} /><span>DigitalBurj<small>Academy</small></span>
        </Link>
        <button type="button" className="a-mob-toggle" onClick={() => setOpen(false)} aria-label="Close menu"><X size={17} /></button>
      </div>
      <div className="a-plan-card">
        <p className="a-mono a-muted" style={{ fontSize: ".62rem", letterSpacing: ".14em" }}>PACKAGE</p>
        <p style={{ fontWeight: 800, marginTop: ".3rem", display: "flex", alignItems: "center", gap: ".4rem" }}><Sparkles size={15} color="#a78bfa" />{planName}</p>
        <p className="a-muted" style={{ fontSize: ".75rem", marginTop: ".2rem" }}>{daysLeft !== null ? `${daysLeft} days left` : planId === "explorer" ? "Free forever" : "Active"}</p>
        {planId !== "professional" && <Link href="/academy/pricing" className="a-btn a-btn-violet a-btn-sm a-btn-block" style={{ marginTop: ".7rem" }}>Upgrade</Link>}
      </div>
      <nav className="a-side-nav">
        <p>Learn</p>
        <Link href="/academy/learn" aria-current={is("/academy/learn", true)}><LayoutDashboard size={17} />Dashboard</Link>
        <Link href="/academy/learn/courses" aria-current={is("/academy/learn/courses")}><BookOpen size={17} />My courses</Link>
        <Link href="/academy/learn/evidence" aria-current={is("/academy/learn/evidence")}><Trophy size={17} />Evidence & passport</Link>
        <p>Creator Studio</p>
        <Link href="/academy/learn/studio" aria-current={is("/academy/learn/studio", true)}><Sparkles size={17} />Studio home</Link>
        {tool("video", "/academy/learn/studio/video", "Explainer Video", Clapperboard)}
        {tool("lesson", "/academy/learn/studio/lesson-plan", "Lesson Plan", FileText)}
        {tool("course", "/academy/learn/studio/course", "Course Studio", LayoutTemplate)}
        {tool("slides", "/academy/learn/studio/slides", "Presentations", Presentation)}
        <p>Account</p>
        <Link href="/academy/learn/account" aria-current={is("/academy/learn/account")}><UserCog size={17} />Package & billing</Link>
        <Link href="/academy"><Home size={17} />Academy home</Link>
      </nav>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: ".7rem", padding: ".6rem", borderRadius: 14, border: "1px solid var(--line)" }}>
        <span className="a-icon-tile" style={{ width: 36, height: 36, borderRadius: 11, fontWeight: 800 }}>{name.slice(0, 1).toUpperCase()}</span>
        <div style={{ minWidth: 0, flex: 1 }}><p style={{ fontWeight: 700, fontSize: ".85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p><p className="a-muted" style={{ fontSize: ".72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</p></div>
        <form action={signOutAction}><button className="a-btn a-btn-ghost a-btn-sm" aria-label="Sign out" title="Sign out"><LogOut size={16} /></button></form>
      </div>
    </aside>
    {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 65, background: "#0008" }} aria-hidden="true" />}
    <div className="a-main">
      <div className="a-topbar a-no-print">
        <button type="button" className="a-mob-toggle" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={18} /></button>
        <span className="a-muted" style={{ fontSize: ".85rem" }}>{crumb(path)}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
          <Link href="/academy/catalogue" className="a-btn a-btn-ghost a-btn-sm">Catalogue</Link>
          <Link href="/academy/learn/studio" className="a-btn a-btn-glass a-btn-sm"><Sparkles size={14} />New creation</Link>
        </div>
      </div>
      <div className="a-content">{children}</div>
    </div>
  </div>;
}

function crumb(p: string) {
  const parts = p.replace("/academy/learn", "").split("/").filter(Boolean);
  return ["My learning", ...parts.map(x => x.replace(/-/g, " ").replace(/^\w/, c => c.toUpperCase()))].join(" / ");
}

export function Toast({ msg, onDone }: { msg: string | null; onDone: () => void }) {
  useEffect(() => { if (!msg) return; const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [msg, onDone]);
  return msg ? <div className="a-toast" role="status">{msg}</div> : null;
}
