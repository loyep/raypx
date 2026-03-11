import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/page-placeholder";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/settings/ai-providers")({
  component: AIProviderSettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "AI Provider Settings - Raypx App" }),
});

function AIProviderSettingsPage() {
  return (
    <PagePlaceholder
      description="Provider management has been cleared out with the rest of the dashboard UI. Keep this route as a stable anchor for the redesign."
      kicker="Settings"
      primaryAction={{ label: "Back to chat", to: "/chat" }}
      title="AI provider settings are temporarily hidden"
    />
  );
}
