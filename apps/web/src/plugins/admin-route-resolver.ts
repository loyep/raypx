import type { ComponentType } from "react";
import { AdminAIProvidersPage } from "@/features/admin/pages/ai-providers-page";
import { AdminUsersPage } from "@/features/admin/pages/users-page";
import type { AppWebRoute } from "./compose";
import { adminRouteMap } from "./index";

const adminPageRegistry: Record<string, ComponentType> = {
  "ai-providers": AdminAIProvidersPage,
  users: AdminUsersPage,
};

export function resolveAdminRoute(slug: string): AppWebRoute | null {
  return adminRouteMap[slug] ?? null;
}

export function getAdminPageComponent(slug: string): ComponentType | null {
  return adminPageRegistry[slug] ?? null;
}
