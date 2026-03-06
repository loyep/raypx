CREATE TABLE "ai_providers" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "driver" text NOT NULL,
  "base_url" text,
  "default_model" text NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "chk_ai_providers_driver_valid" CHECK ("ai_providers"."driver" IN ('openai', 'alibaba', 'zhipu', 'anthropic', 'google', 'azure-openai'))
);
--> statement-breakpoint
CREATE TABLE "ai_provider_keys" (
  "id" uuid PRIMARY KEY NOT NULL,
  "provider_id" uuid NOT NULL,
  "api_key_encrypted" text NOT NULL,
  "key_hint" text,
  "status" text DEFAULT 'active' NOT NULL,
  "last_verified_at" timestamp with time zone,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "chk_ai_provider_keys_status_valid" CHECK ("ai_provider_keys"."status" IN ('active', 'revoked'))
);
--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD COLUMN "provider_id" uuid;
--> statement-breakpoint
ALTER TABLE "ai_profiles" ADD COLUMN "provider_id" uuid;
--> statement-breakpoint
ALTER TABLE "ai_profiles" DROP CONSTRAINT IF EXISTS "chk_ai_profiles_provider_valid";
--> statement-breakpoint
ALTER TABLE "ai_providers" ADD CONSTRAINT "ai_providers_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "ai_provider_keys" ADD CONSTRAINT "ai_provider_keys_provider_id_ai_providers_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_provider_id_ai_providers_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "ai_profiles" ADD CONSTRAINT "ai_profiles_provider_id_ai_providers_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX "idx_ai_providers_user_id_updated_at" ON "ai_providers" ("user_id","updated_at");
--> statement-breakpoint
CREATE INDEX "idx_ai_providers_user_id_default" ON "ai_providers" ("user_id","is_default");
--> statement-breakpoint
CREATE INDEX "idx_ai_providers_user_id_enabled" ON "ai_providers" ("user_id","is_enabled");
--> statement-breakpoint
CREATE INDEX "idx_ai_providers_user_id_name" ON "ai_providers" ("user_id","name");
--> statement-breakpoint
CREATE UNIQUE INDEX "uidx_ai_provider_keys_provider_id" ON "ai_provider_keys" ("provider_id");
--> statement-breakpoint
CREATE INDEX "idx_ai_provider_keys_provider_id" ON "ai_provider_keys" ("provider_id");
--> statement-breakpoint
CREATE INDEX "idx_ai_conversations_provider_id" ON "ai_conversations" ("provider_id");
--> statement-breakpoint
CREATE INDEX "idx_ai_profiles_provider_id" ON "ai_profiles" ("provider_id");
