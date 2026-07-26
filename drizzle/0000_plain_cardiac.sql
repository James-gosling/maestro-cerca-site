CREATE TABLE `maestros` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` varchar(20) NOT NULL,
	`trade` text NOT NULL,
	`experience` int DEFAULT 0,
	`workType` enum('independiente','empresa') DEFAULT 'independiente',
	`zone` text NOT NULL,
	`galleryImages` json,
	`verificationStatus` enum('pending','approved','rejected') DEFAULT 'pending',
	`idDocumentKey` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maestros_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
