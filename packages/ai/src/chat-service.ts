import type { AIChatStreamEvent } from "@raypx/shared/ai";
import { generateText, streamText } from "ai";
import { envs } from "./env";
import { createAIServiceError, toAIServiceError } from "./errors";
import {
  appendMessage,
  createConversation,
  deleteConversation,
  getConversationWithMessages,
  listConversations,
  persistCallLog,
  updateConversationTitle,
} from "./persistence";
import {
  appendProviderAuditLog,
  createSystemProvider as createSystemProviderRecord,
  createUserProvider,
  deleteSystemProvider as deleteSystemProviderRecord,
  deleteUserProvider,
  getSystemProviderById,
  getSystemProviderCredential,
  getUserBoundProfile,
  getUserProviderById,
  getUserProviderCredential,
  listSystemProviderCredentialsByProviderIds,
  listSystemProviders as listSystemProviderRecords,
  listUserProviderAuditLogs,
  listUserProviders,
  removeSystemProviderSecret as removeSystemProviderSecretRecord,
  removeUserProviderSecret,
  setDefaultSystemProvider as setDefaultSystemProviderRecord,
  setDefaultUserProvider,
  setSystemProviderSecret as setSystemProviderSecretRecord,
  setUserProviderSecret,
  updateSystemProvider as updateSystemProviderRecord,
  updateUserProvider,
  upsertUserProfile,
} from "./persistence/preferences";
import { getChatRuntime } from "./providers";
import { decryptCredential, encryptCredential, getCredentialHint } from "./security/credentials";
import { deltaEvent, doneEvent, errorEvent, metaEvent, statusEvent, usageEvent } from "./stream";
import {
  createStreamTrace,
  logStreamStarted,
  markChunk,
  markError,
  markFirstChunk,
  markSuccess,
} from "./telemetry";
import type {
  AIAppendUserMessageInput,
  AIChatInput,
  AIChatResult,
  AIChatStreamResult,
  AIConversationInput,
  AICreateUserProviderInput,
  AIDeleteUserProviderInput,
  AIListConversationsInput,
  AIListProviderAuditLogsInput,
  AIRegenerateMessageInput,
  AIRemoveUserProviderCredentialInput,
  AIRenameConversationInput,
  AIServiceContext,
  AISetDefaultProviderInput,
  AIUpdateUserChatPreferencesInput,
  AIUpdateUserProviderInput,
  AIUpsertUserProviderCredentialInput,
  AIUserChatPreferences,
  AIUserProviderSummary,
} from "./types";

const env = envs();

function normalizeModelCatalog(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const models: string[] = [];

  for (const value of input) {
    if (typeof value !== "string") continue;
    const model = value.trim();
    if (!model || seen.has(model)) continue;
    seen.add(model);
    models.push(model);
  }

  return models;
}

function extractMetadata(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  return metadata as Record<string, unknown>;
}

function resolveProviderModels(provider: { defaultModel: string; metadata: unknown }): string[] {
  const defaultModel = provider.defaultModel.trim();
  const metadata = extractMetadata(provider.metadata);
  const models = normalizeModelCatalog(metadata?.models);

  if (!defaultModel) return models;
  if (models.includes(defaultModel)) return models;
  return [defaultModel, ...models];
}

function withProviderModelsMetadata(
  input: {
    defaultModel: string;
    models?: string[];
    metadata?: Record<string, unknown> | null;
  },
  existingMetadata?: unknown,
) {
  if (input.models === undefined) {
    return input.metadata;
  }

  const defaultModel = input.defaultModel.trim();
  const modelCatalog = normalizeModelCatalog(input.models);
  if (defaultModel && !modelCatalog.includes(defaultModel)) {
    modelCatalog.unshift(defaultModel);
  }

  const baseMetadata = {
    ...(extractMetadata(existingMetadata) ?? {}),
    ...(input.metadata ?? {}),
  };

  return {
    ...baseMetadata,
    models: modelCatalog,
  };
}

function promptToTitle(prompt: string) {
  const compact = prompt.replace(/\s+/g, " ").trim();
  return compact.length > 64 ? `${compact.slice(0, 64)}...` : compact;
}

