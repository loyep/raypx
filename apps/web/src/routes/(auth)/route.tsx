import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RouteLoading } from "@/components/route-loading";

export const Route = createFileRoute("/(auth)")({
  component: Outlet,
  pendingComponent: RouteLoading,
  pendingMs: 0,
});
