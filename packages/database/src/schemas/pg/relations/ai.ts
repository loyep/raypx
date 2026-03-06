import { defineRelations } from "drizzle-orm";
import {
  aiAnalyses,
  aiCallLogs,
  aiConversations,
  aiGenerations,
  aiMessages,
  aiProviderKeys,
  aiProviders,
  aiRuntimePolicies,
} from "../ai";
import { user } from "../auth";

export const aiRelations = defineRelations(
  {
    user,
    aiConversations,
    aiMessages,
    aiProviders,
    aiProviderKeys,
    aiGenerations,
    aiAnalyses,
    aiCallLogs,
    aiRuntimePolicies,
  },
  (r) => ({
    aiConversations: {
      user: r.one.user({
        from: r.aiConversations.userId,
        to: r.user.id,
      }),
      providerRef: r.one.aiProviders({
        from: r.aiConversations.providerId,
        to: r.aiProviders.id,
      }),
      messages: r.many.aiMessages({
        from: r.aiConversations.id,
        to: r.aiMessages.conversationId,
      }),
    },
    aiMessages: {
      conversation: r.one.aiConversations({
        from: r.aiMessages.conversationId,
        to: r.aiConversations.id,
      }),
    },
    aiProviders: {
      user: r.one.user({
        from: r.aiProviders.userId,
        to: r.user.id,
      }),
      conversations: r.many.aiConversations({
        from: r.aiProviders.id,
        to: r.aiConversations.providerId,
      }),
      keys: r.many.aiProviderKeys({
        from: r.aiProviders.id,
        to: r.aiProviderKeys.providerId,
      }),
    },
    aiProviderKeys: {
      provider: r.one.aiProviders({
        from: r.aiProviderKeys.providerId,
        to: r.aiProviders.id,
      }),
    },
    aiGenerations: {
      user: r.one.user({
        from: r.aiGenerations.userId,
        to: r.user.id,
      }),
    },
    aiAnalyses: {
      user: r.one.user({
        from: r.aiAnalyses.userId,
        to: r.user.id,
      }),
    },
    aiCallLogs: {
      user: r.one.user({
        from: r.aiCallLogs.userId,
        to: r.user.id,
      }),
    },
    aiRuntimePolicies: {
      user: r.one.user({
        from: r.aiRuntimePolicies.userId,
        to: r.user.id,
      }),
    },
  }),
);
