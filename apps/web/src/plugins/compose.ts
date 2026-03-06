export type AdminRoutePrefix = "/admin";
export type AdminRouteSlug = string;

export type AppWebNavItem = {
  key: string;
  label: string;
  to: "/dashboard" | `/admin/${string}`;
  icon: "lightning" | "users" | "person" | "gear";
  adminOnly?: boolean;
  soon?: boolean;
  disabled?: boolean;
};

export type AppWebRoute = {
  key: string;
  slug: AdminRouteSlug;
  path: `/admin/${string}`;
  requiresRole?: "admin" | "superadmin";
};

export type AppWebPlugin = {
  id: string;
  version: string;
  web?: {
    prefix: AdminRoutePrefix;
    navItems: AppWebNavItem[];
    routes: AppWebRoute[];
  };
  config?: {
    defaults: {
      admin: {
        users: {
          enabled: boolean;
        };
      };
    };
  };
};

export function composeWebPlugins(baseNavItems: AppWebNavItem[], plugins: AppWebPlugin[]) {
  const seenPluginIds = new Set<string>();
  const seenNavKeys = new Set(baseNavItems.map((item) => item.key));
  const seenRoutePaths = new Set<string>();
  const seenSlugByPrefix = new Set<string>();

  const navItems = [...baseNavItems];
  const routes: AppWebRoute[] = [];
  const adminRouteMap: Record<string, AppWebRoute> = {};

  for (const plugin of plugins) {
    if (seenPluginIds.has(plugin.id)) {
      throw new Error(`Duplicate web plugin id: "${plugin.id}"`);
    }
    seenPluginIds.add(plugin.id);

    if (!plugin.web) continue;

    if (!plugin.web.prefix.startsWith("/")) {
      throw new Error(`Invalid route prefix: "${plugin.web.prefix}"`);
    }

    for (const navItem of plugin.web.navItems) {
      if (seenNavKeys.has(navItem.key)) {
        throw new Error(`Duplicate nav key: "${navItem.key}"`);
      }
      seenNavKeys.add(navItem.key);
      navItems.push(navItem);
    }

    for (const route of plugin.web.routes) {
      if (seenRoutePaths.has(route.path)) {
        throw new Error(`Duplicate route path: "${route.path}"`);
      }

      const slugKey = `${plugin.web.prefix}:${route.slug}`;
      if (seenSlugByPrefix.has(slugKey)) {
        throw new Error(`Duplicate route slug "${route.slug}" under prefix "${plugin.web.prefix}"`);
      }

      const expectedPath = `${plugin.web.prefix}/${route.slug}`;
      if (route.path !== expectedPath) {
        throw new Error(`Route path "${route.path}" must match "${expectedPath}" (prefix + slug)`);
      }

      seenRoutePaths.add(route.path);
      seenSlugByPrefix.add(slugKey);
      routes.push(route);
      adminRouteMap[route.slug] = route;
    }
  }

  return { navItems, routes, adminRouteMap };
}

export function composePluginConfig(plugins: AppWebPlugin[]) {
  const defaults = {
    admin: {
      users: {
        enabled: true,
      },
    },
  };

  for (const plugin of plugins) {
    if (!plugin.config) continue;
    defaults.admin.users.enabled = plugin.config.defaults.admin.users.enabled;
  }

  return defaults;
}
