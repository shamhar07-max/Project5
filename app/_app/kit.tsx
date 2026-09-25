// Shared components for the signed-in app (blueprint Part III-A "Shared components").
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowLeft, Bell, BookOpen, Briefcase, Building2, CheckSquare, CreditCard, Files, Home, Layers3, LifeBuoy, MessagesSquare, Search, Shield, ShieldCheck, Sparkles, UserCog, Webhook, BadgeCheck, Inbox } from "lucide-react";
import { label, tone } from "../../lib/workflow";
import { ChoiceButton } from "./choice-button";

export type ShellInfo = { name: string; email: string; context: string; role: string; unread: number; pendingApprovals: number; staff: boolean };

const nav = [
  { group: "Workspace", items: [
    { href: "/workspace", label: "Home", Icon: Home, key: "home" },
    { href: "/workspace/notifications", label: "Notifications", Icon: Bell, key: "notifications", badge: "unread" as const },
    { href: "/workspace/approvals", label: "Approvals", Icon: CheckSquare, key: "approvals", badge: "approvals" as const },
    { href: "/workspace/search", label: "Search", Icon: Search, key: "search" },
  ] },
  { group: "Divisions", items: [
    { href: "/workspace/academy", label: "Academy", Icon: BookOpen, key: "academy" },
    { href: "/workspace/engagements?service=studio", label: "Studio", Icon: Layers3, key: "studio" },
    { href: "/workspace/engagements?service=business", label: "Business AI", Icon: Sparkles, key: "business" },
    { href: "/workspace/talent", label: "Talent", Icon: BadgeCheck, key: "talent" },
    { href: "/workspace/jobs", label: "Jobs", Icon: Briefcase, key: "jobs" },
  ] },
  { group: "Organization", items: [
    { href: "/workspace/organizations", label: "Organizations", Icon: Building2, key: "organizations" },
    { href: "/workspace/intake", label: "Enquiries", Icon: Inbox, key: "intake" },
    { href: "/workspace/messages", label: "Messages", Icon: MessagesSquare, key: "messages" },
    { href: "/workspace/files", label: "Files", Icon: Files, key: "files" },
    { href: "/workspace/billing", label: "Billing", Icon: CreditCard, key: "billing" },
    { href: "/workspace/support", label: "Support", Icon: LifeBuoy, key: "support" },
    { href: "/workspace/developers", label: "Developers", Icon: Webhook, key: "developers" },
  ] },
  { group: "Account", items: [
    { href: "/workspace/account", label: "Account & privacy", Icon: UserCog, key: "account" },
    { href: "/workspace/security", label: "Security", Icon: Shield, key: "security" },
  ] },
];

export function AppShell({ info, active, children }: { info: ShellInfo; active: string; children: ReactNode }) {
  return <div className="app">
    <aside className="app-side">
      <Link href="/" className="app-brand" aria-label="DigitalBurj home"><Image src="/brand/db-iconmark.png" width={36} height={36} alt="" unoptimized /><span>DigitalBurj</span></Link>
      <Link href="/workspace/organizations" className="app-context"><small>Context</small><strong>{info.context}</strong><em>{info.role}</em></Link>
      <nav aria-label="Workspace">
        {nav.map(g => <div key={g.group} className="app-nav-group"><p>{g.group}</p>{g.items.map(({ href, label: l, Icon, key, badge }) => {
          const count = badge === "unread" ? info.unread : badge === "approvals" ? info.pendingApprovals : 0;
          return <Link key={key} href={href} className={active === key ? "on" : ""} aria-current={active === key ? "page" : undefined}><Icon size={17} aria-hidden="true" /><span>{l}</span>{count > 0 && <b>{count > 99 ? "99+" : count}</b>}</Link>;
        })}</div>)}
        {info.staff && <div className="app-nav-group"><p>DigitalBurj staff</p><Link href="/admin"><ShieldCheck size={17} aria-hidden="true" /><span>Admin</span></Link></div>}
      </nav>
      <div className="app-user"><span>{info.name.slice(0, 1).toUpperCase()}</span><div><strong>{info.name}</strong><small>{info.email}</small></div></div>
    </aside>
    <main className="app-main">{children}</main>
  </div>;
}

export function PageHead({ kicker, title, lede, back, actions }: { kicker: string; title: ReactNode; lede?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode }) {
  return <header className="app-head">
    {back && <Link href={back.href} className="app-back"><ArrowLeft size={15} /> {back.label}</Link>}
    <div className="app-head-row"><div><p className="app-kicker">{kicker}</p><h1>{title}</h1>{lede && <p className="app-lede">{lede}</p>}</div>{actions && <div className="app-head-actions">{actions}</div>}</div>
  </header>;
}

export function Panel({ title, sub, actions, children, tone: t }: { title?: ReactNode; sub?: ReactNode; actions?: ReactNode; children: ReactNode; tone?: "warn" | "info" }) {
  return <section className={`app-panel ${t ? `app-panel-${t}` : ""}`}>
    {(title || actions) && <div className="app-panel-head"><div>{title && <h2>{title}</h2>}{sub && <p>{sub}</p>}</div>{actions}</div>}
    {children}
  </section>;
}

export function Chip({ state, text }: { state: string; text?: string }) {
  return <span className={`chip-s chip-${tone(state)}`}>{text ?? label(state)}</span>;
}

export function Stat({ label: l, value, hint, href }: { label: string; value: ReactNode; hint?: string; href?: string }) {
  const inner = <><small>{l}</small><strong>{value}</strong>{hint && <em>{hint}</em>}</>;
  return href ? <Link href={href} className="app-stat">{inner}</Link> : <div className="app-stat">{inner}</div>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="app-empty"><strong>{title}</strong>{children && <p>{children}</p>}</div>;
}

export function Denied({ children }: { children: ReactNode }) {
  return <div className="app-denied" role="note"><Shield size={18} /> <p>{children}</p></div>;
}

export function Field({ label: l, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="app-field"><span>{l}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export function Btn({ children, kind = "primary", name, value, disabled }: { children: ReactNode; kind?: "primary" | "secondary" | "danger" | "ghost"; name?: string; value?: string; disabled?: boolean }) {
  const className = `app-btn app-btn-${kind}`;
  if (name && value !== undefined) return <ChoiceButton className={className} name={name} value={value} disabled={disabled}>{children}</ChoiceButton>;
  return <button className={className} disabled={disabled}>{children}</button>;
}

export function Timeline({ items }: { items: { at: Date; title: ReactNode; detail?: ReactNode }[] }) {
  if (!items.length) return <Empty title="No history yet" />;
  return <ol className="app-timeline">{items.map((i, n) => <li key={n}><time>{fmt(i.at)}</time><div><strong>{i.title}</strong>{i.detail && <p>{i.detail}</p>}</div></li>)}</ol>;
}

/** Time helpers kept outside components so render stays pure. */
export const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);
export const withinHours = (d: Date | null | undefined, h: number) => Boolean(d && Date.now() - d.getTime() < h * 3600000);

export function fmt(d: Date | null | undefined, withTime = true) {
  if (!d) return "—";
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}), timeZone: "Asia/Dubai" });
}

export function money(minor: number, currency: string) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency }).format(minor / 100);
}
