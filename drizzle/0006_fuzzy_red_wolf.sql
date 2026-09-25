CREATE TABLE `academy_profiles` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`learning_goal` text DEFAULT '' NOT NULL,
	`route` text DEFAULT 'Technology' NOT NULL,
	`weekly_availability` text DEFAULT '' NOT NULL,
	`talent_consent` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL
);
