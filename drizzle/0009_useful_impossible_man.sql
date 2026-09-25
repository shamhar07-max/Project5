CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`channel` text NOT NULL,
	`topic` text NOT NULL,
	`intent` text DEFAULT '' NOT NULL,
	`timing` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`message` text NOT NULL,
	`source_path` text DEFAULT '' NOT NULL,
	`owner_id` text,
	`client_key` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_leads_reference` ON `leads` (`reference`);--> statement-breakpoint
CREATE INDEX `idx_leads_client_created` ON `leads` (`client_key`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_leads_owner_created` ON `leads` (`owner_id`,`created_at`);