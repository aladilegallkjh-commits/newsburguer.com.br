CREATE TABLE `adminUsers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`passwordHash` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`isActive` integer DEFAULT 1,
	`lastLoginAt` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `adminUsers_email_unique` ON `adminUsers` (`email`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`discountType` text NOT NULL,
	`discountValue` real NOT NULL,
	`maxUses` integer,
	`currentUses` integer DEFAULT 0,
	`minOrderAmount` real,
	`expiresAt` integer,
	`isActive` integer DEFAULT 1,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coupons_code_unique` ON `coupons` (`code`);--> statement-breakpoint
CREATE TABLE `customerRankings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customerId` integer NOT NULL,
	`period` text NOT NULL,
	`position` integer NOT NULL,
	`orderCount` integer NOT NULL,
	`totalSpent` real NOT NULL,
	`prizeWon` text DEFAULT 'none',
	`prizeClaimedAt` integer,
	`calculatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`totalOrders` integer DEFAULT 0,
	`totalSpent` real DEFAULT 0,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_phone_unique` ON `customers` (`phone`);--> statement-breakpoint
CREATE TABLE `menuItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`price` real NOT NULL,
	`imageUrl` text,
	`ingredients` text,
	`extras` text,
	`isActive` integer DEFAULT 1,
	`displayOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`customerPhone` text NOT NULL,
	`type` text NOT NULL,
	`message` text NOT NULL,
	`sentVia` text DEFAULT 'whatsapp',
	`sentAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`status` text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE `orderStatusHistory` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`status` text NOT NULL,
	`message` text,
	`timestamp` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderNumber` text NOT NULL,
	`customerId` text NOT NULL,
	`customerName` text NOT NULL,
	`customerPhone` text NOT NULL,
	`items` text NOT NULL,
	`totalAmount` real NOT NULL,
	`discount` real DEFAULT 0,
	`finalAmount` real NOT NULL,
	`deliveryType` text NOT NULL,
	`address` text,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`estimatedDeliveryTime` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_orderNumber_unique` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE TABLE `prizeCodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`prizeType` text NOT NULL,
	`customerId` integer NOT NULL,
	`customerPhone` text NOT NULL,
	`period` text NOT NULL,
	`isUsed` integer DEFAULT 0,
	`usedAt` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prizeCodes_code_unique` ON `prizeCodes` (`code`);--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`discountValue` real NOT NULL,
	`minOrderAmount` real,
	`imageUrl` text,
	`isActive` integer DEFAULT 1,
	`startDate` integer,
	`endDate` integer,
	`displayOrder` integer DEFAULT 0,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`customerId` text NOT NULL,
	`customerName` text NOT NULL,
	`customerPhone` text NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `storeSettings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`storeName` text DEFAULT 'New S''Burguer' NOT NULL,
	`whatsappNumber` text DEFAULT '41987019702' NOT NULL,
	`email` text,
	`phone` text,
	`address` text,
	`city` text,
	`state` text,
	`zipCode` text,
	`openingTime` text,
	`closingTime` text,
	`logoUrl` text,
	`bannerUrl` text,
	`description` text,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`lastSignedIn` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE TABLE `whatsappMessagesLog` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`adminUserId` integer NOT NULL,
	`messageType` text NOT NULL,
	`phoneNumber` text NOT NULL,
	`messageContent` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`errorMessage` text,
	`sentAt` integer,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `whatsappSettings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`adminUserId` integer NOT NULL,
	`phoneNumber` text NOT NULL,
	`apiKey` text,
	`enableDailySummary` integer DEFAULT 1,
	`summaryTime` text DEFAULT '09:00' NOT NULL,
	`enableSalesAlerts` integer DEFAULT 1,
	`salesAlertThreshold` real DEFAULT 10,
	`enableOrderAlerts` integer DEFAULT 1,
	`enableLowStockAlerts` integer DEFAULT 0,
	`includeGraphs` integer DEFAULT 1,
	`includeTopProducts` integer DEFAULT 1,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
