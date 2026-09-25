import { api } from "../../../../lib/api";
import { componentStatus } from "../../../../lib/status";

export const GET = api(async () => {
  const s = await componentStatus();
  return { overall: s.overall, components: s.status, checkedAt: s.checkedAt, incidents: s.recent.filter(i => !["RESOLVED", "COMPLETED"].includes(i.status)).map(i => ({ id: i.id, title: i.title, kind: i.kind, status: i.status, impact: i.impact, components: i.components.split(", "), startedAt: i.startsAt })) };
});