function normalizeGeneratedTitle(input: string) {
  const compact = input
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!compact) return null;
  return compact.length > 160 ? compact.slice(0, 160).trim() : compact;
}

async function generateConversationTitle(input: {
  model: Parameters<typeof generateText>[0]["model"];
  userPrompt: string;
  assistantReply: string;
}) {
  const fallback = promptToTitle(input.userPrompt);
  if (!input.assistantReply.trim()) return fallback;

  try {
    const result = await generateText({
      model: input.model,
      temperature: 0.2,
      maxOutputTokens: 24,
      prompt: [
        "Generate a concise chat title from the first user request and first assistant reply.",
        "Return only the title text, no quotes, no punctuation at the end.",
        "Limit to 3-8 words, max 60 characters.",
        "",
        `User: ${input.userPrompt}`,
        `Assistant: ${input.assistantReply}`,
      ].join("\n"),
    });

    return normalizeGeneratedTitle(result.text) ?? fallback;
  } catch {
    return fallback;
  }
}

async function ensureConversationExists(context: AIServiceContext, conversationId: string) {
  const exists = await getConversationWithMessages(context.db, {
    userId: context.userId,
    conversationId,
  });
  if (!exists) {
    throw createAIServiceError("AI_BAD_REQUEST", "Conversation not found");
  }

  return exists;
}

function assertConversationId(conversationId: string | undefined): string {
  if (!conversationId) {
    throw createAIServiceError("AI_INTERNAL", "Conversation id was not resolved");
  }
  return conversationId;
}

async function resolveProviderSummaries(
  context: AIServiceContext,
): Promise<{ providers: AIUserProviderSummary[]; defaultProviderId: string | null }> {
  const [userProviders, systemProviders] = await Promise.all([
    listUserProviders(context.db, { userId: context.userId }),
    listSystemProviderRecords(context.db),
  ]);
  const providers = [...userProviders, ...systemProviders];
  const credentials = await listSystemProviderCredentialsByProviderIds(context.db, {
    providerIds: providers.map((item) => item.id),
  });
  const credentialMap = new Map(
    credentials
      .filter((item) => item.status === "active")
      .map((item) => [item.providerId, item] as const),
  );

  const summaries: AIUserProviderSummary[] = providers.map((provider) => {
    const credential = credentialMap.get(provider.id);
    const metadata = extractMetadata(provider.metadata);
    return {
      id: provider.id,
      name: provider.name,
      driver: provider.driver as AIUserProviderSummary["driver"],
      baseUrl: provider.baseUrl,
      defaultModel: provider.defaultModel,
      models: resolveProviderModels(provider),
      isEnabled: provider.isEnabled,
      isDefault: provider.isDefault,
      hasKey: Boolean(credential),
      keyHint: credential?.keyHint ?? null,
      metadata,
    };
  });

  const defaultProvider =
    summaries.find((item) => item.isDefault && userProviders.some((p) => p.id === item.id)) ??
    summaries.find((item) => item.isDefault) ??
    null;

  return {
    providers: summaries,
    defaultProviderId: defaultProvider?.id ?? null,
  };
}

async function resolveUserChatPreferences(
  context: AIServiceContext,
): Promise<AIUserChatPreferences> {
  const [providerState, bound] = await Promise.all([
    resolveProviderSummaries(context),
    getUserBoundProfile(context.db, { userId: context.userId }),
  ]);

  if (!bound) {
    const defaultProvider = providerState.providers.find(
      (item) => item.id === providerState.defaultProviderId,
    );
    return {
      source: providerState.defaultProviderId ? "default" : "missing",
      defaultProviderId: providerState.defaultProviderId,
      model: defaultProvider?.defaultModel ?? "",
      temperature: env.AI_TEMPERATURE ?? 0.7,
      maxTokens: env.AI_MAX_TOKENS,
      providers: providerState.providers,
    };
  }

  return {
    source: "user",
    defaultProviderId:
      (bound.profile.providerId as string | null) ?? providerState.defaultProviderId,
    model: bound.profile.model,
    temperature: bound.profile.temperature ?? env.AI_TEMPERATURE ?? 0.7,
    maxTokens: bound.profile.maxTokens ?? env.AI_MAX_TOKENS,
    providers: providerState.providers,
  };
}

