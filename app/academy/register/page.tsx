import { redirect } from "next/navigation";
import { AcademyHeader } from "../_components/chrome";
import { AuthArt } from "../_components/auth-art";
import { RegisterForm } from "../_components/auth-forms";
import { getAcademyAccount, safeNext } from "../../../lib/academy/auth";

export const metadata = { title: "Register · DigitalBurj Academy" };

export default async function Register({ searchParams }: { searchParams: Promise<{ plan?: string; next?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next, "/academy/learn?welcome=1");
  if (await getAcademyAccount().catch(() => null)) redirect(sp.plan && sp.plan !== "explorer" ? `/academy/checkout?plan=${sp.plan}` : next);
  return <div className="acad"><AcademyHeader />
    <main className="a-auth"><AuthArt title={<>Learn it. Apply it. <em className="a-grad">Prove it.</em></>} sub="Create a free account in under a minute. Access to units and tools follows the package you choose." />
      <div className="a-auth-form"><RegisterForm plan={sp.plan ?? "explorer"} next={next} linkHref={`/academy/link?next=${encodeURIComponent(sp.plan && sp.plan !== "explorer" ? `/academy/checkout?plan=${sp.plan}` : next)}`} /></div>
    </main></div>;
}
