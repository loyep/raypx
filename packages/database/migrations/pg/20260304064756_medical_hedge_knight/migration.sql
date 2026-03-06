CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "ai_analyses" (
	"id" uuid PRIMARY KEY,
	"user_id" text NOT NULL,
	"data_type" text NOT NULL,
	"data_source" text NOT NULL,
	"analysis_type" text NOT NULL,
	"results" jsonb NOT NULL,
	"model" text NOT NULL,
	"tokens" integer,
	"cached" boolean DEFAULT false,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chk_ai_analyses_tokens_non_negative" CHECK ("tokens" IS NULL OR "tokens" >= 0)
);
--> statement-breakpoint
CREATE TABLE "ai_call_logs" (
	"id" uuid PRIMARY KEY,
	"trace_id" text NOT NULL,
	"user_id" text,
	"route" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"total_tokens" integer,
	"ttft_ms" integer,
	"chunk_count" integer,
	"char_count" integer,
	"latency_ms" integer NOT NULL,
	"status" text NOT NULL,
	"error_code" text,
	"request_id" text,
	"cost_usd_cents" integer,
	"metadata" jsonb,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chk_ai_call_logs_input_tokens_non_negative" CHECK ("input_tokens" IS NULL OR "input_tokens" >= 0),
	CONSTRAINT "chk_ai_call_logs_output_tokens_non_negative" CHECK ("output_tokens" IS NULL OR "output_tokens" >= 0),
	CONSTRAINT "chk_ai_call_logs_total_tokens_non_negative" CHECK ("total_tokens" IS NULL OR "total_tokens" >= 0),
	CONSTRAINT "chk_ai_call_logs_ttft_non_negative" CHECK ("ttft_ms" IS NULL OR "ttft_ms" >= 0),
	CONSTRAINT "chk_ai_call_logs_chunk_count_non_negative" CHECK ("chunk_count" IS NULL OR "chunk_count" >= 0),
	CONSTRAINT "chk_ai_call_logs_char_count_non_negative" CHECK ("char_count" IS NULL OR "char_count" >= 0),
	CONSTRAINT "chk_ai_call_logs_latency_non_negative" CHECK ("latency_ms" >= 0),
	CONSTRAINT "chk_ai_call_logs_cost_usd_cents_non_negative" CHECK ("cost_usd_cents" IS NULL OR "cost_usd_cents" >= 0)
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" uuid PRIMARY KEY,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"model" text NOT NULL,
	"provider" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_generations" (
	"id" uuid PRIMARY KEY,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"result" text NOT NULL,
	"model" text NOT NULL,
	"provider" text NOT NULL,
	"tokens" integer,
	"cached" boolean DEFAULT false,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chk_ai_generations_tokens_non_negative" CHECK ("tokens" IS NULL OR "tokens" >= 0)
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" uuid PRIMARY KEY,
	"conversation_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"tokens" integer,
	"created_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chk_ai_messages_tokens_non_negative" CHECK ("tokens" IS NULL OR "tokens" >= 0)
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apikey" (
	"id" uuid PRIMARY KEY,
	"name" text,
	"start" text,
	"prefix" text,
	"key" text NOT NULL,
	"user_id" text NOT NULL,
	"refill_interval" integer,
	"refill_amount" integer,
	"last_refill_at" timestamp with time zone,
	"enabled" boolean DEFAULT true,
	"rate_limit_enabled" boolean DEFAULT true,
	"rate_limit_time_window" integer DEFAULT 86400000,
	"rate_limit_max" integer DEFAULT 10,
	"request_count" integer DEFAULT 0,
	"remaining" integer,
	"last_request" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"permissions" text,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY,
	"public_key" text NOT NULL,
	"private_key" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_access_token" (
	"id" uuid PRIMARY KEY,
	"access_token" text UNIQUE,
	"refresh_token" text UNIQUE,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"client_id" text,
	"user_id" text,
	"scopes" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_application" (
	"id" uuid PRIMARY KEY,
	"name" text,
	"icon" text,
	"metadata" text,
	"client_id" text UNIQUE,
	"client_secret" text,
	"redirect_u_r_ls" text,
	"type" text,
	"disabled" boolean DEFAULT false,
	"user_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_consent" (
	"id" uuid PRIMARY KEY,
	"client_id" text,
	"user_id" text,
	"scopes" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"consent_given" boolean
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" uuid PRIMARY KEY,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_active" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"username" text UNIQUE,
	"display_username" text,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text UNIQUE,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY,
	"display_name" text NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"ordering" integer DEFAULT 0 NOT NULL,
	"schema_name" text DEFAULT 'public' NOT NULL,
	"table_name" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "resources_schema_name_table_name_unique" UNIQUE("schema_name","table_name")
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid,
	"user_id" text,
	"subscription_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"invoice_number" text NOT NULL UNIQUE,
	"invoice_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"pdf_url" text,
	"stripe_invoice_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chk_invoice_amount_non_negative" CHECK ("amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payment_method" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid,
	"user_id" text,
	"type" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"last4" text,
	"brand" text,
	"exp_month" integer,
	"exp_year" integer,
	"stripe_payment_method_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY,
	"organization_id" uuid,
	"user_id" text,
	"plan_id" text NOT NULL,
	"status" text DEFAULT 'incomplete' NOT NULL,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "chk_subscription_period_valid" CHECK ("current_period_end" >= "current_period_start")
);
--> statement-breakpoint
CREATE TABLE "chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"text" text NOT NULL,
	"index_name" text NOT NULL,
	"user_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"chunk_id" uuid NOT NULL,
	"embedding" vector(1024),
	"content" text,
	"metadata" jsonb,
	"model" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_ai_analyses_user_id" ON "ai_analyses" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_analyses_data_type" ON "ai_analyses" ("data_type");--> statement-breakpoint
CREATE INDEX "idx_ai_analyses_analysis_type" ON "ai_analyses" ("analysis_type");--> statement-breakpoint
CREATE INDEX "idx_ai_analyses_created_at" ON "ai_analyses" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_trace_id" ON "ai_call_logs" ("trace_id");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_user_id" ON "ai_call_logs" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_created_at" ON "ai_call_logs" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_route_created_at" ON "ai_call_logs" ("route","created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_status_created_at" ON "ai_call_logs" ("status","created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_provider_created_at" ON "ai_call_logs" ("provider","created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_model_created_at" ON "ai_call_logs" ("model","created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_call_logs_request_id" ON "ai_call_logs" ("request_id");--> statement-breakpoint
CREATE INDEX "idx_ai_conversations_user_id" ON "ai_conversations" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_conversations_created_at" ON "ai_conversations" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_conversations_user_id_updated_at" ON "ai_conversations" ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "idx_ai_generations_user_id" ON "ai_generations" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ai_generations_type" ON "ai_generations" ("type");--> statement-breakpoint
CREATE INDEX "idx_ai_generations_created_at" ON "ai_generations" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_messages_conversation_id" ON "ai_messages" ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_ai_messages_created_at" ON "ai_messages" ("created_at");--> statement-breakpoint
CREATE INDEX "idx_ai_messages_conversation_created_at" ON "ai_messages" ("conversation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_account_provider_account" ON "account" ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_apikey_user_id" ON "apikey" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_apikey_key" ON "apikey" ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_member_org_user" ON "member" ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_session_token" ON "session" ("token");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_session_expires_at" ON "session" ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_email" ON "user" ("email");--> statement-breakpoint
CREATE INDEX "idx_user_username" ON "user" ("username");--> statement-breakpoint
CREATE INDEX "idx_organization_slug" ON "organization" ("slug");--> statement-breakpoint
CREATE INDEX "idx_resources_schema_name_table_name" ON "resources" ("schema_name","table_name");--> statement-breakpoint
CREATE INDEX "idx_invoice_organization_id" ON "invoice" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_user_id" ON "invoice" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_subscription_id" ON "invoice" ("subscription_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_status" ON "invoice" ("status");--> statement-breakpoint
CREATE INDEX "idx_invoice_stripe_invoice_id" ON "invoice" ("stripe_invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payment_method_organization_id" ON "payment_method" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_payment_method_user_id" ON "payment_method" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_method_stripe_payment_method_id" ON "payment_method" ("stripe_payment_method_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_organization_id" ON "subscription" ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_user_id" ON "subscription" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_subscription_status" ON "subscription" ("status");--> statement-breakpoint
CREATE INDEX "idx_subscription_stripe_subscription_id" ON "subscription" ("stripe_subscription_id");--> statement-breakpoint
CREATE INDEX "idx_chunks_user_id" ON "chunks" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_embeddings_chunk_id" ON "embeddings" ("chunk_id");--> statement-breakpoint
CREATE INDEX "idx_embeddings_user_id" ON "embeddings" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_embeddings_user_id_chunk_id" ON "embeddings" ("user_id","chunk_id");--> statement-breakpoint
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_call_logs" ADD CONSTRAINT "ai_call_logs_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "apikey" ADD CONSTRAINT "apikey_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_client_id_oauth_application_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_application"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_application" ADD CONSTRAINT "oauth_application_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_client_id_oauth_application_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_application"("client_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_subscription_id_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
