import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/chat/")({
  component: ChatIndexRoute,
  head: () => generatePageHead({ ...siteConfig, title: "AI Chat - Raypx App" }),
});

function ChatIndexRoute() {
  return (
    <PagePlaceholder
      description="The previous chat workspace has been stripped back so the dashboard can be redesigned from a clean baseline."
      kicker="Chat"
      primaryAction={{ label: "Open settings", to: "/settings/ai-providers" }}
      title="Chat page is intentionally minimal"
    />
  );
}
