import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/settings/ai-provider")({
  component: LegacyAIProviderRoute,
});

function LegacyAIProviderRoute() {
  return <Navigate replace to="/settings/ai-providers" />;
}
