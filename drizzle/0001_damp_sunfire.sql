CREATE TABLE `deliveryDrivers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`vehicleType` text,
	`isActive` integer DEFAULT 1 NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `couponId` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `driverId` integer;--> statement-breakpoint
ALTER TABLE `storeSettings` ADD `isOpen` integer DEFAULT 1;