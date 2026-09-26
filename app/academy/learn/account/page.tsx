import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CreditCard, LogOut, Sparkles, UserRound } from "lucide-react";
import { getDb } from "../../../../db";
import { academyEntitlements, academyOrders } from "../../../../db/schema";
import { requireAcademyAccount } from "../../../../lib/academy/auth";
import { accessFor } from "../../../../lib/academy/access";
import { isPlanId, planById, withVat } from "../../../../lib/academy/plans";
import { signOutAction } from "../../actions";

export const metadata = { title: "Package & billing · DigitalBurj Academy" };
const STATUS: Record<string, [string, string]> = { payment_pending: ["Payment pending", "a-chip-amber"], paid: ["Paid", "a-chip-green"], free: ["Free", "a-chip-green"], cancelled: ["Cancelled", ""] };

export default async function Account({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const account = await requireAcademyAccount("/academy/learn/account");
  const { plan, entitlement, daysLeft } = await accessFor(account.id);
  const db = getDb();
  const [orders, ents] = await Promise.all([
    db.select().from(academyOrders).where(eq(academyOrders.accountId, account.id)).orderBy(desc(academyOrders.createdAt)),
    db.select().from(academyEntitlements).where(eq(academyEntitlements.accountId, account.id)).orderBy(desc(academyEntitlements.createdAt)),
  ]);
  const placed = order ? orders.find(o => o.id === order) : undefined;
  return <>
    <div><span className="a-eyebrow">Account</span><h1 className="a-h2" style={{ fontSize: "2.2rem", marginTop: ".5rem" }}>Package & billing</h1></div>
    {placed?.status === "payment_pending" && <div className="a-alert a-alert-warn"><CreditCard size={18} style={{ flex: "none" }} /><span>Order <strong className="a-mono">{placed.id.slice(0, 8).toUpperCase()}</strong> for {planById[placed.plan as keyof typeof planById]?.name} is recorded as <strong>payment pending</strong>. Online payment isn&apos;t connected yet — the DigitalBurj team will contact you at {account.email}. Access activates once payment is confirmed. <Link href="/connect/whatsapp?topic=academy" style={{ textDecoration: "underline" }}>Message us</Link></span></div>}
    <div className="a-two">
      <section className="a-card a-beam" style={{ display: "grid", gap: ".8rem" }}>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}><Sparkles size={19} color="#a78bfa" /><h2 className="a-h3">Current package</h2></div>
        <p style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-.03em" }}>{plan.name}</p>
        <p className="a-muted">{plan.tagline}</p>
        <p className="a-muted" style={{ fontSize: ".85rem" }}>{entitlement ? `Active since ${entitlement.startsAt.toLocaleDateString("en-GB")} via ${entitlement.source}${daysLeft !== null ? ` · ${daysLeft} days left (until ${entitlement.endsAt!.toLocaleDateString("en-GB")})` : ""}` : "Free Explorer access — no expiry."}</p>
        <ul className="a-check">{plan.highlights.map(h => <li key={h}>✓ {h}</li>)}</ul>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}><Link href="/academy/pricing" className="a-btn a-btn-primary">{plan.id === "professional" ? "Compare packages" : "Upgrade"}</Link><Link href="/support" className="a-btn a-btn-glass">Billing help</Link></div>
      </section>
      <section className="a-card" style={{ display: "grid", gap: ".7rem", alignContent: "start" }}>
        <div style={{ display: "flex", gap: ".6rem", alignItems: "center" }}><UserRound size={19} color="#a78bfa" /><h2 className="a-h3">Profile</h2></div>
        <dl style={{ display: "grid", gap: ".5rem", fontSize: ".9rem" }}>{[["Name", account.name], ["Email", account.email], ["Sign-in", account.passwordHash ? (account.platformUserId ? "Email & password + DigitalBurj account" : "Email & password") : "DigitalBurj account"], ["Route", account.route], ["Experience", account.experience || "—"], ["Weekly availability", account.availability || "—"], ["Member since", account.createdAt.toLocaleDateString("en-GB")]].map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", borderBottom: "1px solid var(--line)", paddingBottom: ".45rem" }}><dt className="a-muted">{k}</dt><dd style={{ fontWeight: 650, textAlign: "right" }}>{v}</dd></div>)}</dl>
        <form action={signOutAction}><button className="a-btn a-btn-glass a-btn-sm"><LogOut size={15} />Sign out</button></form>
      </section>
    </div>
    <section className="a-card">
      <h2 className="a-h3">Orders</h2>
      {orders.length ? <div className="a-table-wrap" style={{ marginTop: ".8rem" }}><table className="a-table"><thead><tr><th>Order</th><th>Package</th><th>Billing</th><th>Amount (incl. VAT)</th><th>Promotion</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>{orders.map(o => { const [label, cls] = STATUS[o.status] ?? [o.status, ""]; return <tr key={o.id}><td className="a-mono">{o.id.slice(0, 8).toUpperCase()}</td><td>{isPlanId(o.plan) ? planById[o.plan].name : o.plan}</td><td>{o.billing}</td><td>AED {withVat(o.amount - o.discount).toLocaleString()}</td><td>{o.coupon ?? "—"}</td><td><span className={`a-chip ${cls}`}>{label}</span></td><td>{o.createdAt.toLocaleDateString("en-GB")}</td></tr>; })}</tbody></table></div> : <p className="a-muted" style={{ marginTop: ".6rem" }}>No orders yet.</p>}
      {ents.length > 0 && <p className="a-muted" style={{ fontSize: ".78rem", marginTop: ".9rem" }}>Access history: {ents.map(e => `${isPlanId(e.plan) ? planById[e.plan].name : e.plan} (${e.status})`).join(" → ")}</p>}
    </section>
  </>;
}
