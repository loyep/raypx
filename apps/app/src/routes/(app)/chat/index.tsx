import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/chat/")({
  loader: async () => {
    throw redirect({ to: "/ask" });
  },
});
