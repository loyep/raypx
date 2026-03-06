import type { DatabaseClient } from "@raypx/database";
import type { AIChatStreamEvent, AIProviderDriver, AIUsage } from "@raypx/shared/ai";

export type {
  AIChatStreamEvent,
  AIErrorCode,
  AIProviderDriver,
  AIUsage,
  ChatProvider,
} from "@raypx/shared/ai";

export type AIChatInput = {
  prompt: string;
  providerId?: string;
  conversationId?: string;
  messageId?: string;
  systemPromptPreset?: string;
};

export type AIConversationInput = {
  providerId?: string;
  title?: string;
};

export type AIListConversationsInput = {
  limit: number;
  offset: number;
};

export type AIAppendUserMessageInput = {
  conversationId: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export type AIRegenerateMessageInput = {
  conversationId: string;
  messageId?: string;
  providerId?: string;
  systemPromptPreset?: string;
};

export type AIRenameConversationInput = {
  conversationId: string;
  title: string;
};

export type AIChatResult = {
  text: string;
  model: string;
  conversationId: string;
  messageId: string;
};

export type AIChatStreamResult = {
  stream: ReadableStream<AIChatStreamEvent>;
  conversationId: string;
  userMessageId: string;
};

export type AIServiceContext = {
  db: DatabaseClient;
  userId: string;
};

export type AIUserChatPreferences = {
  source: "user" | "default" | "missing";
  defaultProviderId: string | null;
  model: string;
  temperature: number;
  maxTokens: number;
  providers: AIUserProviderSummary[];
};

export type AIUpdateUserChatPreferencesInput = {
  defaultProviderId?: string | null;
  model?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
};

export type AIUpsertUserProviderCredentialInput = {
  providerId: string;
  apiKey: string;
};

export type AICreateUserProviderInput = {
  name: string;
  driver: AIProviderDriver;
  baseUrl?: string | null;
  defaultModel: string;
  isEnabled?: boolean;
  setDefault?: boolean;
  metadata?: Record<string, unknown> | null;
};

export type AIUpdateUserProviderInput = {
  providerId: string;
  name?: string;
  driver?: AIProviderDriver;
  baseUrl?: string | null;
  defaultModel?: string;
  isEnabled?: boolean;
  metadata?: Record<string, unknown> | null;
};

export type AISetDefaultProviderInput = {
  providerId: string;
};

export type AIRemoveUserProviderCredentialInput = {
  providerId: string;
};

export type AIDeleteUserProviderInput = {
  providerId: string;
};

export type AIListProviderAuditLogsInput = {
  limit: number;
  offset: number;
  action?: string;
};

export type AIUserProviderSummary = {
  id: string;
  name: string;
  driver: AIProviderDriver;
  baseUrl: string | null;
  defaultModel: string;
  isEnabled: boolean;
  isDefault: boolean;
  hasKey: boolean;
  keyHint: string | null;
  metadata: Record<string, unknown> | null;
};

export type AISystemProviderSummary = {
  id: string;
  name: string;
  driver: AIProviderDriver;
  baseUrl: string | null;
  defaultModel: string;
  isEnabled: boolean;
  isDefault: boolean;
  hasKey: boolean;
  keyHint: string | null;
  metadata: Record<string, unknown> | null;
};

export type AIProviderAuditLogItem = {
  id: string;
  userId: string;
  providerId: string | null;
  providerName: string | null;
  action: string;
  status: "success" | "failed";
  details: Record<string, unknown> | null;
  createdAt: Date;
};

export type StreamTrace = {
  traceId: string;
  requestId: string;
  route: string;
  provider: string;
  model: string;
  userId: string;
  promptLength: number;
  startedAt: number;
  firstChunkAt: number | null;
  finishedAt: number | null;
  chunkCount: number;
  charCount: number;
  usage: AIUsage;
  status: "success" | "error";
  errorCode: import("@raypx/shared/ai").AIErrorCode | null;
};
