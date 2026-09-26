import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { academyProgress } from "../../../../../db/schema";
import { requireAcademyAccount } from "../../../../../lib/academy/auth";
import { accessFor } from "../../../../../lib/academy/access";
import { courseDetail, STAGE_HELP } from "../../../../../lib/academy/curriculum";
import { canAccessCourse, cheapestPlanFor, hasFeature } from "../../../../../lib/academy/plans";
import { Player } from "../../../_components/player";

export default async function CoursePlayer({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const d = courseDetail(code);
  if (!d) notFound();
  const account = await requireAcademyAccount(`/academy/learn/courses/${code}`);
  const { plan } = await accessFor(account.id);
  const allowed = canAccessCourse(plan, d);
  const missions = allowed && (hasFeature(plan, "missions") || !!plan.extraCourses?.includes(code));
  const row = await getDb().select().from(academyProgress).where(and(eq(academyProgress.accountId, account.id), eq(academyProgress.courseCode, code))).get();
  const upgrade = cheapestPlanFor(p => canAccessCourse(p, d));
  const missionUpgrade = cheapestPlanFor(p => canAccessCourse(p, d) && p.features.includes("missions"));
  return <Player detail={d} allowed={allowed} missions={missions} upgradeName={upgrade.name} upgradeId={upgrade.id} missionUpgradeName={missionUpgrade.name}
    initialLessons={row ? JSON.parse(row.lessons) : []} initialStages={row ? JSON.parse(row.stages) : []} stageHelp={STAGE_HELP} />;
}
