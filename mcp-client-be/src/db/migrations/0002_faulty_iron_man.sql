PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_network` text NOT NULL,
	`model_name` text
);
--> statement-breakpoint
INSERT INTO `__new_user_settings`("id", "model_network", "model_name") SELECT "id", "model_network", "model_name" FROM `user_settings`;--> statement-breakpoint
DROP TABLE `user_settings`;--> statement-breakpoint
ALTER TABLE `__new_user_settings` RENAME TO `user_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;