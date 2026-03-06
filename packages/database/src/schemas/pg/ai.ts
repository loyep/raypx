import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, timestamptz, uuidv7 } from "../../utils";
import { user } from "./auth";
import { organization } from "./organizations";

// AI Conversations
export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    model: text("model").notNull(),
    provider: text("provider").notNull(),
    providerId: uuid("provider_id"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_conversations_user_id").on(table.userId),
    index("idx_ai_conversations_created_at").on(table.createdAt),
    index("idx_ai_conversations_user_id_updated_at").on(table.userId, table.updatedAt),
    index("idx_ai_conversations_provider_id").on(table.providerId),
  ],
);

export const CreateAIConversationSchema = createInsertSchema(aiConversations);

// AI Messages
export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => aiConversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'user' | 'assistant' | 'system'
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    tokens: integer("tokens"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_messages_conversation_id").on(table.conversationId),
    index("idx_ai_messages_created_at").on(table.createdAt),
    index("idx_ai_messages_conversation_created_at").on(table.conversationId, table.createdAt),
    check(
      "chk_ai_messages_tokens_non_negative",
      sql`${table.tokens} IS NULL OR ${table.tokens} >= 0`,
    ),
  ],
);

export const CreateAIMessageSchema = createInsertSchema(aiMessages);

// AI Generations
export const aiGenerations = pgTable(
  "ai_generations",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // 'content' | 'code' | 'image' | 'analysis'
    prompt: text("prompt").notNull(),
    result: text("result").notNull(),
    model: text("model").notNull(),
    provider: text("provider").notNull(),
    tokens: integer("tokens"),
    cached: boolean("cached").default(false),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_generations_user_id").on(table.userId),
    index("idx_ai_generations_type").on(table.type),
    index("idx_ai_generations_created_at").on(table.createdAt),
    check(
      "chk_ai_generations_tokens_non_negative",
      sql`${table.tokens} IS NULL OR ${table.tokens} >= 0`,
    ),
  ],
);

export const CreateAIGenerationSchema = createInsertSchema(aiGenerations);

// AI Analyses
export const aiAnalyses = pgTable(
  "ai_analyses",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dataType: text("data_type").notNull(), // 'csv' | 'json' | 'text'
    dataSource: text("data_source").notNull(),
    analysisType: text("analysis_type").notNull(), // 'trend' | 'summary' | 'prediction' | 'anomaly'
    results: jsonb("results").notNull(),
    model: text("model").notNull(),
    tokens: integer("tokens"),
    cached: boolean("cached").default(false),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_analyses_user_id").on(table.userId),
    index("idx_ai_analyses_data_type").on(table.dataType),
    index("idx_ai_analyses_analysis_type").on(table.analysisType),
    index("idx_ai_analyses_created_at").on(table.createdAt),
    check(
      "chk_ai_analyses_tokens_non_negative",
      sql`${table.tokens} IS NULL OR ${table.tokens} >= 0`,
    ),
  ],
);

export const CreateAIAnalysisSchema = createInsertSchema(aiAnalyses);

// AI Call Logs (structured audit records per request)
export const aiCallLogs = pgTable(
  "ai_call_logs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    traceId: text("trace_id").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    route: text("route").notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    totalTokens: integer("total_tokens"),
    ttftMs: integer("ttft_ms"),
    chunkCount: integer("chunk_count"),
    charCount: integer("char_count"),
    latencyMs: integer("latency_ms").notNull(),
    status: text("status").notNull(),
    errorCode: text("error_code"),
    requestId: text("request_id"),
    costUsdCents: integer("cost_usd_cents"),
    metadata: jsonb("metadata"),
    endedAt: timestamptz("ended_at"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_call_logs_trace_id").on(table.traceId),
    index("idx_ai_call_logs_user_id").on(table.userId),
    index("idx_ai_call_logs_created_at").on(table.createdAt),
    index("idx_ai_call_logs_route_created_at").on(table.route, table.createdAt),
    index("idx_ai_call_logs_status_created_at").on(table.status, table.createdAt),
    index("idx_ai_call_logs_provider_created_at").on(table.provider, table.createdAt),
    index("idx_ai_call_logs_model_created_at").on(table.model, table.createdAt),
    index("idx_ai_call_logs_request_id").on(table.requestId),
    check(
      "chk_ai_call_logs_input_tokens_non_negative",
      sql`${table.inputTokens} IS NULL OR ${table.inputTokens} >= 0`,
    ),
    check(
      "chk_ai_call_logs_output_tokens_non_negative",
      sql`${table.outputTokens} IS NULL OR ${table.outputTokens} >= 0`,
    ),
    check(
      "chk_ai_call_logs_total_tokens_non_negative",
      sql`${table.totalTokens} IS NULL OR ${table.totalTokens} >= 0`,
    ),
    check(
      "chk_ai_call_logs_ttft_non_negative",
      sql`${table.ttftMs} IS NULL OR ${table.ttftMs} >= 0`,
    ),
    check(
      "chk_ai_call_logs_chunk_count_non_negative",
      sql`${table.chunkCount} IS NULL OR ${table.chunkCount} >= 0`,
    ),
    check(
      "chk_ai_call_logs_char_count_non_negative",
      sql`${table.charCount} IS NULL OR ${table.charCount} >= 0`,
    ),
    check("chk_ai_call_logs_latency_non_negative", sql`${table.latencyMs} >= 0`),
    check(
      "chk_ai_call_logs_cost_usd_cents_non_negative",
      sql`${table.costUsdCents} IS NULL OR ${table.costUsdCents} >= 0`,
    ),
  ],
);