async function resolveRuntime(
  context: AIServiceContext,
  input: {
    providerId?: string;
    preferredModel?: string | null;
  },
) {
  const preferences = await resolveUserChatPreferences(context);

  const targetProviderId = input.providerId ?? preferences.defaultProviderId;
  if (!targetProviderId) {
    throw createAIServiceError(
      "AI_BAD_REQUEST",
      "No provider configured. Please set up one in settings",
    );
  }

  const userProvider = await getUserProviderById(context.db, {
    userId: context.userId,
    providerId: targetProviderId,
  });
  const systemProvider = userProvider
    ? null
    : await getSystemProviderById(context.db, {
        providerId: targetProviderId,
      });
  const provider = userProvider ?? systemProvider;

  if (!provider || !provider.isEnabled) {
    throw createAIServiceError("AI_BAD_REQUEST", "Provider not available or disabled");
  }

  const credential = userProvider
    ? await getUserProviderCredential(context.db, {
        userId: context.userId,
        providerId: targetProviderId,
      })
    : await getSystemProviderCredential(context.db, {
        providerId: targetProviderId,
      });
  if (!credential) {
    throw createAIServiceError("AI_PROVIDER_UNAVAILABLE", "Provider key is missing");
  }

  const runtime = getChatRuntime(
    {
      id: provider.id,
      name: provider.name,
      driver: provider.driver as AIUserProviderSummary["driver"],
      baseUrl: provider.baseUrl,
      defaultModel: provider.defaultModel,
      availableModels: resolveProviderModels(provider),
    },
    {
      apiKey: decryptCredential(credential.apiKeyEncrypted),
      model:
        input.preferredModel?.trim() ||
        (targetProviderId === preferences.defaultProviderId ? preferences.model : null),
      strictModel: Boolean(input.preferredModel?.trim()),
    },
  );

  return {
    preferences,
    provider,
    runtime,
  };
}

