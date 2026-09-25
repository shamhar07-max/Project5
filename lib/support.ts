// Support desk rules (blueprint Domain 10).
export const TOPICS = { "Account and security": "Platform", Academy: "Academy", Studio: "Studio", "Business AI": "Business AI", "Talent and Jobs": "Talent", Billing: "Platform", Other: "Platform" } as const;
export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];
// First-response and resolution targets in hours.
export const SLA: Record<Priority, [number, number]> = { urgent: [1, 8], high: [4, 24], normal: [24, 72], low: [48, 120] };
export const LEGACY_STATUS: Record<string, string> = { NEW: "Open", TRIAGED: "Open", ASSIGNED: "In progress", IN_PROGRESS: "In progress", WAITING_FOR_CUSTOMER: "Waiting for you", WAITING_FOR_INTERNAL: "In progress", RESOLVED: "Resolved", REOPENED: "Open", CLOSED: "Closed" };

export function slaState(createdAt: Date, priority: string, firstResponseAt: Date | null, resolvedAt: Date | null) {
  const [resp, res] = SLA[(PRIORITIES as readonly string[]).includes(priority) ? priority as Priority : "normal"];
  const now = Date.now(); const age = (now - createdAt.getTime()) / 3600000;
  if (!firstResponseAt && age > resp) return { state: "breached", label: `First response overdue (${resp}h)` };
  if (!resolvedAt && age > res) return { state: "breached", label: `Resolution overdue (${res}h)` };
  if (!firstResponseAt && age > resp * .75) return { state: "risk", label: "First response due soon" };
  if (!resolvedAt && age > res * .75) return { state: "risk", label: "Resolution due soon" };
  return { state: "ok", label: `Targets: ${resp}h response · ${res}h resolution` };
}
