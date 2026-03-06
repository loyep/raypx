import { describe, expect, it } from "vitest";
import {
  type AppWebNavItem,
  type AppWebPlugin,
  composeWebPlugins,
} from "../../src/plugins/compose";

const baseNavItems: AppWebNavItem[] = [
  { key: "overview", label: "Overview", to: "/dashboard", icon: "lightning" },
];

describe("composeWebPlugins", () => {
  it("throws for duplicate plugin id", () => {
    const plugins: AppWebPlugin[] = [
      {
        id: "admin",
        version: "1.0.0",
        web: {
          prefix: "/admin",
          navItems: [{ key: "admin-users", label: "Users", to: "/admin/users", icon: "users" }],
          routes: [{ key: "admin-users", slug: "users", path: "/admin/users" }],
        },
      },
      {
        id: "admin",
        version: "1.0.1",
        web: {
          prefix: "/admin",
          navItems: [{ key: "admin-users-2", label: "Users2", to: "/admin/users2", icon: "users" }],
          routes: [{ key: "admin-users-2", slug: "users2", path: "/admin/users2" }],
        },
      },
    ];

    expect(() => composeWebPlugins(baseNavItems, plugins)).toThrow(
      'Duplicate web plugin id: "admin"',
    );
  });

  it("throws for duplicate route path", () => {
    const plugins: AppWebPlugin[] = [
      {
        id: "admin-a",
        version: "1.0.0",
        web: {
          prefix: "/admin",
          navItems: [{ key: "admin-users", label: "Users", to: "/admin/users", icon: "users" }],
          routes: [{ key: "admin-users", slug: "users", path: "/admin/users" }],
        },
      },
      {
        id: "admin-b",
        version: "1.0.0",
        web: {
          prefix: "/admin",
          navItems: [{ key: "admin-users-b", label: "UsersB", to: "/admin/users", icon: "users" }],
          routes: [{ key: "admin-users-b", slug: "users-b", path: "/admin/users" }],
        },
      },
    ];

    expect(() => composeWebPlugins(baseNavItems, plugins)).toThrow(
      'Duplicate route path: "/admin/users"',
    );
  });

  it("throws for duplicate slug under same prefix", () => {
    const plugins: AppWebPlugin[] = [
      {
        id: "admin-a",
        version: "1.0.0",
        web: {
          prefix: "/admin",
          navItems: [{ key: "admin-users", label: "Users", to: "/admin/users", icon: "users" }],
          routes: [{ key: "admin-users", slug: "users", path: "/admin/users" }],
        },
      },
      {
        id: "admin-b",
        version: "1.0.0",
        web: {
          prefix: "/admin",
          navItems: [
            {
              key: "admin-users-duplicate",
              label: "Users Duplicate",
              to: "/admin/users-v2",
              icon: "users",
            },
          ],
          routes: [{ key: "admin-users-duplicate", slug: "users", path: "/admin/users-v2" }],
        },
      },
    ];

    expect(() => composeWebPlugins(baseNavItems, plugins)).toThrow(
      'Duplicate route slug "users" under prefix "/admin"',
    );
  });

  it("throws when route path does not match prefix + slug", () => {
    const plugins: AppWebPlugin[] = [
      {
        id: "admin",
        version: "1.0.0",
        web: {
          prefix: "/admin",
          navItems: [{ key: "admin-users", label: "Users", to: "/admin/users", icon: "users" }],
          routes: [{ key: "admin-users", slug: "users", path: "/admin/not-users" }],
        },
      },
    ];

    expect(() => composeWebPlugins(baseNavItems, plugins)).toThrow(
      'Route path "/admin/not-users" must match "/admin/users" (prefix + slug)',
    );
  });
});
