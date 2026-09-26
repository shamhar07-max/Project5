import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { academyProgress } from "../../../../db/schema";
import { requireAcademyAccount } from "../../../../lib/academy/auth";
import { accessFor } from "../../../../lib/academy/access";
import { CATALOG } from "../../../../lib/academy/catalog";
import { FLAGSHIP } from "../../../../lib/academy/curriculum";
import { canAccessCourse } from "../../../../lib/academy/plans";
import { CourseCard } from "../../_components/client";

export const metadata = { title: "My courses · DigitalBurj Academy" };

export default async function MyCourses() {
  const account = await requireAcademyAccount("/academy/learn/courses");
  const { plan } = await accessFor(account.id);
  const progress = await getDb().select().from(academyProgress).where(eq(academyProgress.accountId, account.id));
  const started = CATALOG.filter(c => progress.some(p => p.courseCode === c.code));
  const unlocked = CATALOG.filter(c => canAccessCourse(plan, c) && !started.includes(c));
  const locked = CATALOG.filter(c => !canAccessCourse(plan, c));
  const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" };
  const href = (code: string) => `/academy/learn/courses/${code}`;
  return <>
    <div><span className="a-eyebrow">My courses</span><h1 className="a-h2" style={{ fontSize: "2.2rem", marginTop: ".5rem" }}>Your units</h1><p className="a-muted" style={{ marginTop: ".4rem" }}>{plan.name} unlocks {CATALOG.length - locked.length} of {CATALOG.length} units. Locked units still show their first lesson.</p></div>
    {started.length > 0 && <section><h2 className="a-h3" style={{ marginBottom: ".8rem" }}>In progress</h2><div style={grid}>{started.map(c => <CourseCard key={c.code} c={c} authored={FLAGSHIP.includes(c.code)} locked={!canAccessCourse(plan, c)} href={href(c.code)} />)}</div></section>}
    <section><h2 className="a-h3" style={{ marginBottom: ".8rem" }}>Included in your package ({unlocked.length})</h2><div style={grid}>{unlocked.map(c => <CourseCard key={c.code} c={c} authored={FLAGSHIP.includes(c.code)} href={href(c.code)} />)}</div></section>
    {locked.length > 0 && <section><h2 className="a-h3" style={{ marginBottom: ".8rem" }}>Available with an upgrade ({locked.length})</h2><div style={grid}>{locked.map(c => <CourseCard key={c.code} c={c} authored={FLAGSHIP.includes(c.code)} locked href={href(c.code)} />)}</div></section>}
  </>;
}
