import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const records = sqliteTable("records", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  orgId: text("org_id"),
  module: text("module").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("In progress"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("idx_records_owner_module").on(table.ownerId, table.module), index("idx_records_org_module").on(table.orgId, table.module)]);

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  userId: text("user_id"),
  email: text("email").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [
  index("idx_memberships_user_status").on(table.userId, table.status),
  uniqueIndex("idx_memberships_org_email").on(table.orgId, table.email),
]);

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").notNull(),
  orgId: text("org_id"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  decision: text("decision").notNull(),
  reason: text("reason"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_audit_org_created").on(table.orgId, table.createdAt)]);

export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  orgId: text("org_id"),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("Open"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_tickets_owner_org").on(table.ownerId, table.orgId)]);

export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  orgId: text("org_id"),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  storageKey: text("storage_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_files_org_created").on(table.orgId, table.createdAt), index("idx_files_owner_created").on(table.ownerId, table.createdAt)]);

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_messages_org_created").on(table.orgId, table.createdAt)]);

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  orgId: text("org_id"),
  service: text("service").notNull(),
  projectName: text("project_name").notNull(),
  problem: text("problem").notNull(),
  audience: text("audience").notNull().default(""),
  currentState: text("current_state").notNull().default(""),
  desiredOutcome: text("desired_outcome").notNull().default(""),
  budget: text("budget").notNull().default(""),
  timeline: text("timeline").notNull().default(""),
  status: text("status").notNull().default("Enquiry received"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_enquiries_owner_service").on(table.ownerId, table.service), index("idx_enquiries_org_service").on(table.orgId, table.service)]);

export const academyEnrollments = sqliteTable("academy_enrollments", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  courseCode: text("course_code").notNull(),
  status: text("status").notNull().default("Saved"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_academy_enroll_owner_course").on(table.ownerId, table.courseCode)]);

export const academySubmissions = sqliteTable("academy_submissions", {
  id: text("id").primaryKey(),
  enrollmentId: text("enrollment_id").notNull(),
  ownerId: text("owner_id").notNull(),
  text: text("text").notNull(),
  reflection: text("reflection").notNull(),
  status: text("status").notNull().default("Draft"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_academy_sub_enrollment").on(table.enrollmentId)]);

export const academyProfiles = sqliteTable("academy_profiles", {
  ownerId: text("owner_id").primaryKey(),
  learningGoal: text("learning_goal").notNull().default(""),
  route: text("route").notNull().default("Technology"),
  weeklyAvailability: text("weekly_availability").notNull().default(""),
  talentConsent: integer("talent_consent", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// Client-owned discovery records. These do not imply a contract, approval, or delivery commitment.
export const engagements = sqliteTable("engagements", {
  id: text("id").primaryKey(),
  enquiryId: text("enquiry_id").notNull(),
  ownerId: text("owner_id").notNull(),
  orgId: text("org_id"),
  service: text("service").notNull(),
  title: text("title").notNull(),
  stage: text("stage").notNull().default("Draft"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [
  uniqueIndex("idx_engagement_enquiry").on(table.enquiryId),
  index("idx_engagement_owner_service").on(table.ownerId, table.service),
  index("idx_engagement_org_service").on(table.orgId, table.service),
]);

export const engagementEntries = sqliteTable("engagement_entries", {
  id: text("id").primaryKey(),
  engagementId: text("engagement_id").notNull(),
  authorId: text("author_id").notNull(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  evidence: text("evidence").notNull().default(""),
  measurement: text("measurement").notNull().default(""),
  measurementBasis: text("measurement_basis").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_entries_engagement_created").on(table.engagementId, table.createdAt)]);

export const engagementEvents = sqliteTable("engagement_events", {
  id: text("id").primaryKey(),
  engagementId: text("engagement_id").notNull(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_events_engagement_created").on(table.engagementId, table.createdAt)]);

// A person's own claims remain private and explicitly unverified.
export const talentProfiles = sqliteTable("talent_profiles", {
  ownerId: text("owner_id").primaryKey(),
  headline: text("headline").notNull().default(""),
  location: text("location").notNull().default(""),
  summary: text("summary").notNull().default(""),
  availability: text("availability").notNull().default("Not specified"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const talentEvidence = sqliteTable("talent_evidence", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  capability: text("capability").notNull(),
  description: text("description").notNull(),
  source: text("source").notNull().default("Self reported"),
  status: text("status").notNull().default("Declared"),
  visibility: text("visibility").notNull().default("Private"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_talent_evidence_owner").on(table.ownerId, table.createdAt)]);

// A private candidate tracker is distinct from an employer-managed application.
export const jobTracks = sqliteTable("job_tracks", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  roleTitle: text("role_title").notNull(),
  employer: text("employer").notNull(),
  sourceUrl: text("source_url").notNull().default(""),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("Saved"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_job_tracks_owner_updated").on(table.ownerId, table.updatedAt)]);

// Conversion requests from the public channels (web, mobile app, WhatsApp composer).
// Anonymous visitors are allowed; ownerId is set when the visitor was signed in.
export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull(),
  channel: text("channel").notNull(),
  topic: text("topic").notNull(),
  intent: text("intent").notNull().default(""),
  timing: text("timing").notNull().default(""),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  company: text("company").notNull().default(""),
  message: text("message").notNull(),
  sourcePath: text("source_path").notNull().default(""),
  ownerId: text("owner_id"),
  clientKey: text("client_key").notNull(),
  status: text("status").notNull().default("New"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [
  uniqueIndex("idx_leads_reference").on(table.reference),
  index("idx_leads_client_created").on(table.clientKey, table.createdAt),
  index("idx_leads_owner_created").on(table.ownerId, table.createdAt),
]);

// ─────────────────────────────────────────────────────────────────────────────
// Platform core (blueprint Part II): staff roles, events, notifications,
// approvals, billing, webhooks, preferences.
// ─────────────────────────────────────────────────────────────────────────────

// Internal DigitalBurj roles for the admin area (least privilege, blueprint Domain 09).
export const staffRoles = sqliteTable("staff_roles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  grantedBy: text("granted_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_staff_roles_email_role").on(table.email, table.role)]);

// Append-only domain events; the source for notifications and webhooks.
export const domainEvents = sqliteTable("domain_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  orgId: text("org_id"),
  actorId: text("actor_id").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  payload: text("payload").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_events_org_created").on(table.orgId, table.createdAt), index("idx_events_type_created").on(table.type, table.createdAt)]);

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  orgId: text("org_id"),
  category: text("category").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  href: text("href").notNull().default(""),
  priority: text("priority").notNull().default("normal"),
  readAt: integer("read_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_notifications_user_created").on(table.userId, table.createdAt)]);

// Universal approval center: a decision a named party must take before work proceeds.
export const approvals = sqliteTable("approvals", {
  id: text("id").primaryKey(),
  division: text("division").notNull(),
  orgId: text("org_id"),
  ownerId: text("owner_id").notNull(),
  approverScope: text("approver_scope").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  status: text("status").notNull().default("pending"),
  requestedBy: text("requested_by").notNull(),
  decidedBy: text("decided_by"),
  decisionNote: text("decision_note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  decidedAt: integer("decided_at", { mode: "timestamp_ms" }),
}, table => [index("idx_approvals_owner_status").on(table.ownerId, table.status), index("idx_approvals_org_status").on(table.orgId, table.status), index("idx_approvals_resource").on(table.resourceType, table.resourceId)]);

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  orgId: text("org_id"),
  customerId: text("customer_id"),
  customerEmail: text("customer_email").notNull(),
  division: text("division").notNull(),
  description: text("description").notNull(),
  lines: text("lines").notNull().default("[]"),
  currency: text("currency").notNull().default("AED"),
  amountMinor: integer("amount_minor").notNull(),
  status: text("status").notNull().default("draft"),
  dueAt: integer("due_at", { mode: "timestamp_ms" }),
  issuedBy: text("issued_by").notNull(),
  paidAt: integer("paid_at", { mode: "timestamp_ms" }),
  statusReason: text("status_reason").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_invoices_number").on(table.number), index("idx_invoices_customer").on(table.customerEmail), index("idx_invoices_org").on(table.orgId)]);

export const webhooks = sqliteTable("webhooks", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_webhooks_org").on(table.orgId)]);

export const webhookDeliveries = sqliteTable("webhook_deliveries", {
  id: text("id").primaryKey(),
  webhookId: text("webhook_id").notNull(),
  eventId: text("event_id").notNull(),
  status: text("status").notNull(),
  httpStatus: integer("http_status"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_deliveries_webhook_created").on(table.webhookId, table.createdAt)]);

export const userPreferences = sqliteTable("user_preferences", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull().default(""),
  locale: text("locale").notNull().default("en"),
  emailNotifications: integer("email_notifications", { mode: "boolean" }).notNull().default(true),
  productUpdates: integer("product_updates", { mode: "boolean" }).notNull().default(false),
  researchConsent: integer("research_consent", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ─── Academy: missions, assessment, independent verification, credentials ───
export const academyMissions = sqliteTable("academy_missions", {
  id: text("id").primaryKey(),
  courseCode: text("course_code").notNull(),
  title: text("title").notNull(),
  scenario: text("scenario").notNull(),
  objective: text("objective").notNull(),
  instructions: text("instructions").notNull(),
  requiredOutput: text("required_output").notNull(),
  rubric: text("rubric").notNull(),
  skills: text("skills").notNull().default(""),
  maxAttempts: integer("max_attempts").notNull().default(3),
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_missions_course").on(table.courseCode)]);

export const missionSubmissions = sqliteTable("mission_submissions", {
  id: text("id").primaryKey(),
  missionId: text("mission_id").notNull(),
  ownerId: text("owner_id").notNull(),
  ownerEmail: text("owner_email").notNull(),
  content: text("content").notNull(),
  artifactUrl: text("artifact_url").notNull().default(""),
  attempt: integer("attempt").notNull().default(1),
  status: text("status").notNull().default("SUBMITTED"),
  assessorId: text("assessor_id"),
  verifierId: text("verifier_id"),
  score: integer("score"),
  talentConsent: integer("talent_consent", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_msub_owner").on(table.ownerId, table.updatedAt), index("idx_msub_status").on(table.status, table.updatedAt), index("idx_msub_mission").on(table.missionId)]);

export const submissionReviews = sqliteTable("submission_reviews", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id").notNull(),
  reviewerId: text("reviewer_id").notNull(),
  reviewerEmail: text("reviewer_email").notNull(),
  kind: text("kind").notNull(),
  scores: text("scores").notNull().default("[]"),
  feedback: text("feedback").notNull(),
  decision: text("decision").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_reviews_submission").on(table.submissionId, table.createdAt)]);

export const credentials = sqliteTable("credentials", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  ownerId: text("owner_id").notNull(),
  holderName: text("holder_name").notNull(),
  submissionId: text("submission_id").notNull(),
  courseCode: text("course_code").notNull(),
  title: text("title").notNull(),
  skills: text("skills").notNull().default(""),
  verifierId: text("verifier_id").notNull(),
  status: text("status").notNull().default("active"),
  statusReason: text("status_reason").notNull().default(""),
  issuedAt: integer("issued_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_credentials_code").on(table.code), uniqueIndex("idx_credentials_submission").on(table.submissionId), index("idx_credentials_owner").on(table.ownerId)]);

// ─── Studio delivery ───
export const studioDecisions = sqliteTable("studio_decisions", {
  engagementId: text("engagement_id").primaryKey(),
  scores: text("scores").notNull().default("{}"),
  notes: text("notes").notNull().default(""),
  decision: text("decision").notNull(),
  decidedBy: text("decided_by").notNull(),
  decidedAt: integer("decided_at", { mode: "timestamp_ms" }).notNull(),
});

export const milestones = sqliteTable("milestones", {
  id: text("id").primaryKey(),
  engagementId: text("engagement_id").notNull(),
  title: text("title").notNull(),
  deliverables: text("deliverables").notNull(),
  dueAt: integer("due_at", { mode: "timestamp_ms" }),
  status: text("status").notNull().default("PLANNED"),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_milestones_engagement").on(table.engagementId)]);

export const changeRequests = sqliteTable("change_requests", {
  id: text("id").primaryKey(),
  engagementId: text("engagement_id").notNull(),
  title: text("title").notNull(),
  reason: text("reason").notNull(),
  impactScope: text("impact_scope").notNull().default(""),
  impactTime: text("impact_time").notNull().default(""),
  impactCost: text("impact_cost").notNull().default(""),
  status: text("status").notNull().default("SUBMITTED"),
  requestedBy: text("requested_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_cr_engagement").on(table.engagementId)]);

export const releaseChecks = sqliteTable("release_checks", {
  id: text("id").primaryKey(),
  engagementId: text("engagement_id").notNull(),
  checkKey: text("check_key").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  note: text("note").notNull().default(""),
  updatedBy: text("updated_by").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_release_checks_key").on(table.engagementId, table.checkKey)]);

// ─── Business AI ───
export const baiMetrics = sqliteTable("bai_metrics", {
  id: text("id").primaryKey(),
  engagementId: text("engagement_id").notNull(),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  baseline: text("baseline").notNull(),
  baselineBasis: text("baseline_basis").notNull(),
  current: text("current").notNull().default(""),
  currentBasis: text("current_basis").notNull().default(""),
  updatedBy: text("updated_by").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_bai_metrics_engagement").on(table.engagementId)]);

export const automations = sqliteTable("automations", {
  id: text("id").primaryKey(),
  engagementId: text("engagement_id").notNull(),
  name: text("name").notNull(),
  objective: text("objective").notNull(),
  trigger: text("trigger").notNull(),
  systems: text("systems").notNull().default(""),
  aiComponents: text("ai_components").notNull().default(""),
  riskLevel: text("risk_level").notNull(),
  state: text("state").notNull().default("IDEA"),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_automations_engagement").on(table.engagementId)]);

// ─── Talent ───
export const talentSettings = sqliteTable("talent_settings", {
  ownerId: text("owner_id").primaryKey(),
  displayName: text("display_name").notNull().default(""),
  slug: text("slug").notNull(),
  visibility: text("visibility").notNull().default("private"),
  searchable: integer("searchable", { mode: "boolean" }).notNull().default(false),
  showContact: integer("show_contact", { mode: "boolean" }).notNull().default(false),
  contactEmail: text("contact_email").notNull().default(""),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_talent_settings_slug").on(table.slug)]);

export const verificationRequests = sqliteTable("verification_requests", {
  id: text("id").primaryKey(),
  evidenceId: text("evidence_id").notNull(),
  ownerId: text("owner_id").notNull(),
  status: text("status").notNull().default("SUBMITTED"),
  verifierId: text("verifier_id"),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_vreq_status").on(table.status, table.updatedAt), index("idx_vreq_evidence").on(table.evidenceId)]);

// ─── Jobs ───
export const jobListings = sqliteTable("job_listings", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  workArrangement: text("work_arrangement").notNull(),
  employmentType: text("employment_type").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  skills: text("skills").notNull().default(""),
  salaryRange: text("salary_range").notNull().default(""),
  questions: text("questions").notNull().default(""),
  status: text("status").notNull().default("DRAFT"),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
}, table => [index("idx_listings_org").on(table.orgId), index("idx_listings_status").on(table.status, table.publishedAt)]);

export const jobApplications = sqliteTable("job_applications", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull(),
  orgId: text("org_id").notNull(),
  candidateId: text("candidate_id").notNull(),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  coverNote: text("cover_note").notNull().default(""),
  answers: text("answers").notNull().default(""),
  shareProfile: integer("share_profile", { mode: "boolean" }).notNull().default(false),
  assessmentConsent: integer("assessment_consent", { mode: "boolean" }).notNull().default(false),
  stage: text("stage").notNull().default("APPLIED"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_applications_job_candidate").on(table.jobId, table.candidateId), index("idx_applications_org").on(table.orgId, table.updatedAt), index("idx_applications_candidate").on(table.candidateId, table.updatedAt)]);

export const applicationEvents = sqliteTable("application_events", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").notNull(),
  actorId: text("actor_id").notNull(),
  fromStage: text("from_stage").notNull().default(""),
  toStage: text("to_stage").notNull(),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_app_events_application").on(table.applicationId, table.createdAt)]);

export const interviews = sqliteTable("interviews", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").notNull(),
  scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }).notNull(),
  mode: text("mode").notNull(),
  interviewer: text("interviewer").notNull(),
  feedback: text("feedback").notNull().default(""),
  rating: integer("rating"),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_interviews_application").on(table.applicationId)]);

export const offers = sqliteTable("offers", {
  id: text("id").primaryKey(),
  applicationId: text("application_id").notNull(),
  terms: text("terms").notNull(),
  status: text("status").notNull().default("PENDING_APPROVAL"),
  createdBy: text("created_by").notNull(),
  approvedBy: text("approved_by"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_offers_application").on(table.applicationId)]);

export const employerVerifications = sqliteTable("employer_verifications", {
  orgId: text("org_id").primaryKey(),
  status: text("status").notNull().default("PENDING"),
  companyName: text("company_name").notNull(),
  website: text("website").notNull().default(""),
  registration: text("registration").notNull().default(""),
  requestedBy: text("requested_by").notNull(),
  decidedBy: text("decided_by"),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ─── Support desk ───
export const ticketMessages = sqliteTable("ticket_messages", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull(),
  authorId: text("author_id").notNull(),
  authorLabel: text("author_label").notNull(),
  internal: integer("internal", { mode: "boolean" }).notNull().default(false),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_ticket_messages_ticket").on(table.ticketId, table.createdAt)]);

export const ticketMeta = sqliteTable("ticket_meta", {
  ticketId: text("ticket_id").primaryKey(),
  division: text("division").notNull().default("Platform"),
  priority: text("priority").notNull().default("normal"),
  workflow: text("workflow").notNull().default("NEW"),
  assigneeId: text("assignee_id"),
  assigneeEmail: text("assignee_email").notNull().default(""),
  firstResponseAt: integer("first_response_at", { mode: "timestamp_ms" }),
  resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

// ─── Status & reliability ───
export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").notNull().default("incident"),
  status: text("status").notNull().default("INVESTIGATING"),
  impact: text("impact").notNull().default("DEGRADED PERFORMANCE"),
  components: text("components").notNull(),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
  resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_incidents_created").on(table.createdAt)]);

export const incidentUpdates = sqliteTable("incident_updates", {
  id: text("id").primaryKey(),
  incidentId: text("incident_id").notNull(),
  status: text("status").notNull(),
  body: text("body").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_incident_updates_incident").on(table.incidentId, table.createdAt)]);

// Organization API keys for server-to-server access to /api/v1 (only the hash is stored).
export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  hash: text("hash").notNull(),
  scopes: text("scopes").notNull(),
  createdBy: text("created_by").notNull(),
  lastUsedAt: integer("last_used_at", { mode: "timestamp_ms" }),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_api_keys_hash").on(table.hash), index("idx_api_keys_org").on(table.orgId)]);

// Directory of people who have signed in (identity admin "Users"; resolves staff emails to ids).
export const userDirectory = sqliteTable("user_directory", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  firstSeenAt: integer("first_seen_at", { mode: "timestamp_ms" }).notNull(),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }).notNull(),
  suspendedAt: integer("suspended_at", { mode: "timestamp_ms" }),
  suspendedReason: text("suspended_reason").notNull().default(""),
}, table => [index("idx_user_directory_email").on(table.email)]);

// ---------------------------------------------------------------------------
// DigitalBurj Academy accounts, packages and learning records.
// Academy accounts can register with email + password, or link a DigitalBurj
// platform identity (ChatGPT / Google sign-in). Access to paid content comes only
// from an active row in academy_entitlements.
export const academyAccounts = sqliteTable("academy_accounts", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  platformUserId: text("platform_user_id"),
  role: text("role").notNull().default("learner"),
  goal: text("goal").notNull().default(""),
  // Diagnostic (planning edition): experience, weekly availability, preferred route
  experience: text("experience").notNull().default(""),
  availability: text("availability").notNull().default(""),
  route: text("route").notNull().default("Technology"),
  progressConsent: integer("progress_consent", { mode: "boolean" }).notNull().default(false),
  marketingConsent: integer("marketing_consent", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  lastSignInAt: integer("last_sign_in_at", { mode: "timestamp_ms" }),
}, table => [uniqueIndex("idx_academy_accounts_email").on(table.email), index("idx_academy_accounts_platform").on(table.platformUserId)]);

export const academyOrders = sqliteTable("academy_orders", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  plan: text("plan").notNull(),
  billing: text("billing").notNull().default("monthly"),
  amount: integer("amount").notNull(),
  discount: integer("discount").notNull().default(0),
  currency: text("currency").notNull().default("AED"),
  coupon: text("coupon"),
  // payment_pending | paid | free | cancelled
  status: text("status").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  decidedAt: integer("decided_at", { mode: "timestamp_ms" }),
  decidedBy: text("decided_by"),
}, table => [index("idx_academy_orders_account").on(table.accountId), index("idx_academy_orders_status").on(table.status)]);

export const academyEntitlements = sqliteTable("academy_entitlements", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  plan: text("plan").notNull(),
  orderId: text("order_id"),
  // active | superseded | revoked
  status: text("status").notNull(),
  source: text("source").notNull(),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_academy_entitlements_account").on(table.accountId, table.status)]);

export const academyCouponRedemptions = sqliteTable("academy_coupon_redemptions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  code: text("code").notNull(),
  plan: text("plan").notNull(),
  orderId: text("order_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_academy_coupon_once").on(table.accountId, table.code, table.plan)]);

export const academyProgress = sqliteTable("academy_progress", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  courseCode: text("course_code").notNull(),
  // JSON arrays of completed lesson ids and mission stage names
  lessons: text("lessons").notNull().default("[]"),
  stages: text("stages").notNull().default("[]"),
  startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [uniqueIndex("idx_academy_progress_course").on(table.accountId, table.courseCode)]);

export const academyActivity = sqliteTable("academy_activity", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  kind: text("kind").notNull(),
  detail: text("detail").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_academy_activity_account").on(table.accountId, table.createdAt)]);

// Studio creations: explainer videos, lesson plans, course outlines and slide decks.
export const academyCreations = sqliteTable("academy_creations", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  tool: text("tool").notNull(),
  title: text("title").notNull(),
  data: text("data").notNull(),
  source: text("source").notNull().default("template"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_academy_creations_account").on(table.accountId, table.tool)]);

// Failure Passport: useful failures, their causes and corrections. Private to the learner.
export const academyPassport = sqliteTable("academy_passport", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  courseCode: text("course_code").notNull(),
  stage: text("stage").notNull(),
  what: text("what").notNull(),
  cause: text("cause").notNull(),
  fix: text("fix").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, table => [index("idx_academy_passport_account").on(table.accountId, table.createdAt)]);
