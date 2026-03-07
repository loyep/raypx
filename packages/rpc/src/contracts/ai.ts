import { AI_ERROR_CODES, AI_EVENT_VERSION, AI_PROVIDER_DRIVERS } from "@raypx/shared/ai";
import { z } from "zod";

export const providerDriverSchema = z.enum(AI_PROVIDER_DRIVERS);
export const aiErrorCodeSchema = z.enum(AI_ERROR_CODES);

export const aiChatInputSchema = z.object({
  prompt: z.string().min(1).max(4000),
  providerId: z.string().uuid().optional(),
  model: z.string().min(1).max(120).optional(),
  conversationId: z.string().uuid().optional(),
  messageId: z.string().uuid().optional(),
  systemPromptPreset: z.string().max(64).optional(),
});

export const aiConversationInputSchema = z.object({
  providerId: z.string().uuid().optional(),
  title: z.string().min(1).max(160).optional(),
});

export const aiListConversationsInputSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export const aiGetConversationInputSchema = z.object({
  conversationId: z.string().uuid(),
});

export const aiAppendUserMessageInputSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(4000),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const aiRegenerateMessageInputSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  model: z.string().min(1).max(120).optional(),
  systemPromptPreset: z.string().max(64).optional(),
});

export const aiDeleteConversationInputSchema = z.object({
  conversationId: z.string().uuid(),
});

export const aiRenameConversationInputSchema = z.object({
  conversationId: z.string().uuid(),
  title: z.string().min(1).max(160),
});

export const aiUpdatePreferencesInputSchema = z.object({
  defaultProviderId: z.string().uuid().nullable().optional(),
  model: z.string().min(1).max(120).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(128000).optional(),
});

export const aiListProvidersInputSchema = z.object({});

export const aiListProviderAuditLogsInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  action: z.string().min(1).max(80).optional(),
});

export const aiCreateProviderInputSchema = z.object({
  name: z.string().min(1).max(80),
  driver: providerDriverSchema,
  baseUrl: z.string().url().nullable().optional(),
  defaultModel: z.string().min(1).max(120),
  models: z.array(z.string().min(1).max(120)).max(50).optional(),
  isEnabled: z.boolean().optional(),
  setDefault: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const aiUpdateProviderInputSchema = z.object({
  providerId: z.string().uuid(),
  name: z.string().min(1).max(80).optional(),
  driver: providerDriverSchema.optional(),
  baseUrl: z.string().url().nullable().optional(),
  defaultModel: z.string().min(1).max(120).optional(),
  models: z.array(z.string().min(1).max(120)).max(50).optional(),
  isEnabled: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const aiDeleteProviderInputSchema = z.object({
  providerId: z.string().uuid(),
});

export const aiSetDefaultProviderInputSchema = z.object({
  providerId: z.string().uuid(),
});

export const aiUpsertProviderCredentialInputSchema = z.object({
  providerId: z.string().uuid(),
  apiKey: z.string().min(1).max(512),
});

export const aiRemoveProviderCredentialInputSchema = z.object({
  providerId: z.string().uuid(),
});

export const aiChatStreamEventSchema = z.discriminatedUnion("type", [
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("status"),
    status: z.enum(["queued", "started", "completed"]),
  }),
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("meta"),
    requestId: z.string(),
    provider: z.string().min(1),
    model: z.string(),
    conversationId: z.string().uuid().optional(),
    messageId: z.string().uuid().optional(),
  }),
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("delta"),
    text: z.string(),
  }),
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("usage"),
    inputTokens: z.number().int().nonnegative().nullable(),
    outputTokens: z.number().int().nonnegative().nullable(),
    totalTokens: z.number().int().nonnegative().nullable(),
    costUsdCents: z.number().int().nonnegative().nullable(),
  }),
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("done"),
    model: z.string(),
    messageId: z.string().uuid().optional(),
    title: z.string().min(1).max(160).optional(),
  }),
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("error"),
    code: aiErrorCodeSchema,
    message: z.string(),
  }),
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("tool_call"),
    toolName: z.string(),
    input: z.record(z.string(), z.unknown()),
  }),
  z.object({
    eventVersion: z.literal(AI_EVENT_VERSION),
    type: z.literal("tool_result"),
    toolName: z.string(),
    output: z.record(z.string(), z.unknown()),
    error: z.string().nullable().optional(),
  }),
]);
