"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, Building2, FileLock2, GraduationCap, Inbox, Layers3, MessagesSquare, ShieldCheck } from "lucide-react";

const areas = [
  { id: "intake", label: "Enquiries", Icon: Inbox, href: "/workspace/intake", c: "#e10613", t: "Send a Studio or Business AI brief", d: "Describe the problem, users, current state, desired outcome, budget and timeline. Your enquiry is stored against you or your organization.", rows: ["Project name", "Problem", "Intended users", "Desired outcome"] },
  { id: "engagements", label: "Engagements", Icon: Layers3, href: "/workspace/engagements", c: "#2563eb", t: "Turn an enquiry into a working brief", d: "Structured discovery entries, measured vs estimated baselines, a discovery request stage and a full event history.", rows: ["Discovery entry", "Baseline · measured", "Stage · discovery requested", "Event history"] },
  { id: "academy", label: "Academy", Icon: GraduationCap, href: "/workspace/academy", c: "#8b5cf6", t: "Save units and practise", d: "Save catalogue units, write practice drafts across the 12-stage task model and manage your learner profile and consent.", rows: ["Saved unit · DB-02", "Draft · BUILD stage", "Draft · TEST stage", "Profile & consent"] },
  { id: "talent", label: "Talent", Icon: BadgeCheck, href: "/workspace/talent", c: "#f59e0b", t: "A private capability profile", d: "Record self-reported evidence, clearly marked Declared and Private. Nothing can self-assign a verified status.", rows: ["Headline", "Evidence · Declared", "Visibility · Private", "Verification · not requested"] },
  { id: "jobs", label: "Jobs", Icon: BriefcaseBusiness, href: "/workspace/jobs", c: "#f43f5e", t: "Track your opportunities", d: "A personal tracker for roles you are pursuing, with status updates that stay private to you.", rows: ["Role", "Company", "Status · Interview", "Next step"] },
  { id: "organizations", label: "Organizations", Icon: Building2, href: "/workspace/organizations", c: "#10b981", t: "Work as a team", d: "Create an organization, invite members with roles and switch context before working on shared records.", rows: ["Organization", "Members · 4", "Role · admin", "Invitations"] },
  { id: "files", label: "Files & messages", Icon: MessagesSquare, href: "/workspace/messages", c: "#22d3ee", t: "Documents and conversation", d: "Private document storage and organization messages, scoped to the context you are working in.", rows: ["brief-v2.pdf", "baseline.xlsx", "Team message", "Support ticket"] },
  { id: "security", label: "Security", Icon: ShieldCheck, href: "/workspace/security", c: "#64748b", t: "See what happened, and who did it", d: "Server-side authorization on every record, organization boundaries and an activity log of allowed and denied actions.", rows: ["allow · enquiry.create", "allow · file.upload", "deny · role_denied", "allow · org.switch"] },
];

export function WorkspaceTour() {
  const [sel, setSel] = useState(areas[0].id);
  const a = areas.find(x => x.id === sel)!;
  return <div className="tour" style={{ "--c": a.c } as CSSProperties}>
    <div className="tour-nav" role="tablist" aria-label="Workspace areas">
      {areas.map(x => <button key={x.id} type="button" role="tab" aria-selected={sel === x.id} className={sel === x.id ? "on" : ""} style={{ "--c": x.c } as CSSProperties} onClick={() => setSel(x.id)}><x.Icon size={17} />{x.label}</button>)}
    </div>
    <div className="tour-body" role="tabpanel" key={a.id}>
      <div className="tour-copy">
        <h3>{a.t}</h3>
        <p>{a.d}</p>
        <Link href={a.href} className="tour-link">Open {a.label} <ArrowUpRight size={16} /></Link>
      </div>
      <div className="tour-screen" aria-hidden="true">
        <div className="dev-chrome"><i /><i /><i /><span>app.digitalburj.com{a.href}</span></div>
        <div className="tour-screen-body">
          <div className="tour-screen-head"><a.Icon size={18} /><strong>{a.label}</strong><span className="chip">Illustrative</span></div>
          {a.rows.map((r, i) => <div key={r} className="tour-row" style={{ "--i": i } as CSSProperties}><FileLock2 size={14} /><span>{r}</span><em /></div>)}
        </div>
      </div>
    </div>
  </div>;
}
