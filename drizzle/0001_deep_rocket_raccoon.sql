CREATE TABLE `intervals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timer_id` int NOT NULL,
	`order_index` int NOT NULL,
	`duration` int NOT NULL,
	`sound` varchar(50) NOT NULL DEFAULT 'bell',
	`color` varchar(7) NOT NULL DEFAULT '#3b82f6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `intervals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `presets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`intervals_data` json NOT NULL,
	`rounds` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `presets_id` PRIMARY KEY(`id`),
	CONSTRAINT `presets_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `timers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`is_advanced` boolean NOT NULL DEFAULT false,
	`rounds` int NOT NULL DEFAULT 1,
	`is_saved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_premium` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`is_premium` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_premium_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_premium_user_id_unique` UNIQUE(`user_id`)
);
