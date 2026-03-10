import { toast } from "@raypx/design-system/components/ui/toast";
import { generatePageHead } from "@raypx/seo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import { useCallback } from "react";
import { siteConfig } from "@/config/site";
import { HistoryPanel } from "@/features/chat/components/history";
import { type ConversationList, conversationsQueryOptions } from "@/features/chat/queries";
import { client } from "@/utils/orpc";

function isAuthenticationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const maybeError = error as { message?: unknown; code?: unknown; cause?: unknown };
  const message = typeof maybeError.message === "string" ? maybeError.message : "";
  if (message.includes("Authentication required")) return true;

  const code = typeof maybeError.code === "string" ? maybeError.code : "";
  if (code === "UNAUTHORIZED") return true;

  if (typeof maybeError.cause === "object" && maybeError.cause !== null) {
    const cause = maybeError.cause as { message?: unknown; code?: unknown };
    const causeMessage = typeof cause.message === "string" ? cause.message : "";
    const causeCode = typeof cause.code === "string" ? cause.code : "";
    return causeMessage.includes("Authentication required") || causeCode === "UNAUTHORIZED";
  }

  return false;
}

export const Route = createFileRoute("/(app)/chat")({
  component: ChatRouteLayout,
  head: () => generatePageHead({ ...siteConfig, title: "AI Chat - Raypx App" }),
  loader: async ({ context }) => {
    let conversations: ConversationList;
    try {
      conversations = await context.queryClient.ensureQueryData(conversationsQueryOptions());
    } catch (error) {
      if (!isAuthenticationError(error)) {
        throw error;
      }
      conversations = [];
    }
    return { conversations };
  },
});

function ChatRouteLayout() {
  const { conversations: initialConversations } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const conversationsQuery = useQuery({
    ...conversationsQueryOptions(),
    initialData: initialConversations,
    refetchOnWindowFocus: false,
  });
  const chatParams = useParams({ from: "/(app)/chat/$id", shouldThrow: false });
  const navigate = Route.useNavigate();
  const activeConversationId = typeof chatParams?.id === "string" ? chatParams.id : null;

  const handleRouteConversationChange = useCallback(
    (conversationId: string | null) => {
      if (conversationId) {
        void navigate({
          replace: true,
          to: "/chat/$id",
          params: { id: conversationId },
        });
        return;
      }

      void navigate({
        replace: true,
        to: "/chat",
      });
    },
    [navigate],
  );

  const conversations = conversationsQuery.data ?? [];
  const queryKey = ["ai", "conversations"] as const;

  const renameConversationMutation = useMutation({
    mutationFn: async ({ conversationId, title }: { conversationId: string; title: string }) =>
      client.ai.renameConversation({
        conversationId,
        title,
      }),
    onMutate: async ({ conversationId, title }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ConversationList>(queryKey);
      queryClient.setQueryData<ConversationList>(queryKey, (current?: ConversationList) => {
        if (!current) return current;
        return current.map((item: ConversationList[number]) =>
          item.id === conversationId ? { ...item, title } : item,
        );
      });
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error.message || "Failed to rename conversation");
    },
    onSuccess: async () => {
      toast.success("Conversation renamed");
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => client.ai.deleteConversation({ conversationId }),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ConversationList>(queryKey);
      queryClient.setQueryData<ConversationList>(queryKey, (current?: ConversationList) => {
        if (!current) return current;
        return current.filter((item: ConversationList[number]) => item.id !== conversationId);
      });
      return { previous };
    },
    onError: (error, _conversationId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(error.message || "Failed to delete conversation");
    },
    onSuccess: async (_result, conversationId) => {
      toast.success("Conversation deleted");
      if (activeConversationId === conversationId) {
        handleRouteConversationChange(null);
      }
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const busyConversationId = renameConversationMutation.isPending
    ? (renameConversationMutation.variables?.conversationId ?? null)
    : deleteConversationMutation.isPending
      ? (deleteConversationMutation.variables ?? null)
      : null;

  return (
    <div className="mx-auto grid max-w-6xl items-start gap-6 md:grid-cols-[300px_minmax(0,1fr)]">
      <HistoryPanel
        activeConversationId={activeConversationId}
        busyConversationId={busyConversationId}
        conversations={conversations}
        isLoading={conversationsQuery.isFetching}
        onDeleteConversation={(conversationId) => {
          if (deleteConversationMutation.isPending || renameConversationMutation.isPending) return;
          deleteConversationMutation.mutate(conversationId);
        }}
        onRenameConversation={(conversationId, title) => {
          if (deleteConversationMutation.isPending || renameConversationMutation.isPending) return;
          renameConversationMutation.mutate({
            conversationId,
            title,
          });
        }}
        onSelectConversation={(conversationId) => {
          handleRouteConversationChange(conversationId);
        }}
        onStartNewConversation={() => {
          handleRouteConversationChange(null);
        }}
      />
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
