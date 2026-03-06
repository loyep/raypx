import type { AdminWebPluginContribution } from "../types";

export const adminWebPlugin: AdminWebPluginContribution = {
  prefix: "/admin",
  navItems: [
    {
      key: "admin-user-management",
      label: "User Management",
      to: "/admin/users",
      icon: "users",
      adminOnly: true,
    },
    {
      key: "admin-ai-providers",
      label: "AI Providers",
      to: "/admin/ai-providers",
      icon: "users",
      adminOnly: true,
    },
  ],
  routes: [
    {
      key: "admin-users",
      slug: "users",
      path: "/admin/users",
      requiresRole: "admin",
    },
    {
      key: "admin-ai-providers",
      slug: "ai-providers",
      path: "/admin/ai-providers",
      requiresRole: "admin",
    },
  ],
};
