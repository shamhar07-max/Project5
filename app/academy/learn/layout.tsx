import { getAcademyAccount } from "../../../lib/academy/auth";
import { accessFor } from "../../../lib/academy/access";
import { LearnShell } from "../_components/app-shell";

export const dynamic = "force-dynamic";

export default async function LearnLayout({ children }: { children: React.ReactNode }) {
  // Each page calls requireAcademyAccount with its own path, so anonymous visitors
  // come back to the exact page after signing in.
  const account = await getAcademyAccount();
  if (!account) return children;
  const { plan, daysLeft } = await accessFor(account.id);
  return <LearnShell name={account.name} email={account.email} planName={plan.name} planId={plan.id} daysLeft={daysLeft} tools={plan.tools}>{children}</LearnShell>;
}
