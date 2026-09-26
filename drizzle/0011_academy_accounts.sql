CREATE TABLE `academy_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text,
	`platform_user_id` text,
	`role` text DEFAULT 'learner' NOT NULL,
	`goal` text DEFAULT '' NOT NULL,
	`experience` text DEFAULT '' NOT NULL,
	`availability` text DEFAULT '' NOT NULL,
	`route` text DEFAULT 'Technology' NOT NULL,
	`progress_consent` integer DEFAULT false NOT NULL,
	`marketing_consent` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`last_sign_in_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_academy_accounts_email` ON `academy_accounts` (`email`);--> statement-breakpoint
CREATE INDEX `idx_academy_accounts_platform` ON `academy_accounts` (`platform_user_id`);--> statement-breakpoint
CREATE TABLE `academy_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`kind` text NOT NULL,
	`detail` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_academy_activity_account` ON `academy_activity` (`account_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `academy_coupon_redemptions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`code` text NOT NULL,
	`plan` text NOT NULL,
	`order_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_academy_coupon_once` ON `academy_coupon_redemptions` (`account_id`,`code`,`plan`);--> statement-breakpoint
CREATE TABLE `academy_creations` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`tool` text NOT NULL,
	`title` text NOT NULL,
	`data` text NOT NULL,
	`source` text DEFAULT 'template' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_academy_creations_account` ON `academy_creations` (`account_id`,`tool`);--> statement-breakpoint
CREATE TABLE `academy_entitlements` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`plan` text NOT NULL,
	`order_id` text,
	`status` text NOT NULL,
	`source` text NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_academy_entitlements_account` ON `academy_entitlements` (`account_id`,`status`);--> statement-breakpoint
CREATE TABLE `academy_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`plan` text NOT NULL,
	`billing` text DEFAULT 'monthly' NOT NULL,
	`amount` integer NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'AED' NOT NULL,
	`coupon` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`decided_at` integer,
	`decided_by` text
);
--> statement-breakpoint
CREATE INDEX `idx_academy_orders_account` ON `academy_orders` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_academy_orders_status` ON `academy_orders` (`status`);--> statement-breakpoint
CREATE TABLE `academy_passport` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`course_code` text NOT NULL,
	`stage` text NOT NULL,
	`what` text NOT NULL,
	`cause` text NOT NULL,
	`fix` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_academy_passport_account` ON `academy_passport` (`account_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `academy_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`course_code` text NOT NULL,
	`lessons` text DEFAULT '[]' NOT NULL,
	`stages` text DEFAULT '[]' NOT NULL,
	`started_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_academy_progress_course` ON `academy_progress` (`account_id`,`course_code`);