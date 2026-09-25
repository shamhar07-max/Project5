// State machines from the master blueprint. Every transition is checked on the
// server before it is written, so a client can never skip or invent a state.

export const machines = {
  // Academy assessment states (Domain 02 §8).
  submission: {
    SUBMITTED: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["REVISION_REQUIRED", "PASSED", "FAILED"],
    REVISION_REQUIRED: ["RESUBMITTED"],
    RESUBMITTED: ["UNDER_REVIEW"],
    PASSED: ["VERIFICATION_PENDING"],
    VERIFICATION_PENDING: ["VERIFIED", "VERIFICATION_DECLINED"],
    VERIFICATION_DECLINED: [],
    FAILED: [],
    VERIFIED: [],
  },
  // Studio milestones with client approval (Domain 03 §10).
  milestone: {
    PLANNED: ["IN_PROGRESS"],
    IN_PROGRESS: ["SUBMITTED"],
    SUBMITTED: ["APPROVED", "CHANGES_REQUESTED"],
    CHANGES_REQUESTED: ["IN_PROGRESS"],
    APPROVED: [],
  },
  // Studio change requests (Domain 03 §12).
  changeRequest: {
    SUBMITTED: ["UNDER_REVIEW", "DECLINED"],
    UNDER_REVIEW: ["IMPACT_ASSESSED", "DECLINED"],
    IMPACT_ASSESSED: ["QUOTED", "DECLINED"],
    QUOTED: ["APPROVED", "DECLINED"],
    APPROVED: ["IMPLEMENTING"],
    IMPLEMENTING: ["COMPLETED"],
    DECLINED: [],
    COMPLETED: [],
  },
  // Business AI automation states (Domain 04 §11).
  automation: {
    IDEA: ["DESIGNED", "RETIRED"],
    DESIGNED: ["APPROVED", "RETIRED"],
    APPROVED: ["BUILDING"],
    BUILDING: ["TESTING", "FAILED"],
    TESTING: ["PILOT", "BUILDING", "FAILED"],
    PILOT: ["LIVE", "PAUSED", "FAILED"],
    LIVE: ["PAUSED", "FAILED", "RETIRED"],
    PAUSED: ["LIVE", "RETIRED"],
    FAILED: ["BUILDING", "RETIRED"],
    RETIRED: [],
  },
  // Talent verification workflow (Domain 05 §6).
  verification: {
    SUBMITTED: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["VERIFIED", "REJECTED", "MORE_INFO"],
    MORE_INFO: ["SUBMITTED"],
    VERIFIED: ["REVOKED"],
    REJECTED: [],
    REVOKED: [],
  },
  // Jobs application workflow (Domain 06 §3).
  application: {
    APPLIED: ["UNDER_REVIEW", "REJECTED", "WITHDRAWN"],
    UNDER_REVIEW: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
    SHORTLISTED: ["ASSESSMENT", "INTERVIEW", "REJECTED", "WITHDRAWN"],
    ASSESSMENT: ["INTERVIEW", "REJECTED", "WITHDRAWN"],
    INTERVIEW: ["FINAL_REVIEW", "REJECTED", "WITHDRAWN"],
    FINAL_REVIEW: ["OFFER", "REJECTED", "WITHDRAWN"],
    OFFER: ["HIRED", "REJECTED", "WITHDRAWN"],
    HIRED: [],
    REJECTED: [],
    WITHDRAWN: [],
  },
  offer: {
    PENDING_APPROVAL: ["SENT", "WITHDRAWN"],
    SENT: ["ACCEPTED", "DECLINED", "WITHDRAWN"],
    ACCEPTED: [],
    DECLINED: [],
    WITHDRAWN: [],
  },
  // Support ticket workflow (Domain 10 §3).
  ticket: {
    NEW: ["TRIAGED", "ASSIGNED", "RESOLVED"],
    TRIAGED: ["ASSIGNED", "RESOLVED"],
    ASSIGNED: ["IN_PROGRESS", "WAITING_FOR_CUSTOMER", "WAITING_FOR_INTERNAL", "RESOLVED"],
    IN_PROGRESS: ["WAITING_FOR_CUSTOMER", "WAITING_FOR_INTERNAL", "RESOLVED"],
    WAITING_FOR_CUSTOMER: ["IN_PROGRESS", "RESOLVED"],
    WAITING_FOR_INTERNAL: ["IN_PROGRESS", "RESOLVED"],
    RESOLVED: ["CLOSED", "REOPENED"],
    REOPENED: ["ASSIGNED", "IN_PROGRESS", "RESOLVED"],
    CLOSED: [],
  },
  invoice: {
    draft: ["issued", "void"],
    issued: ["paid", "void"],
    paid: ["refunded"],
    void: [],
    refunded: [],
  },
  incident: {
    INVESTIGATING: ["IDENTIFIED", "MONITORING", "RESOLVED"],
    IDENTIFIED: ["MONITORING", "RESOLVED"],
    MONITORING: ["RESOLVED", "IDENTIFIED"],
    SCHEDULED: ["IN_PROGRESS", "COMPLETED"],
    IN_PROGRESS: ["COMPLETED"],
    RESOLVED: [],
    COMPLETED: [],
  },
} as const;

export type Machine = keyof typeof machines;

export function canTransition(machine: Machine, from: string, to: string) {
  const table = machines[machine] as Record<string, readonly string[]>;
  return Boolean(table[from]?.includes(to));
}

export function assertTransition(machine: Machine, from: string, to: string) {
  if (!canTransition(machine, from, to)) throw new Error(`This item cannot move from ${label(from)} to ${label(to)}.`);
}

export function nextStates(machine: Machine, from: string): readonly string[] {
  return (machines[machine] as Record<string, readonly string[]>)[from] ?? [];
}

export const label = (state: string) => state.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());

// Blueprint Part III-A status semantics.
export function tone(state: string): "success" | "info" | "warning" | "danger" | "neutral" {
  const s = state.toUpperCase();
  if (/^(VERIFIED|PASSED|APPROVED|COMPLETED|LIVE|HIRED|ACCEPTED|PAID|RESOLVED|CLOSED|OPERATIONAL|ACTIVE|BUILD|SENT)$/.test(s)) return "success";
  if (/^(REJECTED|FAILED|DECLINED|VOID|REVOKED|CRITICAL|STOP|MAJOR OUTAGE|WITHDRAWN|VERIFICATION_DECLINED|REFUNDED)$/.test(s)) return "danger";
  if (/^(PENDING|PENDING_APPROVAL|REVISION_REQUIRED|MORE_INFO|CHANGES_REQUESTED|WAITING_FOR_CUSTOMER|WAITING_FOR_INTERNAL|VERIFICATION_PENDING|QUOTED|RESHAPE|HIGH|PAUSED|ISSUED|DEGRADED PERFORMANCE|PARTIAL OUTAGE|INVESTIGATING|IDENTIFIED|REOPENED)$/.test(s)) return "warning";
  if (/^(DRAFT|IDEA|PLANNED|NEW|ARCHIVED|RETIRED|LOW)$/.test(s)) return "neutral";
  return "info";
}
