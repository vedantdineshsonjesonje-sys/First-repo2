CREATE TABLE "services" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL UNIQUE,
	"category" text NOT NULL,
	"icon" text NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"hours" text NOT NULL,
	"phone" text NOT NULL,
	"verified" text NOT NULL,
	"search" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" serial PRIMARY KEY,
	"kind" text NOT NULL,
	"service" text DEFAULT '' NOT NULL,
	"note" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
