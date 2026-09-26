"use client";
import { useActionState, useState } from "react";
import { AlertCircle, BadgePercent, Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { checkoutAction } from "../actions";
import { PLANS, PROMO_CODE, VAT_RATE, planById, priceFor, type Billing, type PlanId } from "../../../lib/academy/plans";

const aed = (n: number) => `AED ${n.toLocaleString(undefined, { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function CheckoutForm({ initialPlan, initialBilling, currentPlan }: { initialPlan: PlanId; initialBilling: Billing; currentPlan: PlanId }) {
  const [state, action, pending] = useActionState(checkoutAction, null);
  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [billing, setBilling] = useState<Billing>(initialBilling);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<"none" | "ok" | "bad">("none");
  const [confirmed, setConfirmed] = useState(false);
  const plan = planById[planId];
  const base = priceFor(plan, billing);
  const discount = applied === "ok" ? base : 0;
  const vat = Math.round((base - discount) * VAT_RATE * 100) / 100;
  const total = base - discount + vat;
  const paid = PLANS.filter(p => p.monthly > 0);

  return <form action={action} className="a-two" style={{ alignItems: "start" }}>
    <div style={{ display: "grid", gap: "1.2rem" }}>
      <div className="a-card" style={{ display: "grid", gap: "1rem" }}>
        <h2 className="a-h3" style={{ fontSize: "1.2rem" }}>1 · Package</h2>
        <div role="radiogroup" style={{ display: "grid", gap: ".6rem" }}>
          {paid.map(p => <label key={p.id} className="a-card" style={{ padding: ".9rem 1rem", cursor: "pointer", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: ".8rem", alignItems: "center", borderColor: planId === p.id ? "#a78bfa" : undefined, boxShadow: planId === p.id ? "0 0 0 3px #8b5cf62a" : undefined }}>
            <input type="radio" name="plan" value={p.id} checked={planId === p.id} onChange={() => { setPlanId(p.id); setApplied(a => a === "ok" ? "ok" : "none"); }} style={{ accentColor: "#8b5cf6", width: 18, height: 18 }} />
            <span><strong>{p.name}</strong>{currentPlan === p.id && <span className="a-chip a-chip-green" style={{ marginLeft: ".5rem" }}>Current</span>}<br /><small className="a-muted">{p.highlights.slice(0, 2).join(" · ")}</small></span>
            <strong>{aed(priceFor(p, billing))}</strong>
          </label>)}
        </div>
      </div>
      <div className="a-card" style={{ display: "grid", gap: "1rem" }}>
        <h2 className="a-h3" style={{ fontSize: "1.2rem" }}>2 · Billing period</h2>
        <div className="a-seg" role="tablist" style={{ width: "fit-content" }}>
          <button type="button" role="tab" aria-selected={billing === "monthly"} onClick={() => setBilling("monthly")}>Monthly</button>
          <button type="button" role="tab" aria-selected={billing === "annual"} onClick={() => setBilling("annual")}>Annual · 2 months free</button>
        </div>
        <input type="hidden" name="billing" value={billing} />
      </div>
      <div className="a-card" style={{ display: "grid", gap: "1rem" }}>
        <h2 className="a-h3" style={{ fontSize: "1.2rem" }}>3 · Promotion code</h2>
        <div style={{ display: "flex", gap: ".6rem" }}>
          <input className="a-input" name="coupon" value={code} onChange={e => { setCode(e.target.value); setApplied("none"); }} placeholder={`e.g. ${PROMO_CODE}`} autoComplete="off" style={{ textTransform: "uppercase" }} />
          <button type="button" className="a-btn a-btn-glass" onClick={() => setApplied(code.trim().toUpperCase() === PROMO_CODE ? "ok" : code.trim() ? "bad" : "none")}><BadgePercent size={16} />Apply</button>
        </div>
        {applied === "ok" && <div className="a-alert a-alert-ok"><Check size={17} />{PROMO_CODE} applied: 100% off {plan.name}. Final eligibility (one use per package per account) is checked when you confirm.</div>}
        {applied === "bad" && <div className="a-alert a-alert-error"><AlertCircle size={17} />That promotion code is not valid.</div>}
      </div>
    </div>

    <aside className="a-card a-beam" style={{ display: "grid", gap: "1rem", position: "sticky", top: 90 }}>
      <p className="a-eyebrow">Order summary</p>
      <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{plan.name}</strong><span>{aed(base)}</span></div>
      <p className="a-muted" style={{ fontSize: ".82rem", marginTop: "-.6rem" }}>{billing === "annual" ? "12 months of access" : "30 days of access"}</p>
      {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#6ee7b7" }}><span>Promotion {PROMO_CODE}</span><span>−{aed(discount)}</span></div>}
      <div style={{ display: "flex", justifyContent: "space-between" }} className="a-muted"><span>VAT (5%)</span><span>{aed(vat)}</span></div>
      <hr className="a-divider" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><strong>Total due</strong><strong style={{ fontSize: "1.8rem", letterSpacing: "-.03em" }}>{aed(total)}</strong></div>
      {state?.error && <div className="a-alert a-alert-error" role="alert"><AlertCircle size={17} />{state.error}</div>}
      {total > 0 && <div className="a-alert a-alert-warn"><Lock size={17} style={{ flex: "none" }} />Online payment is not connected yet. Your order will be recorded as payment pending; the DigitalBurj team will contact you and access activates once payment is confirmed.</div>}
      <label className="a-check-row"><input type="checkbox" name="confirm" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I confirm this order summary{total === 0 ? " and a zero payable amount" : ""}.</label>
      <button className="a-btn a-btn-primary a-btn-block a-btn-lg" disabled={pending}>{pending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}{total === 0 ? `Activate ${plan.name}` : "Place order"}</button>
      <p className="a-muted" style={{ fontSize: ".75rem", lineHeight: 1.5 }}>Upgrading replaces your current package. Refund requests within 14 days go through support.</p>
    </aside>
  </form>;
}