export const chatService = {
  async getUserChatPreferences(context: AIServiceContext) {
    return resolveUserChatPreferences(context);
  },

  async updateUserChatPreferences(
    context: AIServiceContext,
    input: AIUpdateUserChatPreferencesInput,
  ) {
    const current = await resolveUserChatPreferences(context);
    const temperature = input.temperature ?? current.temperature ?? env.AI_TEMPERATURE ?? 0.7;
    const maxTokens = input.maxTokens ?? current.maxTokens ?? env.AI_MAX_TOKENS;
    const defaultProviderId = input.defaultProviderId ?? current.defaultProviderId;

    let model = input.model?.trim() || "";
    if (!model && defaultProviderId) {
      const provider =
        (await getUserProviderById(context.db, {
          userId: context.userId,
          providerId: defaultProviderId,
        })) ??
        (await getSystemProviderById(context.db, {
          providerId: defaultProviderId,
        }));
      model = provider?.defaultModel ?? "";
    }

    await upsertUserProfile(context.db, {
      userId: context.userId,
      data: {
        defaultProviderId,
        model,
        temperature,
        maxTokens,
      },
    });

    return resolveUserChatPreferences(context);
  },

  async listUserProviders(context: AIServiceContext) {
    const preferences = await resolveUserChatPreferences(context);
    return preferences.providers;
  },

  async listUserProviderAuditLogs(context: AIServiceContext, input: AIListProviderAuditLogsInput) {
    return listUserProviderAuditLogs(context.db, {
      userId: context.userId,
      ...input,
    });
  },

  async createUserProvider(context: AIServiceContext, input: AICreateUserProviderInput) {
    const metadata = withProviderModelsMetadata(input);
    const created = await createUserProvider(context.db, {
      userId: context.userId,
      ...input,
      metadata,
    });

    if (!created) {
      throw createAIServiceError("AI_INTERNAL", "Failed to create provider");
    }

    if (input.setDefault) {
      await upsertUserProfile(context.db, {
        userId: context.userId,
        data: {
          defaultProviderId: created.id,
          model: created.defaultModel,
          temperature: env.AI_TEMPERATURE ?? 0.7,
          maxTokens: env.AI_MAX_TOKENS,
        },
      });
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: created.id,
      action: "provider.create",
      details: {
        driver: created.driver,
        name: created.name,
      },
    });

    return resolveUserChatPreferences(context);
  },

  async updateUserProvider(context: AIServiceContext, input: AIUpdateUserProviderInput) {
    const current = await getUserProviderById(context.db, {
      userId: context.userId,
      providerId: input.providerId,
    });
    if (!current) {
      throw createAIServiceError("AI_BAD_REQUEST", "Provider not found");
    }

    const metadata =
      input.models === undefined
        ? input.metadata
        : withProviderModelsMetadata(
            {
              defaultModel: input.defaultModel ?? current.defaultModel,
              models: input.models,
              metadata: input.metadata,
            },
            current.metadata,
          );

    const updated = await updateUserProvider(context.db, {
      userId: context.userId,
      ...input,
      metadata,
    });
    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "Provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: updated.id,
      action:
        input.isEnabled === undefined
          ? "provider.update"
          : input.isEnabled
            ? "provider.enable"
            : "provider.disable",
      details: {
        driver: updated.driver,
        name: updated.name,
      },
    });

    return resolveUserChatPreferences(context);
  },

  async deleteUserProvider(context: AIServiceContext, input: AIDeleteUserProviderInput) {
    const deleted = await deleteUserProvider(context.db, {
      userId: context.userId,
      providerId: input.providerId,
    });
    if (!deleted) {
      throw createAIServiceError("AI_BAD_REQUEST", "Provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: input.providerId,
      action: "provider.delete",
      details: {
        name: deleted.name,
      },
    });

    const nextDefault =
      (await listUserProviders(context.db, { userId: context.userId })).find(
        (provider) => provider.isDefault,
      ) ?? null;
    await upsertUserProfile(context.db, {
      userId: context.userId,
      data: {
        defaultProviderId: nextDefault?.id ?? null,
        model: nextDefault?.defaultModel ?? "",
        temperature: env.AI_TEMPERATURE ?? 0.7,
        maxTokens: env.AI_MAX_TOKENS,
      },
    });

    return resolveUserChatPreferences(context);
  },

  async setDefaultProvider(context: AIServiceContext, input: AISetDefaultProviderInput) {
    const updated = await setDefaultUserProvider(context.db, {
      userId: context.userId,
      providerId: input.providerId,
    });
    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "Provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: updated.id,
      action: "provider.set_default",
      details: {
        name: updated.name,
      },
    });

    await upsertUserProfile(context.db, {
      userId: context.userId,
      data: {
        defaultProviderId: updated.id,
        model: updated.defaultModel,
        temperature: env.AI_TEMPERATURE ?? 0.7,
        maxTokens: env.AI_MAX_TOKENS,
      },
    });

    return resolveUserChatPreferences(context);
  },

  async setUserProviderSecret(
    context: AIServiceContext,
    input: AIUpsertUserProviderCredentialInput,
  ) {
    const updated = await setUserProviderSecret(context.db, {
      userId: context.userId,
      providerId: input.providerId,
      apiKeyEncrypted: encryptCredential(input.apiKey.trim()),
      keyHint: getCredentialHint(input.apiKey),
    });

    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "Provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: input.providerId,
      action: "provider.credential.upsert",
      details: {
        keyHint: updated.keyHint,
      },
    });

    return resolveUserChatPreferences(context);
  },

  async removeUserProviderSecret(
    context: AIServiceContext,
    input: AIRemoveUserProviderCredentialInput,
  ) {
    const updated = await removeUserProviderSecret(context.db, {
      userId: context.userId,
      providerId: input.providerId,
    });

    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "Provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: input.providerId,
      action: "provider.credential.remove",
    });

    return resolveUserChatPreferences(context);
  },

  async listSystemProviders(context: AIServiceContext) {
    const providers = await listSystemProviderRecords(context.db);
    const credentials = await listSystemProviderCredentialsByProviderIds(context.db, {
      providerIds: providers.map((item) => item.id),
    });
    const credentialMap = new Map(
      credentials
        .filter((item) => item.status === "active")
        .map((item) => [item.providerId, item] as const),
    );

    return providers.map((provider) => {
      const metadata = extractMetadata(provider.metadata);
      return {
        id: provider.id,
        name: provider.name,
        driver: provider.driver as AIUserProviderSummary["driver"],
        baseUrl: provider.baseUrl,
        defaultModel: provider.defaultModel,
        models: resolveProviderModels(provider),
        isEnabled: provider.isEnabled,
        isDefault: provider.isDefault,
        hasKey: Boolean(credentialMap.get(provider.id)),
        keyHint: credentialMap.get(provider.id)?.keyHint ?? null,
        metadata,
      };
    });
  },

  async createSystemProvider(context: AIServiceContext, input: AICreateUserProviderInput) {
    const created = await createSystemProviderRecord(context.db, {
      ...input,
      metadata: withProviderModelsMetadata(input),
    });
    if (!created) {
      throw createAIServiceError("AI_INTERNAL", "Failed to create system provider");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: created.id,
      action: "provider.create",
      details: { scope: "system", driver: created.driver, name: created.name },
    });
    return this.listSystemProviders(context);
  },

  async updateSystemProvider(context: AIServiceContext, input: AIUpdateUserProviderInput) {
    const current = await getSystemProviderById(context.db, {
      providerId: input.providerId,
    });
    if (!current) {
      throw createAIServiceError("AI_BAD_REQUEST", "System provider not found");
    }

    const metadata =
      input.models === undefined
        ? input.metadata
        : withProviderModelsMetadata(
            {
              defaultModel: input.defaultModel ?? current.defaultModel,
              models: input.models,
              metadata: input.metadata,
            },
            current.metadata,
          );

    const updated = await updateSystemProviderRecord(context.db, {
      ...input,
      metadata,
    });
    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "System provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: updated.id,
      action:
        input.isEnabled === undefined
          ? "provider.update"
          : input.isEnabled
            ? "provider.enable"
            : "provider.disable",
      details: { scope: "system", driver: updated.driver, name: updated.name },
    });
    return this.listSystemProviders(context);
  },

  async deleteSystemProvider(context: AIServiceContext, input: AIDeleteUserProviderInput) {
    const deleted = await deleteSystemProviderRecord(context.db, {
      providerId: input.providerId,
    });
    if (!deleted) {
      throw createAIServiceError("AI_BAD_REQUEST", "System provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: input.providerId,
      action: "provider.delete",
      details: { scope: "system", name: deleted.name },
    });
    return this.listSystemProviders(context);
  },

  async setDefaultSystemProvider(context: AIServiceContext, input: AISetDefaultProviderInput) {
    const updated = await setDefaultSystemProviderRecord(context.db, {
      providerId: input.providerId,
    });
    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "System provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: updated.id,
      action: "provider.set_default",
      details: { scope: "system", name: updated.name },
    });
    return this.listSystemProviders(context);
  },

  async setSystemProviderSecret(
    context: AIServiceContext,
    input: AIUpsertUserProviderCredentialInput,
  ) {
    const updated = await setSystemProviderSecretRecord(context.db, {
      providerId: input.providerId,
      apiKeyEncrypted: encryptCredential(input.apiKey.trim()),
      keyHint: getCredentialHint(input.apiKey),
    });
    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "System provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: input.providerId,
      action: "provider.credential.upsert",
      details: { scope: "system", keyHint: updated.keyHint },
    });
    return this.listSystemProviders(context);
  },

  async removeSystemProviderSecret(
    context: AIServiceContext,
    input: AIRemoveUserProviderCredentialInput,
  ) {
    const updated = await removeSystemProviderSecretRecord(context.db, {
      providerId: input.providerId,
    });
    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "System provider not found");
    }
    await appendProviderAuditLog(context.db, {
      userId: context.userId,
      providerId: input.providerId,
      action: "provider.credential.remove",
      details: { scope: "system" },
    });
    return this.listSystemProviders(context);
  },

  async createConversation(context: AIServiceContext, input: AIConversationInput) {
    const resolved = await resolveRuntime(context, {
      providerId: input.providerId,
    });

    const conversation = await createConversation(context.db, {
      userId: context.userId,
      title: input.title ?? "New Chat",
      provider: resolved.runtime.providerDriver,
      providerId: resolved.runtime.providerId,
      model: resolved.runtime.displayModel,
    });

    return conversation;
  },

  async listConversations(context: AIServiceContext, input: AIListConversationsInput) {
    return listConversations(context.db, {
      userId: context.userId,
      limit: input.limit,
      offset: input.offset,
    });
  },

  async getConversation(context: AIServiceContext, conversationId: string) {
    return getConversationWithMessages(context.db, {
      userId: context.userId,
      conversationId,
    });
  },

  async appendUserMessage(context: AIServiceContext, input: AIAppendUserMessageInput) {
    await ensureConversationExists(context, input.conversationId);

    return appendMessage(context.db, {
      conversationId: input.conversationId,
      role: "user",
      content: input.content,
      metadata: input.metadata ?? null,
    });
  },

  async deleteConversation(context: AIServiceContext, conversationId: string) {
    return deleteConversation(context.db, {
      userId: context.userId,
      conversationId,
    });
  },

  async renameConversation(context: AIServiceContext, input: AIRenameConversationInput) {
    const title = input.title.trim();
    if (!title) {
      throw createAIServiceError("AI_BAD_REQUEST", "Title is required");
    }

    const updated = await updateConversationTitle(context.db, {
      userId: context.userId,
      conversationId: input.conversationId,
      title,
    });
    if (!updated) {
      throw createAIServiceError("AI_BAD_REQUEST", "Conversation not found");
    }
    return updated;
  },

  async regenerateMessage(context: AIServiceContext, input: AIRegenerateMessageInput) {
    const resolved = await resolveRuntime(context, {
      providerId: input.providerId,
      preferredModel: input.model,
    });

    const result = await ensureConversationExists(context, input.conversationId);

    const candidateUserMessages = result.messages.filter(
      (message: { role: string; id: string; content: string }) => message.role === "user",
    );
    const target =
      input.messageId !== undefined
        ? candidateUserMessages.find((message: { id: string }) => message.id === input.messageId)
        : candidateUserMessages.at(-1);

    if (!target) {
      throw createAIServiceError("AI_BAD_REQUEST", "No user message available to regenerate");
    }

    try {
      const response = await generateText({
        model: resolved.runtime.model,
        prompt: target.content,
        temperature: resolved.preferences.temperature,
        maxOutputTokens: resolved.preferences.maxTokens,
      });

      const assistantMessage = await appendMessage(context.db, {
        conversationId: input.conversationId,
        role: "assistant",
        content: response.text,
        metadata: {
          regeneratedFromMessageId: target.id,
        },
      });

      return {
        text: response.text,
        model: resolved.runtime.displayModel,
        message: assistantMessage,
      };
    } catch (error) {
      throw toAIServiceError(error);
    }
  },

  async chat(context: AIServiceContext, input: AIChatInput): Promise<AIChatResult> {
    const resolved = await resolveRuntime(context, {
      providerId: input.providerId,
      preferredModel: input.model,
    });

    let conversationId = input.conversationId;
    if (!conversationId) {
      const conversation = await createConversation(context.db, {
        userId: context.userId,
        title: promptToTitle(input.prompt),
        provider: resolved.runtime.providerDriver,
        providerId: resolved.runtime.providerId,
        model: resolved.runtime.displayModel,
      });
      conversationId = conversation.id;
    } else {
      await ensureConversationExists(context, conversationId);
    }

    const resolvedConversationId = assertConversationId(conversationId);

    await appendMessage(context.db, {
      conversationId: resolvedConversationId,
      role: "user",
      content: input.prompt,
      metadata: {
        systemPromptPreset: input.systemPromptPreset ?? null,
      },
    });

    try {
      const response = await generateText({
        model: resolved.runtime.model,
        prompt: input.prompt,
        temperature: resolved.preferences.temperature,
        maxOutputTokens: resolved.preferences.maxTokens,
      });

      const assistant = await appendMessage(context.db, {
        conversationId: resolvedConversationId,
        role: "assistant",
        content: response.text,
      });

      return {
        text: response.text,
        model: resolved.runtime.displayModel,
        conversationId: resolvedConversationId,
        messageId: assistant.id,
      };
    } catch (error) {
      throw toAIServiceError(error);
    }
  },

  async chatStream(context: AIServiceContext, input: AIChatInput): Promise<AIChatStreamResult> {
    const resolved = await resolveRuntime(context, {
      providerId: input.providerId,
      preferredModel: input.model,
    });

    let conversationId = input.conversationId;
    if (!conversationId) {
      const conversation = await createConversation(context.db, {
        userId: context.userId,
        title: promptToTitle(input.prompt),
        provider: resolved.runtime.providerDriver,
        providerId: resolved.runtime.providerId,
        model: resolved.runtime.displayModel,
      });
      conversationId = conversation.id;
    } else {
      await ensureConversationExists(context, conversationId);
    }

    const resolvedConversationId = assertConversationId(conversationId);

    const userMessage = await appendMessage(context.db, {
      conversationId: resolvedConversationId,
      role: "user",
      content: input.prompt,
      metadata: {
        systemPromptPreset: input.systemPromptPreset ?? null,
        retryFromMessageId: input.messageId ?? null,
      },
    });

    const trace = createStreamTrace({
      route: "ai.chatStream",
      provider: resolved.runtime.providerDriver,
      model: resolved.runtime.displayModel,
      userId: context.userId,
      promptLength: input.prompt.length,
    });
    logStreamStarted(trace);

    let clientDisconnected = false;
    const stream = new ReadableStream<AIChatStreamEvent>({
      start(controller) {
        const safeEnqueue = (event: AIChatStreamEvent) => {
          if (clientDisconnected) return;
          try {
            controller.enqueue(event);
          } catch {
            clientDisconnected = true;
          }
        };

        void (async () => {
          safeEnqueue(statusEvent("queued"));
          safeEnqueue(statusEvent("started"));
          safeEnqueue(
            metaEvent({
              requestId: trace.requestId,
              provider: resolved.runtime.providerDriver,
              model: resolved.runtime.displayModel,
              conversationId: resolvedConversationId,
            }),
          );

          let fullText = "";
          let assistantMessageId: string | undefined;
          let generatedTitle: string | undefined;

          try {
            const result = streamText({
              model: resolved.runtime.model,
              prompt: input.prompt,
              temperature: resolved.preferences.temperature,
              maxOutputTokens: resolved.preferences.maxTokens,
            });

            for await (const chunk of result.textStream) {
              if (!chunk) continue;
              markFirstChunk(trace);
              markChunk(trace, chunk);
              fullText += chunk;
              safeEnqueue(deltaEvent(chunk));
            }

            const usage = (result as any).usage;
            const usagePayload = {
              inputTokens: usage?.inputTokens ?? null,
              outputTokens: usage?.outputTokens ?? null,
              totalTokens: usage?.totalTokens ?? null,
              costUsdCents: null,
            };
            markSuccess(trace, usagePayload);

            const assistantMessage = await appendMessage(context.db, {
              conversationId: resolvedConversationId,
              role: "assistant",
              content: fullText,
              metadata: {
                replyToMessageId: userMessage.id,
              },
              tokens: usagePayload.outputTokens,
            });
            assistantMessageId = assistantMessage.id;

            if (!input.conversationId) {
              generatedTitle = await generateConversationTitle({
                model: resolved.runtime.model,
                userPrompt: input.prompt,
                assistantReply: fullText,
              });
              await updateConversationTitle(context.db, {
                userId: context.userId,
                conversationId: resolvedConversationId,
                title: generatedTitle,
              });
            }

            safeEnqueue(usageEvent(trace.usage));
            safeEnqueue(
              doneEvent(resolved.runtime.displayModel, assistantMessageId, generatedTitle),
            );
            safeEnqueue(statusEvent("completed"));
          } catch (error) {
            const mapped = toAIServiceError(error);
            markError(trace, mapped.code, error);
            safeEnqueue(errorEvent(mapped));
          } finally {
            await persistCallLog(context.db, trace);
            if (!clientDisconnected) {
              try {
                controller.close();
              } catch {
                clientDisconnected = true;
              }
            }
          }
        })();
      },
      cancel() {
        clientDisconnected = true;
      },
    });

    return {
      stream,
      conversationId: resolvedConversationId,
      userMessageId: userMessage.id,
    };
  },
};
