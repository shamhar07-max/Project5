DROP INDEX `idx_memberships_org_email`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_memberships_org_email` ON `memberships` (`org_id`,`email`);