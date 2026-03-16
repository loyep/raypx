import { getSession } from "@raypx/auth/tanstack-start";
import { RouteLoading } from "@raypx/design-system/components/route-loading";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
  component: Outlet,
  loader: async () => {
    const session = await getSession();
    if (session?.session) {
      throw redirect({ to: "/dashboard" });
    }
    return {};
  },
  pendingComponent: RouteLoading,
  pendingMs: 0,
});
