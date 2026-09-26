import { redirect } from "next/navigation";
import { AcademyHeader, SectionHead } from "../_components/chrome";
import { CheckoutForm } from "../_components/checkout-form";
import { getAcademyAccount } from "../../../lib/academy/auth";
import { accessFor } from "../../../lib/academy/access";
import { isPlanId } from "../../../lib/academy/plans";

export const metadata = { title: "Checkout · DigitalBurj Academy" };
export const dynamic = "force-dynamic";

export default async function Checkout({ searchParams }: { searchParams: Promise<{ plan?: string; billing?: string }> }) {
  const sp = await searchParams;
  const plan = isPlanId(sp.plan) && sp.plan !== "explorer" ? sp.plan : "professional";
  const account = await getAcademyAccount();
  if (!account) redirect(`/academy/register?plan=${plan}`);
  const { plan: current } = await accessFor(account.id);
  return <div className="acad"><AcademyHeader />
    <main className="a-sec" style={{ paddingTop: "3rem" }}>
      <div className="a-shell">
        <SectionHead eyebrow="Checkout" title={<>Confirm your <em className="a-grad">package.</em></>} lede={`Signed in as ${account.email}. You are currently on ${current.name}.`} />
        <CheckoutForm initialPlan={plan} initialBilling={sp.billing === "annual" ? "annual" : "monthly"} currentPlan={current.id} />
      </div>
    </main></div>;
}