export const CreateAICallLogSchema = createInsertSchema(aiCallLogs);

// AI Provider Audit Logs (provider CRUD & key changes)
export const aiProviderAuditLogs = pgTable(
  "ai_provider_audit_logs",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id"),
    action: text("action").notNull(),
    status: text("status").notNull().default("success"),
    details: jsonb("details"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_provider_audit_logs_user_id_created_at").on(table.userId, table.createdAt),
    index("idx_ai_provider_audit_logs_provider_id_created_at").on(
      table.providerId,
      table.createdAt,
    ),
    index("idx_ai_provider_audit_logs_action_created_at").on(table.action, table.createdAt),
    check("chk_ai_provider_audit_logs_status_valid", sql`${table.status} IN ('success', 'failed')`),
  ],
);

export const CreateAIProviderAuditLogSchema = createInsertSchema(aiProviderAuditLogs);

// AI Profiles (reusable configuration templates)
export const aiProfiles = pgTable(
  "ai_profiles",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    scope: text("scope").notNull(), // 'system' | 'organization' | 'user'
    ownerType: text("owner_type"), // 'organization' | 'user' | null(for system)
    ownerId: text("owner_id"),
    name: text("name").notNull(),
    provider: text("provider").notNull(), // 'qwen' | 'zhipu'
    providerId: uuid("provider_id"),
    model: text("model").notNull(),
    temperature: doublePrecision("temperature"),
    maxTokens: integer("max_tokens"),
    systemPromptPreset: text("system_prompt_preset"),
    isDefault: boolean("is_default").default(false),
    metadata: jsonb("metadata"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_profiles_scope").on(table.scope),
    index("idx_ai_profiles_owner").on(table.ownerType, table.ownerId),
    index("idx_ai_profiles_provider").on(table.provider),
    index("idx_ai_profiles_provider_id").on(table.providerId),
    index("idx_ai_profiles_updated_at").on(table.updatedAt),
    check("chk_ai_profiles_scope_valid", sql`${table.scope} IN ('system', 'organization', 'user')`),
    check(
      "chk_ai_profiles_owner_type_valid",
      sql`${table.ownerType} IS NULL OR ${table.ownerType} IN ('organization', 'user')`,
    ),
    check(
      "chk_ai_profiles_temperature_range",
      sql`${table.temperature} IS NULL OR (${table.temperature} >= 0 AND ${table.temperature} <= 2)`,
    ),
    check(
      "chk_ai_profiles_max_tokens_non_negative",
      sql`${table.maxTokens} IS NULL OR ${table.maxTokens} >= 0`,
    ),
  ],
);

export const CreateAIProfileSchema = createInsertSchema(aiProfiles);

// Active profile bindings per owner
export const aiProfileBindings = pgTable(
  "ai_profile_bindings",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    ownerType: text("owner_type").notNull(), // 'organization' | 'user'
    ownerId: text("owner_id").notNull(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => aiProfiles.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_profile_bindings_owner").on(table.ownerType, table.ownerId),
    index("idx_ai_profile_bindings_profile_id").on(table.profileId),
    index("idx_ai_profile_bindings_owner_active").on(
      table.ownerType,
      table.ownerId,
      table.isActive,
    ),
    check(
      "chk_ai_profile_bindings_owner_type_valid",
      sql`${table.ownerType} IN ('organization', 'user')`,
    ),
  ],
);

export const CreateAIProfileBindingSchema = createInsertSchema(aiProfileBindings);

