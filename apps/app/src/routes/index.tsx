import { getSession } from "@raypx/auth/tanstack-start";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    const session = await getSession();
    throw redirect({ to: session?.session ? "/ask" : "/login" });
  },
});
