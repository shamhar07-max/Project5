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
