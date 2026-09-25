CREATE TABLE `academy_enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`course_code` text NOT NULL,
	`status` text DEFAULT 'Saved' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_academy_enroll_owner_course` ON `academy_enrollments` (`owner_id`,`course_code`);--> statement-breakpoint
CREATE TABLE `academy_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`text` text NOT NULL,
	`reflection` text NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_academy_sub_enrollment` ON `academy_submissions` (`enrollment_id`);