// Provider definitions (user + system scopes)
export const aiProviders = pgTable(
  "ai_providers",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    scope: text("scope").notNull().default("user"), // 'user' | 'system'
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    driver: text("driver").notNull(), // openai | alibaba | zhipu | anthropic | google | azure-openai
    baseUrl: text("base_url"),
    defaultModel: text("default_model").notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_providers_scope_updated_at").on(table.scope, table.updatedAt),
    index("idx_ai_providers_user_id_updated_at").on(table.userId, table.updatedAt),
    index("idx_ai_providers_user_id_default").on(table.userId, table.isDefault),
    index("idx_ai_providers_user_id_enabled").on(table.userId, table.isEnabled),
    index("idx_ai_providers_user_id_name").on(table.userId, table.name),
    index("idx_ai_providers_scope_default").on(table.scope, table.isDefault),
    index("idx_ai_providers_scope_enabled").on(table.scope, table.isEnabled),
    check("chk_ai_providers_scope_valid", sql`${table.scope} IN ('user', 'system')`),
    check(
      "chk_ai_providers_driver_valid",
      sql`${table.driver} IN ('openai', 'alibaba', 'zhipu', 'anthropic', 'google', 'azure-openai')`,
    ),
    check(
      "chk_ai_providers_scope_user_fk",
      sql`(${table.scope} = 'system' AND ${table.userId} IS NULL) OR (${table.scope} = 'user' AND ${table.userId} IS NOT NULL)`,
    ),
  ],
);

export const CreateAIProviderSchema = createInsertSchema(aiProviders);

// Provider API keys (1:1 with provider)
export const aiProviderKeys = pgTable(
  "ai_provider_keys",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => aiProviders.id, { onDelete: "cascade" }),
    apiKeyEncrypted: text("api_key_encrypted").notNull(),
    keyHint: text("key_hint"),
    status: text("status").default("active").notNull(),
    lastVerifiedAt: timestamptz("last_verified_at"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("uidx_ai_provider_keys_provider_id").on(table.providerId),
    index("idx_ai_provider_keys_provider_id").on(table.providerId),
    check("chk_ai_provider_keys_status_valid", sql`${table.status} IN ('active', 'revoked')`),
  ],
);

export const CreateAIProviderKeySchema = createInsertSchema(aiProviderKeys);

// Provider credentials per owner (encrypted secret only)
export const aiProviderCredentials = pgTable(
  "ai_provider_credentials",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    ownerType: text("owner_type").notNull(), // 'organization' | 'user'
    ownerId: text("owner_id").notNull(),
    provider: text("provider").notNull(), // 'qwen' | 'zhipu'
    apiKeyEncrypted: text("api_key_encrypted").notNull(),
    keyHint: text("key_hint"), // masked hint for UI, e.g. "sk-***9f"
    status: text("status").default("active").notNull(), // 'active' | 'revoked'
    lastVerifiedAt: timestamptz("last_verified_at"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("uidx_ai_provider_credentials_owner_provider").on(
      table.ownerType,
      table.ownerId,
      table.provider,
    ),
    index("idx_ai_provider_credentials_owner").on(table.ownerType, table.ownerId),
    check(
      "chk_ai_provider_credentials_owner_type_valid",
      sql`${table.ownerType} IN ('organization', 'user')`,
    ),
    check(
      "chk_ai_provider_credentials_provider_valid",
      sql`${table.provider} IN ('qwen', 'zhipu')`,
    ),
    check(
      "chk_ai_provider_credentials_status_valid",
      sql`${table.status} IN ('active', 'revoked')`,
    ),
  ],
);

export const CreateAIProviderCredentialSchema = createInsertSchema(aiProviderCredentials);

// Runtime policy constraints for governance
export const aiRuntimePolicies = pgTable(
  "ai_runtime_policies",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    scope: text("scope").notNull(), // 'global' | 'organization' | 'user'
    organizationId: uuid("organization_id").references(() => organization.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    allowedProviders: jsonb("allowed_providers").notNull(),
    allowedModels: jsonb("allowed_models"),
    maxTokens: integer("max_tokens"),
    timeoutMs: integer("timeout_ms"),
    retryCount: integer("retry_count"),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamptz("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("idx_ai_runtime_policies_scope").on(table.scope),
    index("idx_ai_runtime_policies_org").on(table.organizationId),
    index("idx_ai_runtime_policies_user").on(table.userId),
    check(
      "chk_ai_runtime_policies_scope_valid",
      sql`${table.scope} IN ('global', 'organization', 'user')`,
    ),
    check(
      "chk_ai_runtime_policies_max_tokens_non_negative",
      sql`${table.maxTokens} IS NULL OR ${table.maxTokens} >= 0`,
    ),
    check(
      "chk_ai_runtime_policies_timeout_ms_non_negative",
      sql`${table.timeoutMs} IS NULL OR ${table.timeoutMs} >= 0`,
    ),
    check(
      "chk_ai_runtime_policies_retry_count_non_negative",
      sql`${table.retryCount} IS NULL OR ${table.retryCount} >= 0`,
    ),
  ],
);

export const CreateAIRuntimePolicySchema = createInsertSchema(aiRuntimePolicies);
