CREATE TABLE `customIngredients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`emoji` text NOT NULL,
	`imageUrl` text,
	`price` real NOT NULL,
	`category` text NOT NULL,
	`categoryLabel` text NOT NULL,
	`isActive` integer DEFAULT 1 NOT NULL,
	`displayOrder` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `menuItems` ADD `isAvailable` integer DEFAULT 1;