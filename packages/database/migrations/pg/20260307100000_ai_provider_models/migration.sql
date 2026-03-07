CREATE TABLE "provider_models" (
  "id" uuid PRIMARY KEY NOT NULL,
  "provider_id" uuid NOT NULL,
  "model_id" text NOT NULL,
  "display_name" text,
  "model_type" text DEFAULT 'llm' NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "max_tokens" integer,
  "context_window" integer,
  "metadata" jsonb,
  "created_at" timestamptz NOT NULL,
  "updated_at" timestamptz NOT NULL,
  CONSTRAINT "provider_models_provider_id_ai_providers_id_fk"
    FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE cascade,
  CONSTRAINT "chk_provider_models_type_valid"
    CHECK ("provider_models"."model_type" IN ('llm', 'embedding', 'rerank', 'image', 'audio', 'tts', 'stt')),
  CONSTRAINT "chk_provider_models_priority_non_negative"
    CHECK ("provider_models"."priority" >= 0),
  CONSTRAINT "chk_provider_models_max_tokens_non_negative"
    CHECK ("provider_models"."max_tokens" IS NULL OR "provider_models"."max_tokens" >= 0),
  CONSTRAINT "chk_provider_models_context_window_non_negative"
    CHECK ("provider_models"."context_window" IS NULL OR "provider_models"."context_window" >= 0)
);

CREATE UNIQUE INDEX "uidx_provider_models_provider_model"
  ON "provider_models" USING btree ("provider_id", "model_id");
CREATE INDEX "idx_provider_models_provider_id"
  ON "provider_models" USING btree ("provider_id");
CREATE INDEX "idx_provider_models_provider_enabled"
  ON "provider_models" USING btree ("provider_id", "is_enabled");
CREATE INDEX "idx_provider_models_provider_default"
  ON "provider_models" USING btree ("provider_id", "is_default");
CREATE INDEX "idx_provider_models_provider_priority"
  ON "provider_models" USING btree ("provider_id", "priority");
