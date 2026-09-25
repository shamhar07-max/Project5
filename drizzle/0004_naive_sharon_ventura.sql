CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`org_id` text,
	`service` text NOT NULL,
	`project_name` text NOT NULL,
	`problem` text NOT NULL,
	`audience` text DEFAULT '' NOT NULL,
	`current_state` text DEFAULT '' NOT NULL,
	`desired_outcome` text DEFAULT '' NOT NULL,
	`budget` text DEFAULT '' NOT NULL,
	`timeline` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Enquiry received' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_enquiries_owner_service` ON `enquiries` (`owner_id`,`service`);--> statement-breakpoint
CREATE INDEX `idx_enquiries_org_service` ON `enquiries` (`org_id`,`service`);