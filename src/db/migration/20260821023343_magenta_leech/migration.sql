CREATE TYPE "statistics_results_enum" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
CREATE TABLE "gmail_data" (
	"id" text PRIMARY KEY UNIQUE,
	"thread_id" text,
	"user_id" uuid NOT NULL,
	"snippet" text NOT NULL,
	"from" text NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistics_results" (
	"id" text PRIMARY KEY UNIQUE,
	"user_id" uuid NOT NULL,
	"status" "statistics_results_enum" DEFAULT 'Pending'::"statistics_results_enum" NOT NULL,
	"data" json,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"scope" text NOT NULL,
	"token_type" text NOT NULL,
	"refresh_token_expires_in" integer NOT NULL,
	"expiry_date" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text NOT NULL UNIQUE,
	"google_id" text UNIQUE,
	"name" text,
	"picture" text,
	"verified_email" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gmail_data" ADD CONSTRAINT "gmail_data_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "statistics_results" ADD CONSTRAINT "statistics_results_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_credentials" ADD CONSTRAINT "user_credentials_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;