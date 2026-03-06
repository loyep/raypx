import { queryOptions } from "@tanstack/react-query";
import { client } from "@/utils/orpc";

export function conversationsQueryOptions() {
  return queryOptions({
    queryKey: ["ai", "conversations"] as const,
    queryFn: async () => (await client.ai.listConversations({ limit: 20, offset: 0 })).data.items,
  });
}

export type ConversationList = Awaited<
  ReturnType<ReturnType<typeof conversationsQueryOptions>["queryFn"]>
>;
