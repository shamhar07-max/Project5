import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { notifications } from "../../../db/schema";
import { AppShell, Btn, Empty, PageHead, Panel, fmt } from "../../_app/kit";
import { loadApp } from "../../_app/shell";
import { markAllNotificationsRead, markNotificationRead } from "../platform-actions";

export const dynamic = "force-dynamic";

export default async function Notifications() {
  const { ctx, info } = await loadApp();
  const rows = await getDb().select().from(notifications).where(eq(notifications.userId, ctx.user.userId)).orderBy(desc(notifications.createdAt)).limit(100);
  return <AppShell info={info} active="notifications">
    <PageHead kicker="Notifications" title="What changed" lede="In-app notifications from every division. Email delivery is not connected yet, so this list is the source of truth." actions={info.unread > 0 && <form action={markAllNotificationsRead}><Btn kind="secondary">Mark all as read</Btn></form>} />
    <Panel>
      {rows.length ? <div className="app-rows">{rows.map(n => <div key={n.id} className="app-row" style={n.readAt ? { opacity: .62 } : undefined}>
        <div className="app-row-main"><strong>{n.priority !== "normal" && !n.readAt ? "● " : ""}{n.title}</strong><small>{n.category} · {fmt(n.createdAt)}{n.body ? ` · ${n.body}` : ""}</small></div>
        {n.href && <Link href={n.href} className="app-btn app-btn-secondary">Open</Link>}
        {!n.readAt && <form action={markNotificationRead}><input type="hidden" name="id" value={n.id} /><Btn kind="ghost">Mark read</Btn></form>}
      </div>)}</div> : <Empty title="No notifications yet">Reviews, approvals, application updates and invoices will appear here.</Empty>}
    </Panel>
  </AppShell>;
}
