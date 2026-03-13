import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@raypx/auth/tanstack-start";

export const Route = createFileRoute("/")({
  loader: async () => {
    const session = await getSession();
    throw redirect({ to: session?.session ? "/ask" : "/login" });
  },
});
