import { queryOptions } from "@tanstack/react-query";
import { client } from "@/utils/orpc";

export type ConversationList = Awaited<
  ReturnType<typeof client.ai.listConversations>
>["data"]["items"];

export function conversationsQueryOptions() {
  return queryOptions({
    queryKey: ["ai", "conversations"] as const,
    queryFn: async (): Promise<ConversationList> =>
      (await client.ai.listConversations({ limit: 20, offset: 0 })).data.items,
  });
}
