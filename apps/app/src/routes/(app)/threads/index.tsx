import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyStateCard, WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/threads/")({
  component: ThreadsPage,
  head: () => generatePageHead({ ...siteConfig, title: "Threads - Raypx App" }),
});

function ThreadsPage() {
  const threadsQuery = useQuery({
    queryKey: ["ai", "threads"],
    queryFn: async () => (await client.ai.conversations.list({ limit: 20, offset: 0 })).data,
  });

  const conversations = threadsQuery.data?.conversations ?? [];

  return (
    <WorkspacePage
      description="Threads keeps conversation history distinct from Spaces, so a thread can later be attached to a project without baking project semantics into chat tables."
      kicker="Workspace"
      title="Threads"
    >
      {conversations.length === 0 ? (
        <EmptyStateCard
          description="Start your first thread from Ask and it will appear here."
          title="No threads yet"
        />
      ) : (
        <div className="grid gap-4">
          {conversations.map(
            (conversation: { id: string; title: string; provider: string; model: string }) => (
              <Card key={conversation.id}>
                <CardHeader>
                  <CardTitle className="text-base">{conversation.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {conversation.provider} · {conversation.model}
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </WorkspacePage>
  );
}
