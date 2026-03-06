CREATE TABLE "ai_provider_audit_logs" (
  "id" uuid PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "provider_id" uuid,
  "action" text NOT NULL,
  "status" text DEFAULT 'success' NOT NULL,
  "details" jsonb,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "chk_ai_provider_audit_logs_status_valid" CHECK ("ai_provider_audit_logs"."status" IN ('success', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "ai_provider_audit_logs" ADD CONSTRAINT "ai_provider_audit_logs_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
--> statement-breakpoint
ALTER TABLE "ai_provider_audit_logs" ADD CONSTRAINT "ai_provider_audit_logs_provider_id_ai_providers_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX "idx_ai_provider_audit_logs_user_id_created_at" ON "ai_provider_audit_logs" ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "idx_ai_provider_audit_logs_provider_id_created_at" ON "ai_provider_audit_logs" ("provider_id","created_at");
--> statement-breakpoint
CREATE INDEX "idx_ai_provider_audit_logs_action_created_at" ON "ai_provider_audit_logs" ("action","created_at");
