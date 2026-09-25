// Studio and Business AI delivery constants taken from the master blueprint.
export const STAGES = {
  studio: ["Draft", "Discovery requested", "Reviewing", "Qualified", "Consultation", "Discovery active", "Validation", "Decision made", "Scoping", "Design", "Engineering", "QA", "Deployment", "Live", "Maintenance", "Closed"],
  business: ["Draft", "Discovery requested", "Consultation", "Observe", "Diagnose", "Baseline", "Redesign", "Approved scope", "Implementation", "Pilot", "Live", "Optimization", "Closed"],
} as const;

// Domain 03 §5 qualification model.
export const QUALIFICATION = ["Problem clarity", "Business value", "User need", "Budget fit", "Timeline realism", "Decision authority", "Technical feasibility", "Strategic fit"] as const;

// Domain 03 §7 validation decision.
export const DECISIONS = { BUILD: "Evidence supports proceeding; define scope and commercial terms.", RESHAPE: "Opportunity exists but scope, positioning, product or implementation should change.", STOP: "Evidence does not justify broader build at this time." } as const;

// Domain 03 §13 QA & release readiness.
export const RELEASE_CHECKS = [
  ["functional", "Functional QA"], ["regression", "Regression"], ["integration", "Integration / API testing"], ["performance", "Performance testing"],
  ["security", "Security checks"], ["accessibility", "Accessibility review"], ["backup", "Backup and monitoring readiness"], ["rollback", "Rollback plan"], ["client", "Client approval"],
] as const;

// Domain 04 §9 risk model.
export const RISK = { LOW: "Automatic where policy allows", MEDIUM: "Automatic with strong logging/monitoring", HIGH: "Human approval required", CRITICAL: "No autonomous execution; controlled human process" } as const;
export type Risk = keyof typeof RISK;

// Domain 04 §5 problem classes.
export const PROBLEM_CLASSES = ["TIME LEAK", "COST LEAK", "REVENUE LEAK", "CUSTOMER EXPERIENCE LEAK", "DATA QUALITY LEAK", "COMPLIANCE RISK", "PROCESS CONTROL RISK"] as const;
