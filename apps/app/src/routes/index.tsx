import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth-server";

export const Route = createFileRoute("/")({
  loader: async () => {
    const session = await getSession();
    throw redirect({ to: session?.session ? "/chat" : "/login" });
  },
});
