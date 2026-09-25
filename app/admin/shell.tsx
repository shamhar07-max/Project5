import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Activity, BookOpen, Briefcase, CreditCard, Gauge, Inbox, KeyRound, Layers3, LifeBuoy, ScrollText, Sparkles, BadgeCheck, ArrowLeft } from "lucide-react";
import { hasSection, STAFF_ROLES, type AdminSection, type StaffRole } from "../../lib/platform";

const items: { key: AdminSection; label: string; Icon: typeof Gauge }[] = [
  { key: "overview", label: "Executive overview", Icon: Gauge },
  { key: "academy", label: "Academy", Icon: BookOpen },
  { key: "studio", label: "Studio", Icon: Layers3 },
  { key: "business", label: "Business AI", Icon: Sparkles },
  { key: "talent", label: "Talent", Icon: BadgeCheck },
  { key: "jobs", label: "Jobs", Icon: Briefcase },
  { key: "finance", label: "Finance", Icon: CreditCard },
  { key: "support", label: "Support desk", Icon: LifeBuoy },
  { key: "leads", label: "Channel requests", Icon: Inbox },
  { key: "status", label: "Status & incidents", Icon: Activity },
  { key: "access", label: "Identity & access", Icon: KeyRound },
  { key: "audit", label: "Audit log", Icon: ScrollText },
];

export function AdminShell({ roles, email, active, children }: { roles: Set<StaffRole>; email: string; active: AdminSection; children: ReactNode }) {
  return <div className="app app-admin">
    <aside className="app-side">
      <Link href="/admin" className="app-brand"><Image src="/brand/db-iconmark.png" width={36} height={36} alt="" unoptimized /><span>DigitalBurj Admin</span></Link>
      <div className="app-context"><small>Signed in as</small><strong>{email}</strong><em>{[...roles].map(r => STAFF_ROLES[r]).join(" · ")}</em></div>
      <nav aria-label="Administration"><div className="app-nav-group"><p>Operations</p>
        {items.filter(i => hasSection(roles, i.key)).map(({ key, label, Icon }) => <Link key={key} href={key === "overview" ? "/admin" : `/admin/${key}`} className={active === key ? "on" : ""} aria-current={active === key ? "page" : undefined}><Icon size={17} aria-hidden="true" /><span>{label}</span></Link>)}
      </div><div className="app-nav-group"><p>Exit</p><Link href="/workspace"><ArrowLeft size={17} /><span>Back to workspace</span></Link></div></nav>
    </aside>
    <main className="app-main">{children}</main>
  </div>;
}

export function Tabs({ base, tabs, active }: { base: string; tabs: [string, string][]; active: string }) {
  return <nav className="app-tabs" aria-label="Sections">{tabs.map(([k, l]) => <Link key={k} href={`${base}?tab=${k}`} className={active === k ? "on" : ""} aria-current={active === k ? "page" : undefined}>{l}</Link>)}</nav>;
}
