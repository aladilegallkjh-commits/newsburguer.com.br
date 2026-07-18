ALTER TABLE `orders` ADD `deliveryFee` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `storeSettings` ADD `freeDeliveryDistance` real DEFAULT 6;--> statement-breakpoint
ALTER TABLE `storeSettings` ADD `baseDeliveryFee` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `storeSettings` ADD `deliveryFeePerKm` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `storeSettings` ADD `maxDeliveryDistance` real DEFAULT 10;--> statement-breakpoint
ALTER TABLE `storeSettings` ADD `storeLatitude` real;--> statement-breakpoint
ALTER TABLE `storeSettings` ADD `storeLongitude` real;