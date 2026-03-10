import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/settings/")({
  loader: async () => {
    throw redirect({ to: "/settings/ai-providers" });
  },
});
