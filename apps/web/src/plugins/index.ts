import { adminConfigPlugin } from "@raypx/admin/plugin/config";
import { adminWebPlugin } from "@raypx/admin/plugin/web";
import {
  type AppWebNavItem,
  type AppWebPlugin,
  composePluginConfig,
  composeWebPlugins,
} from "./compose";

const baseNavItems: AppWebNavItem[] = [
  {
    key: "overview",
    label: "Overview",
    to: "/dashboard",
    icon: "lightning",
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

const webPlugins: AppWebPlugin[] = [
  {
    id: "admin",
    version: "1.0.0",
    web: adminWebPlugin,
    config: adminConfigPlugin,
  },
];

const mergedConfig = composePluginConfig(webPlugins);
const envUsersEnabled = import.meta.env.VITE_FEATURE_ADMIN_USERS;
const adminUsersEnabled =
  envUsersEnabled === undefined
    ? mergedConfig.admin.users.enabled
    : ["1", "true", "on", "yes"].includes(envUsersEnabled.toLowerCase());

const composed = composeWebPlugins(baseNavItems, webPlugins);

export const pluginConfig = {
  admin: {
    users: {
      enabled: adminUsersEnabled,
    },
  },
};

function isAdminRouteEnabled(path: string) {
  if (path === "/admin/users") return adminUsersEnabled;
  return true;
}

export const dashboardNavigation = {
  navItems: composed.navItems.filter((item) => isAdminRouteEnabled(item.to)),
  routes: composed.routes.filter((route) => isAdminRouteEnabled(route.path)),
};

export const adminRouteMap = Object.fromEntries(
  Object.entries(composed.adminRouteMap).filter(([, route]) => isAdminRouteEnabled(route.path)),
);
