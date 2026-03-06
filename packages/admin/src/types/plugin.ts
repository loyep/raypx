export type AdminPluginId = "admin";

export type AdminRoutePrefix = "/admin";
export type AdminWebRoutePath = `/admin/${string}`;
export type AdminRouteSlug = string;

export type AdminWebNavItem = {
  key: string;
  label: string;
  to: AdminWebRoutePath;
  icon: "users";
  adminOnly?: boolean;
};

export type AdminWebRoute = {
  key: string;
  slug: AdminRouteSlug;
  path: AdminWebRoutePath;
  requiresRole?: "admin" | "superadmin";
};

export type AdminWebPluginContribution = {
  prefix: AdminRoutePrefix;
  navItems: AdminWebNavItem[];
  routes: AdminWebRoute[];
};

export type AdminRpcPluginContribution = {
  namespace: string;
  createRouter: (deps: { requirePermission: (permission: string) => any }) => Record<string, any>;
};

export type AdminConfigPluginContribution = {
  defaults: {
    admin: {
      users: {
        enabled: boolean;
      };
    };
  };
};

export type AdminPluginManifest = {
  id: AdminPluginId;
  version: string;
  rpc?: AdminRpcPluginContribution;
  web?: AdminWebPluginContribution;
  config?: AdminConfigPluginContribution;
};
