import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { siteConfig } from "@/config/site";
import { ChatPage } from "@/features/chat/components/page";

export const Route = createFileRoute("/(app)/chat/$id")({
  component: ChatConversationRoute,
  head: () => generatePageHead({ ...siteConfig, title: "AI Chat - Raypx App" }),
});

function ChatConversationRoute() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();

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

  return (
    <ChatPage onRouteConversationChange={handleRouteConversationChange} routeConversationId={id} />
  );
}
