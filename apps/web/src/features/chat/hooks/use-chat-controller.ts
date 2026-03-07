import { useChatStream } from "@raypx/tanstack";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ConversationList, conversationsQueryOptions } from "@/features/chat/queries";
import { useChatSessionStore } from "@/features/chat/store/chat-session-store";
import { client } from "@/utils/orpc";

type UseChatControllerParams = {
  routeConversationId: string | null;
  onRouteConversationChange: (conversationId: string | null) => void;
};

type ConversationMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type ConversationCache = {
  conversation: {
    id: string;
    title: string;
    updatedAt?: string | Date;
  };
  messages: ConversationMessage[];
};

function isUuid(input: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
}

function mergeConversationCache(
  existing: ConversationCache | undefined,
  incoming: ConversationCache,
): ConversationCache {
  if (!existing) return incoming;

  const mergedMessages = [...existing.messages];
  for (const message of incoming.messages) {
    const index = mergedMessages.findIndex((item) => item.id === message.id);
    if (index >= 0) {
      mergedMessages[index] = message;
      continue;
    }
    mergedMessages.push(message);
  }

  return {
    conversation: {
      ...existing.conversation,
      ...incoming.conversation,
    },
    messages: mergedMessages,
  };
}

export function useChatController({
  routeConversationId,
  onRouteConversationChange,
}: UseChatControllerParams) {
  const [providerId, setProviderId] = useState<string>("default");
  const [optimisticConversationKeyId, setOptimisticConversationKeyId] = useState<string | null>(
    null,
  );
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();
  const prompt = useChatSessionStore((state) => state.prompt);
  const persistedIsLoading = useChatSessionStore((state) => state.isLoading);
  const pendingStream = useChatSessionStore((state) => state.pendingStream);
  const setPrompt = useChatSessionStore((state) => state.setPrompt);
  const setPersistedIsLoading = useChatSessionStore((state) => state.setIsLoading);
  const setPendingStream = useChatSessionStore((state) => state.setPendingStream);
  const setActiveConversationId = useChatSessionStore((state) => state.setActiveConversationId);

  const preferencesQuery = useQuery({
    queryKey: ["ai", "preferences"],
    queryFn: async () => (await client.ai.getPreferences()).data,
    refetchOnWindowFocus: false,
  });
  const conversationsQuery = useQuery({
    ...conversationsQueryOptions(),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: streamIsLoading,
    error,
    timing,
    conversationId,
    conversationTitle,
    resetChat,
    sendPrompt: sendChatPrompt,
    clearError,
  } = useChatStream(
    (input) =>
      client.ai.chatStream({
        prompt: input.prompt,
        providerId: input.providerId,
        conversationId: input.conversationId,
      }) as Promise<any>,
    {
      onEvent: (event) => {
        const pending = useChatSessionStore.getState().pendingStream;
        if (!pending) return;

        if (event.type === "meta" && event.conversationId) {
          const fromKey = pending.conversationCacheId;
          const toKey = event.conversationId;

          if (fromKey !== toKey) {
            const fromCache = queryClient.getQueryData<ConversationCache>([
              "ai",
              "conversation",
              fromKey,
            ]);
            if (fromCache) {
              queryClient.setQueryData<ConversationCache>(
                ["ai", "conversation", toKey],
                (existing) =>
                  mergeConversationCache(existing, {
                    ...fromCache,
                    conversation: { ...fromCache.conversation, id: toKey },
                  }),
              );
              queryClient.removeQueries({
                queryKey: ["ai", "conversation", fromKey],
                exact: true,
              });
            }
            setPendingStream({ ...pending, conversationCacheId: toKey });
            setOptimisticConversationKeyId(null);
          }
          void queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
          return;
        }

        if (event.type === "delta") {
          queryClient.setQueryData<ConversationCache>(
            ["ai", "conversation", pending.conversationCacheId],
            (current) => {
              if (!current) return current;
              let matched = false;
              const messages = current.messages.map((item) => {
                if (item.id !== pending.assistantMessageId) return item;
                matched = true;
                return { ...item, content: item.content + event.text };
              });
              if (!matched) {
                messages.push({
                  id: pending.assistantMessageId,
                  role: "assistant",
                  content: event.text,
                });
              }
              return { ...current, messages };
            },
          );
          return;
        }

        if (event.type === "done") {
          queryClient.setQueryData<ConversationCache>(
            ["ai", "conversation", pending.conversationCacheId],
            (current) => {
              if (!current || !event.messageId) return current;
              const messages = current.messages.map((item) =>
                item.id === pending.assistantMessageId ? { ...item, id: event.messageId } : item,
              );
              return { ...current, messages };
            },
          );
        }
      },
      onError: () => {
        const pending = useChatSessionStore.getState().pendingStream;
        if (!pending) return;

        queryClient.setQueryData<ConversationCache>(
          ["ai", "conversation", pending.conversationCacheId],
          (current) => {
            if (!current) return current;
            return {
              ...current,
              messages: current.messages.filter((item) => item.id !== pending.assistantMessageId),
            };
          },
        );
      },
    },
  );
  const isLoading = streamIsLoading || persistedIsLoading;

  useEffect(() => {
    setActiveConversationId(routeConversationId);
  }, [routeConversationId, setActiveConversationId]);

  useEffect(() => {
    setOptimisticConversationKeyId((current) => {
      if (!routeConversationId) return current;
      return null;
    });
  }, [routeConversationId]);

  useEffect(() => {
    if (!conversationId) return;
    if (!routeConversationId) {
      onRouteConversationChange(conversationId);
    }
  }, [conversationId, onRouteConversationChange, routeConversationId]);

  useEffect(() => {
    if (!routeConversationId || !isUuid(routeConversationId)) return;
    void queryClient.invalidateQueries({
      queryKey: ["ai", "conversation", routeConversationId],
      exact: true,
    });
    void queryClient.refetchQueries({
      queryKey: ["ai", "conversation", routeConversationId],
      exact: true,
      type: "active",
    });
  }, [queryClient, routeConversationId]);

  useEffect(() => {
    if (!conversationId || !conversationTitle) return;
    queryClient.setQueryData<ConversationList>(["ai", "conversations"], (current) => {
      if (!current) return current;
      return current.map((item) =>
        item.id === conversationId ? { ...item, title: conversationTitle } : item,
      );
    });
  }, [conversationId, conversationTitle, queryClient]);

  const activeConversationCacheId =
    routeConversationId ?? optimisticConversationKeyId ?? conversationId;
  const shouldFetchConversation = Boolean(routeConversationId && isUuid(routeConversationId));
  const conversationQuery = useQuery({
    enabled: shouldFetchConversation,
    queryKey: ["ai", "conversation", routeConversationId ?? "draft"],
    queryFn: async () => {
      if (!routeConversationId || !isUuid(routeConversationId)) return null;
      return (await client.ai.getConversation({ conversationId: routeConversationId })).data;
    },
    placeholderData: (previous) => {
      if (previous) return previous;
      if (!activeConversationCacheId) return null;
      return (
        queryClient.getQueryData<ConversationCache>([
          "ai",
          "conversation",
          activeConversationCacheId,
        ]) ?? null
      );
    },
    refetchOnWindowFocus: false,
  });

  const messages = useMemo(() => {
    const fallbackSource = activeConversationCacheId
      ? queryClient.getQueryData<ConversationCache>([
          "ai",
          "conversation",
          activeConversationCacheId,
        ])?.messages
      : [];
    const source = conversationQuery.data?.messages ?? fallbackSource ?? [];
    const normalized = source
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map((message) => ({
        id: message.id,
        role: message.role as "user" | "assistant",
        text: message.content,
      }));

    if (
      isLoading &&
      pendingStream &&
      activeConversationCacheId &&
      pendingStream.conversationCacheId === activeConversationCacheId &&
      !normalized.some((message) => message.id === pendingStream.assistantMessageId)
    ) {
      return [
        ...normalized,
        {
          id: pendingStream.assistantMessageId,
          role: "assistant" as const,
          text: "",
        },
      ];
    }

    return normalized;
  }, [
    activeConversationCacheId,
    conversationQuery.data?.messages,
    isLoading,
    pendingStream,
    queryClient,
  ]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages.length, routeConversationId]);

  const providers = preferencesQuery.data?.providers ?? [];
  const enabledProviders = useMemo(
    () => providers.filter((provider) => provider.isEnabled),
    [providers],
  );
  const hasEnabledProviders = enabledProviders.length > 0;
  const conversations = conversationsQuery.data ?? [];

  const activeTitle = useMemo(() => {
    if (!routeConversationId) return "New conversation";
    return conversations.find((item) => item.id === routeConversationId)?.title ?? "Conversation";
  }, [conversations, routeConversationId]);

  const canSend = useMemo(() => {
    if (!hasEnabledProviders) return false;

    if (providerId === "default") {
      const defaultProviderId = preferencesQuery.data?.defaultProviderId;
      if (!defaultProviderId) return false;
      return Boolean(
        providers.find((provider) => provider.id === defaultProviderId && provider.isEnabled),
      );
    }

    return Boolean(providers.find((provider) => provider.id === providerId && provider.isEnabled));
  }, [hasEnabledProviders, preferencesQuery.data?.defaultProviderId, providerId, providers]);

  useEffect(() => {
    if (providers.length === 0) return;

    setProviderId((currentProviderId) => {
      if (currentProviderId !== "default") {
        const currentProvider = providers.find((provider) => provider.id === currentProviderId);
        if (currentProvider?.isEnabled) return currentProviderId;
      }

      const defaultProviderId = preferencesQuery.data?.defaultProviderId;
      if (defaultProviderId) {
        const defaultProvider = providers.find(
          (provider) => provider.id === defaultProviderId && provider.isEnabled,
        );
        if (defaultProvider) return defaultProvider.id;
      }

      const firstEnabledProvider = enabledProviders[0];
      if (firstEnabledProvider) return firstEnabledProvider.id;
      return "default";
    });
  }, [enabledProviders, preferencesQuery.data?.defaultProviderId, providers]);

  const sendPrompt = useCallback(async () => {
    const input = prompt.trim();
    if (!input || isLoading) return;

    const effectiveProviderId =
      providerId === "default" ? preferencesQuery.data?.defaultProviderId : providerId;
    if (!effectiveProviderId) return;

    const baseConversationId = routeConversationId ?? conversationId ?? null;
    const conversationCacheId = baseConversationId ?? `draft-${crypto.randomUUID()}`;
    if (!baseConversationId) {
      setOptimisticConversationKeyId(conversationCacheId);
    }

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    const fallbackTitle = activeTitle === "New conversation" ? "New conversation" : activeTitle;

    queryClient.setQueryData<ConversationCache>(
      ["ai", "conversation", conversationCacheId],
      (current) => {
        const next: ConversationCache = current ?? {
          conversation: {
            id: conversationCacheId,
            title: fallbackTitle,
          },
          messages: [],
        };

        return {
          ...next,
          messages: [
            ...next.messages,
            { id: userMessageId, role: "user", content: input },
            { id: assistantMessageId, role: "assistant", content: "" },
          ],
        };
      },
    );

    setPendingStream({
      conversationCacheId,
      assistantMessageId,
    });

    setPrompt("");
    clearError();
    setPersistedIsLoading(true);

    try {
      await sendChatPrompt({
        prompt: input,
        providerId: effectiveProviderId,
        conversationId: baseConversationId ?? undefined,
      });
    } finally {
      setPersistedIsLoading(false);
    }

    const finalConversationId = useChatSessionStore.getState().pendingStream?.conversationCacheId;
    setPendingStream(null);
    if (finalConversationId && isUuid(finalConversationId)) {
      await queryClient.invalidateQueries({
        queryKey: ["ai", "conversation", finalConversationId],
      });
    } else {
      await queryClient.invalidateQueries({ queryKey: ["ai", "conversation"] });
    }
    await queryClient.invalidateQueries({ queryKey: ["ai", "conversations"] });
    await queryClient.refetchQueries({ queryKey: ["ai", "conversations"], type: "active" });
  }, [
    activeTitle,
    clearError,
    conversationId,
    isLoading,
    preferencesQuery.data?.defaultProviderId,
    prompt,
    providerId,
    queryClient,
    routeConversationId,
    sendChatPrompt,
    setPendingStream,
    setPersistedIsLoading,
  ]);

  const startNewConversation = useCallback(() => {
    setPendingStream(null);
    setPersistedIsLoading(false);
    setOptimisticConversationKeyId(null);
    resetChat();
    setPrompt("");
    clearError();
    onRouteConversationChange(null);
  }, [
    clearError,
    onRouteConversationChange,
    resetChat,
    setPendingStream,
    setPersistedIsLoading,
    setPrompt,
  ]);

  return {
    activeTitle,
    canSend,
    conversationIsFetching: conversationQuery.isFetching,
    error,
    hasEnabledProviders,
    isLoading,
    messages,
    messagesContainerRef,
    onPromptChange: setPrompt,
    onProviderChange: setProviderId,
    onSendPrompt: sendPrompt,
    prompt,
    providerId,
    providers: enabledProviders,
    startNewConversation,
    timing,
  };
}
