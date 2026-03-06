import type { AdminUserRole } from "../types";

export type DashboardNavigationItem = {
  key: string;
  label: string;
  to: "/dashboard" | "/chat" | `/admin/${string}`;
  icon: "lightning" | "chat" | "users" | "person" | "gear";
  soon?: boolean;
  disabled?: boolean;
};

export function getDashboardNavigationItems(
  role: AdminUserRole | string | null | undefined,
): DashboardNavigationItem[] {
  const items: DashboardNavigationItem[] = [
    {
      key: "overview",
      label: "Overview",
      to: "/dashboard",
      icon: "lightning",
    },
    {
      key: "chat",
      label: "Chat",
      to: "/chat",
      icon: "chat",
    },
    {
      key: "projects",
      label: "Projects",
      to: "/dashboard",
      icon: "person",
      soon: true,
      disabled: true,
    },
    {
      key: "settings",
      label: "Settings",
      to: "/dashboard",
      icon: "gear",
      soon: true,
      disabled: true,
    },
  ];

  if (role === "admin" || role === "superadmin") {
    items.push({
      key: "admin-user-management",
      label: "User Management",
      to: "/admin/users",
      icon: "users",
    });
    items.push({
      key: "admin-ai-providers",
      label: "AI Providers",
      to: "/admin/ai-providers",
      icon: "users",
    });
  }

  return items;
}
