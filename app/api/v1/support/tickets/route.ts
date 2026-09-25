import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../../../db";
import { supportTickets, ticketMeta } from "../../../../../db/schema";
import { api, orgOf, page, requireScope } from "../../../../../lib/api";

export const GET = api(async (req, caller) => {
  requireScope(caller, "read:support");
  const { limit, offset } = page(req);
  const orgId = orgOf(caller); const db = getDb();
  const rows = await db.select().from(supportTickets).where(orgId ? eq(supportTickets.orgId, orgId) : eq(supportTickets.ownerId, caller.kind === "user" ? caller.userId : "-")).orderBy(desc(supportTickets.createdAt)).limit(limit).offset(offset);
  const metas = rows.length ? await db.select().from(ticketMeta).where(inArray(ticketMeta.ticketId, rows.map(r => r.id))) : [];
  return { data: rows.map(t => { const m = metas.find(x => x.ticketId === t.id); return { id: t.id, topic: t.topic, status: m?.workflow ?? "NEW", priority: m?.priority ?? "normal", division: m?.division ?? "Platform", createdAt: t.createdAt }; }), limit, offset };
});
