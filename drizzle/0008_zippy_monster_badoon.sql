CREATE TABLE `job_tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`role_title` text NOT NULL,
	`employer` text NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Saved' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_job_tracks_owner_updated` ON `job_tracks` (`owner_id`,`updated_at`);