import { redirect } from "next/navigation";
import { AcademyHeader } from "../_components/chrome";
import { AuthArt } from "../_components/auth-art";
import { SignInForm } from "../_components/auth-forms";
import { getAcademyAccount, safeNext } from "../../../lib/academy/auth";

export const metadata = { title: "Sign in · DigitalBurj Academy" };

export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  if (await getAcademyAccount().catch(() => null)) redirect(next);
  return <div className="acad"><AcademyHeader />
    <main className="a-auth"><AuthArt title={<>Pick up <em className="a-grad">where you left off.</em></>} sub="Your missions, drafts, studio projects and evidence are waiting." />
      <div className="a-auth-form"><SignInForm next={next} linkHref={`/academy/link?next=${encodeURIComponent(next)}`} /></div>
    </main></div>;
}
