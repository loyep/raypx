import { describe, expect, it } from "vitest";
import { adminConfigPlugin } from "../src/plugin/config";
import { adminRpcPlugin } from "../src/plugin/rpc";
import { adminWebPlugin } from "../src/plugin/web";

describe("admin plugins", () => {
  it("exposes required plugin fields", () => {
    expect(adminWebPlugin.prefix).toBe("/admin");
    expect(adminRpcPlugin.namespace).toBe("admin");
    expect(adminWebPlugin.navItems.length).toBeGreaterThan(0);
    expect(adminWebPlugin.routes[0]?.slug).toBe("users");
  });

  it("enables admin users feature by default", () => {
    expect(adminConfigPlugin.defaults.admin.users.enabled).toBe(true);
  });
});
