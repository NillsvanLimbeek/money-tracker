-- SQLite cannot add NOT NULL columns without a default, and no rules exist yet
-- (nothing wrote to this table), so it is recreated with the new shape.
DROP TABLE `category_rules`;--> statement-breakpoint
CREATE TABLE `category_rules` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`pattern` text NOT NULL,
	`operator` text NOT NULL,
	`category` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_category_rules_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE INDEX `category_rules_user_id_idx` ON `category_rules` (`user_id`);--> statement-breakpoint
ALTER TABLE `transactions` ADD `category_source` text DEFAULT 'default' NOT NULL;
