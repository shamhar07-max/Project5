CREATE TABLE `academy_missions` (
	`id` text PRIMARY KEY NOT NULL,
	`course_code` text NOT NULL,
	`title` text NOT NULL,
	`scenario` text NOT NULL,
	`objective` text NOT NULL,
	`instructions` text NOT NULL,
	`required_output` text NOT NULL,
	`rubric` text NOT NULL,
	`skills` text DEFAULT '' NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_missions_course` ON `academy_missions` (`course_code`);--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`name` text NOT NULL,
	`prefix` text NOT NULL,
	`hash` text NOT NULL,
	`scopes` text NOT NULL,
	`created_by` text NOT NULL,
	`last_used_at` integer,
	`revoked_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_api_keys_hash` ON `api_keys` (`hash`);--> statement-breakpoint
CREATE INDEX `idx_api_keys_org` ON `api_keys` (`org_id`);--> statement-breakpoint
CREATE TABLE `application_events` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`from_stage` text DEFAULT '' NOT NULL,
	`to_stage` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_app_events_application` ON `application_events` (`application_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`division` text NOT NULL,
	`org_id` text,
	`owner_id` text NOT NULL,
	`approver_scope` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`title` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`requested_by` text NOT NULL,
	`decided_by` text,
	`decision_note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`decided_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_approvals_owner_status` ON `approvals` (`owner_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_approvals_org_status` ON `approvals` (`org_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_approvals_resource` ON `approvals` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE TABLE `automations` (
	`id` text PRIMARY KEY NOT NULL,
	`engagement_id` text NOT NULL,
	`name` text NOT NULL,
	`objective` text NOT NULL,
	`trigger` text NOT NULL,
	`systems` text DEFAULT '' NOT NULL,
	`ai_components` text DEFAULT '' NOT NULL,
	`risk_level` text NOT NULL,
	`state` text DEFAULT 'IDEA' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_automations_engagement` ON `automations` (`engagement_id`);--> statement-breakpoint
CREATE TABLE `bai_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`engagement_id` text NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL,
	`baseline` text NOT NULL,
	`baseline_basis` text NOT NULL,
	`current` text DEFAULT '' NOT NULL,
	`current_basis` text DEFAULT '' NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_bai_metrics_engagement` ON `bai_metrics` (`engagement_id`);--> statement-breakpoint
CREATE TABLE `change_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`engagement_id` text NOT NULL,
	`title` text NOT NULL,
	`reason` text NOT NULL,
	`impact_scope` text DEFAULT '' NOT NULL,
	`impact_time` text DEFAULT '' NOT NULL,
	`impact_cost` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'SUBMITTED' NOT NULL,
	`requested_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_cr_engagement` ON `change_requests` (`engagement_id`);--> statement-breakpoint
CREATE TABLE `credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`owner_id` text NOT NULL,
	`holder_name` text NOT NULL,
	`submission_id` text NOT NULL,
	`course_code` text NOT NULL,
	`title` text NOT NULL,
	`skills` text DEFAULT '' NOT NULL,
	`verifier_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`status_reason` text DEFAULT '' NOT NULL,
	`issued_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_credentials_code` ON `credentials` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_credentials_submission` ON `credentials` (`submission_id`);--> statement-breakpoint
CREATE INDEX `idx_credentials_owner` ON `credentials` (`owner_id`);--> statement-breakpoint
CREATE TABLE `domain_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`org_id` text,
	`actor_id` text NOT NULL,
	`resource_type` text NOT NULL,
	`resource_id` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_events_org_created` ON `domain_events` (`org_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_events_type_created` ON `domain_events` (`type`,`created_at`);--> statement-breakpoint
CREATE TABLE `employer_verifications` (
	`org_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`company_name` text NOT NULL,
	`website` text DEFAULT '' NOT NULL,
	`registration` text DEFAULT '' NOT NULL,
	`requested_by` text NOT NULL,
	`decided_by` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `incident_updates` (
	`id` text PRIMARY KEY NOT NULL,
	`incident_id` text NOT NULL,
	`status` text NOT NULL,
	`body` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_incident_updates_incident` ON `incident_updates` (`incident_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`kind` text DEFAULT 'incident' NOT NULL,
	`status` text DEFAULT 'INVESTIGATING' NOT NULL,
	`impact` text DEFAULT 'DEGRADED PERFORMANCE' NOT NULL,
	`components` text NOT NULL,
	`starts_at` integer NOT NULL,
	`resolved_at` integer,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_incidents_created` ON `incidents` (`created_at`);--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`scheduled_at` integer NOT NULL,
	`mode` text NOT NULL,
	`interviewer` text NOT NULL,
	`feedback` text DEFAULT '' NOT NULL,
	`rating` integer,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_interviews_application` ON `interviews` (`application_id`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`org_id` text,
	`customer_id` text,
	`customer_email` text NOT NULL,
	`division` text NOT NULL,
	`description` text NOT NULL,
	`lines` text DEFAULT '[]' NOT NULL,
	`currency` text DEFAULT 'AED' NOT NULL,
	`amount_minor` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`due_at` integer,
	`issued_by` text NOT NULL,
	`paid_at` integer,
	`status_reason` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_invoices_number` ON `invoices` (`number`);--> statement-breakpoint
CREATE INDEX `idx_invoices_customer` ON `invoices` (`customer_email`);--> statement-breakpoint
CREATE INDEX `idx_invoices_org` ON `invoices` (`org_id`);--> statement-breakpoint
CREATE TABLE `job_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`org_id` text NOT NULL,
	`candidate_id` text NOT NULL,
	`candidate_name` text NOT NULL,
	`candidate_email` text NOT NULL,
	`cover_note` text DEFAULT '' NOT NULL,
	`answers` text DEFAULT '' NOT NULL,
	`share_profile` integer DEFAULT false NOT NULL,
	`assessment_consent` integer DEFAULT false NOT NULL,
	`stage` text DEFAULT 'APPLIED' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_applications_job_candidate` ON `job_applications` (`job_id`,`candidate_id`);--> statement-breakpoint
CREATE INDEX `idx_applications_org` ON `job_applications` (`org_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_applications_candidate` ON `job_applications` (`candidate_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `job_listings` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`company` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`work_arrangement` text NOT NULL,
	`employment_type` text NOT NULL,
	`description` text NOT NULL,
	`requirements` text NOT NULL,
	`skills` text DEFAULT '' NOT NULL,
	`salary_range` text DEFAULT '' NOT NULL,
	`questions` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`published_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_listings_org` ON `job_listings` (`org_id`);--> statement-breakpoint
CREATE INDEX `idx_listings_status` ON `job_listings` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`engagement_id` text NOT NULL,
	`title` text NOT NULL,
	`deliverables` text NOT NULL,
	`due_at` integer,
	`status` text DEFAULT 'PLANNED' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_milestones_engagement` ON `milestones` (`engagement_id`);--> statement-breakpoint
CREATE TABLE `mission_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`mission_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`owner_email` text NOT NULL,
	`content` text NOT NULL,
	`artifact_url` text DEFAULT '' NOT NULL,
	`attempt` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'SUBMITTED' NOT NULL,
	`assessor_id` text,
	`verifier_id` text,
	`score` integer,
	`talent_consent` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_msub_owner` ON `mission_submissions` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_msub_status` ON `mission_submissions` (`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_msub_mission` ON `mission_submissions` (`mission_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`org_id` text,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`href` text DEFAULT '' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`read_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_user_created` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `offers` (
	`id` text PRIMARY KEY NOT NULL,
	`application_id` text NOT NULL,
	`terms` text NOT NULL,
	`status` text DEFAULT 'PENDING_APPROVAL' NOT NULL,
	`created_by` text NOT NULL,
	`approved_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_offers_application` ON `offers` (`application_id`);--> statement-breakpoint
CREATE TABLE `release_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`engagement_id` text NOT NULL,
	`check_key` text NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated_by` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_release_checks_key` ON `release_checks` (`engagement_id`,`check_key`);--> statement-breakpoint
CREATE TABLE `staff_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`granted_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_staff_roles_email_role` ON `staff_roles` (`email`,`role`);--> statement-breakpoint
CREATE TABLE `studio_decisions` (
	`engagement_id` text PRIMARY KEY NOT NULL,
	`scores` text DEFAULT '{}' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`decision` text NOT NULL,
	`decided_by` text NOT NULL,
	`decided_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `submission_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`reviewer_id` text NOT NULL,
	`reviewer_email` text NOT NULL,
	`kind` text NOT NULL,
	`scores` text DEFAULT '[]' NOT NULL,
	`feedback` text NOT NULL,
	`decision` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_submission` ON `submission_reviews` (`submission_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `talent_settings` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`slug` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`searchable` integer DEFAULT false NOT NULL,
	`show_contact` integer DEFAULT false NOT NULL,
	`contact_email` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_talent_settings_slug` ON `talent_settings` (`slug`);--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`author_id` text NOT NULL,
	`author_label` text NOT NULL,
	`internal` integer DEFAULT false NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ticket_messages_ticket` ON `ticket_messages` (`ticket_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ticket_meta` (
	`ticket_id` text PRIMARY KEY NOT NULL,
	`division` text DEFAULT 'Platform' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`workflow` text DEFAULT 'NEW' NOT NULL,
	`assignee_id` text,
	`assignee_email` text DEFAULT '' NOT NULL,
	`first_response_at` integer,
	`resolved_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_directory` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`suspended_at` integer,
	`suspended_reason` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_user_directory_email` ON `user_directory` (`email`);--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`email_notifications` integer DEFAULT true NOT NULL,
	`product_updates` integer DEFAULT false NOT NULL,
	`research_consent` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`evidence_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`status` text DEFAULT 'SUBMITTED' NOT NULL,
	`verifier_id` text,
	`note` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vreq_status` ON `verification_requests` (`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `idx_vreq_evidence` ON `verification_requests` (`evidence_id`);--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`webhook_id` text NOT NULL,
	`event_id` text NOT NULL,
	`status` text NOT NULL,
	`http_status` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_deliveries_webhook_created` ON `webhook_deliveries` (`webhook_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` text PRIMARY KEY NOT NULL,
	`org_id` text NOT NULL,
	`url` text NOT NULL,
	`secret` text NOT NULL,
	`events` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_webhooks_org` ON `webhooks` (`org_id`);