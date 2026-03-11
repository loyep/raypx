import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/chat/$id")({
  component: ChatConversationRoute,
  head: () => generatePageHead({ ...siteConfig, title: "AI Chat - Raypx App" }),
});

function ChatConversationRoute() {
  const { id } = Route.useParams();

  return (
    <PagePlaceholder
      description={`Conversation ${id} is hidden while the dashboard UI is being rebuilt. Keep the route for future restoration.`}
      kicker="Conversation"
      primaryAction={{ label: "Back to chat", to: "/chat" }}
      title="Conversation view removed"
    />
  );
}
