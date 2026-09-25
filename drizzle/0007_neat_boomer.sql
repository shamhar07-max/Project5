CREATE TABLE `engagement_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`engagement_id` text NOT NULL,
	`author_id` text NOT NULL,
	`kind` text NOT NULL,
	`title` text NOT NULL,
	`detail` text NOT NULL,
	`evidence` text DEFAULT '' NOT NULL,
	`measurement` text DEFAULT '' NOT NULL,
	`measurement_basis` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_entries_engagement_created` ON `engagement_entries` (`engagement_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `engagement_events` (
	`id` text PRIMARY KEY NOT NULL,
	`engagement_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_events_engagement_created` ON `engagement_events` (`engagement_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `engagements` (
	`id` text PRIMARY KEY NOT NULL,
	`enquiry_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`org_id` text,
	`service` text NOT NULL,
	`title` text NOT NULL,
	`stage` text DEFAULT 'Draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_engagement_enquiry` ON `engagements` (`enquiry_id`);--> statement-breakpoint
CREATE INDEX `idx_engagement_owner_service` ON `engagements` (`owner_id`,`service`);--> statement-breakpoint
CREATE INDEX `idx_engagement_org_service` ON `engagements` (`org_id`,`service`);--> statement-breakpoint
CREATE TABLE `talent_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`capability` text NOT NULL,
	`description` text NOT NULL,
	`source` text DEFAULT 'Self reported' NOT NULL,
	`status` text DEFAULT 'Declared' NOT NULL,
	`visibility` text DEFAULT 'Private' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_talent_evidence_owner` ON `talent_evidence` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `talent_profiles` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`headline` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`availability` text DEFAULT 'Not specified' NOT NULL,
	`updated_at` integer NOT NULL
);
