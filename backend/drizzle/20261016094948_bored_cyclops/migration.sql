CREATE TABLE `category_rules` (
	`id` text PRIMARY KEY,
	`user_id` text NOT NULL,
	`keyword` text NOT NULL,
	`category` text NOT NULL,
	`priority` integer NOT NULL,
	CONSTRAINT `fk_category_rules_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_user_id_import_hash_unique` ON `transactions` (`user_id`,`import_hash`);--> statement-breakpoint
CREATE INDEX `transactions_user_id_date_idx` ON `transactions` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `category_rules_user_id_idx` ON `category_rules` (`user_id`);