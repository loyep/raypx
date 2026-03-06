import { eventIterator, streamToEventIterator } from "@orpc/server";
import { AIServiceError } from "@raypx/ai/server";
import { AI_EVENT_VERSION, AI_PROVIDER_DRIVERS } from "@raypx/shared/ai";
import { aiFacade } from "../../application/ai/facade";
import {
  aiAppendUserMessageInputSchema,
  aiChatInputSchema,
  aiChatStreamEventSchema,
  aiConversationInputSchema,
  aiCreateProviderInputSchema,
  aiDeleteConversationInputSchema,
  aiDeleteProviderInputSchema,
  aiGetConversationInputSchema,
  aiListConversationsInputSchema,
  aiListProviderAuditLogsInputSchema,
  aiListProvidersInputSchema,
  aiRegenerateMessageInputSchema,
  aiRemoveProviderCredentialInputSchema,
  aiRenameConversationInputSchema,
  aiSetDefaultProviderInputSchema,
  aiUpdatePreferencesInputSchema,
  aiUpdateProviderInputSchema,
  aiUpsertProviderCredentialInputSchema,
} from "../../contracts/ai";
import { ok } from "../../contracts/response";
import { adminProcedure, protectedProcedure } from "../../transport/middleware";

export const aiRouter = {
  capabilities: protectedProcedure.handler(async () => {
    return ok({
      eventVersion: AI_EVENT_VERSION,
      providerDrivers: AI_PROVIDER_DRIVERS,
      providers: [],
      features: {
        chat: true,
        stream: true,
        conversations: true,
        regenerate: true,
        dynamicProviders: true,
        tasks: false,
        tools: false,
        memory: false,
      },
    });
  }),

  preferences: {
    get: protectedProcedure.handler(async ({ context }) => {
      return aiFacade.withAIErrorHandling(async () => {
        const preferences = await aiFacade.chatService.getUserChatPreferences(
          aiFacade.createServiceContext(context),
        );
        return ok(preferences);
      });
    }),
    update: protectedProcedure
      .input(aiUpdatePreferencesInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const preferences = await aiFacade.chatService.updateUserChatPreferences(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(preferences);
        });
      }),
  },

  providers: {
    list: protectedProcedure.input(aiListProvidersInputSchema).handler(async ({ context }) => {
      return aiFacade.withAIErrorHandling(async () => {
        const providers = await aiFacade.chatService.listUserProviders(
          aiFacade.createServiceContext(context),
        );
        return ok({ providers });
      });
    }),

    create: protectedProcedure
      .input(aiCreateProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const preferences = await aiFacade.chatService.createUserProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(preferences);
        });
      }),

    update: protectedProcedure
      .input(aiUpdateProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const preferences = await aiFacade.chatService.updateUserProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(preferences);
        });
      }),

    delete: protectedProcedure
      .input(aiDeleteProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const preferences = await aiFacade.chatService.deleteUserProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(preferences);
        });
      }),

    setDefault: protectedProcedure
      .input(aiSetDefaultProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const preferences = await aiFacade.chatService.setDefaultProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(preferences);
        });
      }),

    setSecret: protectedProcedure
      .input(aiUpsertProviderCredentialInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const preferences = await aiFacade.chatService.setUserProviderSecret(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(preferences);
        });
      }),

    removeSecret: protectedProcedure
      .input(aiRemoveProviderCredentialInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const preferences = await aiFacade.chatService.removeUserProviderSecret(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(preferences);
        });
      }),
  },

  providerAuditLogs: {
    list: protectedProcedure
      .input(aiListProviderAuditLogsInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const data = await aiFacade.chatService.listUserProviderAuditLogs(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(data);
        });
      }),
  },

  systemProviders: {
    list: adminProcedure.input(aiListProvidersInputSchema).handler(async ({ context }) => {
      return aiFacade.withAIErrorHandling(async () => {
        const providers = await aiFacade.chatService.listSystemProviders(
          aiFacade.createServiceContext(context),
        );
        return ok({ providers });
      });
    }),

    create: adminProcedure
      .input(aiCreateProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const providers = await aiFacade.chatService.createSystemProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ providers });
        });
      }),

    update: adminProcedure
      .input(aiUpdateProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const providers = await aiFacade.chatService.updateSystemProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ providers });
        });
      }),

    delete: adminProcedure
      .input(aiDeleteProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const providers = await aiFacade.chatService.deleteSystemProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ providers });
        });
      }),

    setDefault: adminProcedure
      .input(aiSetDefaultProviderInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const providers = await aiFacade.chatService.setDefaultSystemProvider(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ providers });
        });
      }),

    setSecret: adminProcedure
      .input(aiUpsertProviderCredentialInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const providers = await aiFacade.chatService.setSystemProviderSecret(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ providers });
        });
      }),

    removeSecret: adminProcedure
      .input(aiRemoveProviderCredentialInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const providers = await aiFacade.chatService.removeSystemProviderSecret(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ providers });
        });
      }),
  },

  conversations: {
    create: protectedProcedure
      .input(aiConversationInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const conversation = await aiFacade.chatService.createConversation(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ conversation });
        });
      }),

    list: protectedProcedure
      .input(aiListConversationsInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const items = await aiFacade.chatService.listConversations(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ items });
        });
      }),

    get: protectedProcedure
      .input(aiGetConversationInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const result = await aiFacade.chatService.getConversation(
            aiFacade.createServiceContext(context),
            input.conversationId,
          );
          if (!result) {
            throw new AIServiceError("AI_BAD_REQUEST", "Conversation not found");
          }
          return ok(result);
        });
      }),

    appendUserMessage: protectedProcedure
      .input(aiAppendUserMessageInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const message = await aiFacade.chatService.appendUserMessage(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ message });
        });
      }),

    delete: protectedProcedure
      .input(aiDeleteConversationInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const removed = await aiFacade.chatService.deleteConversation(
            aiFacade.createServiceContext(context),
            input.conversationId,
          );
          return ok({ deleted: Boolean(removed) });
        });
      }),

    rename: protectedProcedure
      .input(aiRenameConversationInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const conversation = await aiFacade.chatService.renameConversation(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok({ conversation });
        });
      }),
  },

  chat: {
    complete: protectedProcedure.input(aiChatInputSchema).handler(async ({ context, input }) => {
      return aiFacade.withAIErrorHandling(async () => {
        const result = await aiFacade.chatService.chat(
          aiFacade.createServiceContext(context),
          input,
        );
        return ok(result);
      });
    }),

    stream: protectedProcedure
      .input(aiChatInputSchema)
      .output(eventIterator(aiChatStreamEventSchema))
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const { stream } = await aiFacade.chatService.chatStream(
            aiFacade.createServiceContext(context),
            input,
          );
          return streamToEventIterator(stream);
        });
      }),

    regenerate: protectedProcedure
      .input(aiRegenerateMessageInputSchema)
      .handler(async ({ context, input }) => {
        return aiFacade.withAIErrorHandling(async () => {
          const result = await aiFacade.chatService.regenerateMessage(
            aiFacade.createServiceContext(context),
            input,
          );
          return ok(result);
        });
      }),
  },
};

// Legacy aliases for existing callers while keeping the new module grouping.
(aiRouter as any).getPreferences = aiRouter.preferences.get;
(aiRouter as any).updatePreferences = aiRouter.preferences.update;
(aiRouter as any).listProviderAuditLogs = aiRouter.providerAuditLogs.list;
(aiRouter as any).system = { providers: aiRouter.systemProviders };
(aiRouter as any).createConversation = aiRouter.conversations.create;
(aiRouter as any).listConversations = aiRouter.conversations.list;
(aiRouter as any).getConversation = aiRouter.conversations.get;
(aiRouter as any).appendUserMessage = aiRouter.conversations.appendUserMessage;
(aiRouter as any).deleteConversation = aiRouter.conversations.delete;
(aiRouter as any).renameConversation = aiRouter.conversations.rename;
(aiRouter as any).chatStream = aiRouter.chat.stream;
(aiRouter as any).regenerateMessage = aiRouter.chat.regenerate;
