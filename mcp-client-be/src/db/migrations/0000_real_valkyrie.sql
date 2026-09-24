CREATE TABLE `mcp_servers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`command` text NOT NULL,
	`args` text,
	`cwd` text
);
--> statement-breakpoint
CREATE TABLE `mcp_tools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mcp_server_id` integer NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`mcp_server_id`) REFERENCES `mcp_servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_network` text NOT NULL,
	`model_name` text NOT NULL
);
