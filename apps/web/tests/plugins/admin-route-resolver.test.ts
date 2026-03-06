import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/features/admin/pages/users-page", () => ({
  AdminUsersPage: () => null,
}));

import { getAdminPageComponent, resolveAdminRoute } from "../../src/plugins/admin-route-resolver";

describe("admin route resolver", () => {
  it("resolves users slug", () => {
    const route = resolveAdminRoute("users");

    expect(route).not.toBeNull();
    expect(route?.path).toBe("/admin/users");
    expect(typeof getAdminPageComponent("users")).toBe("function");
  });

  it("returns null for unknown slug", () => {
    expect(resolveAdminRoute("unknown")).toBeNull();
    expect(getAdminPageComponent("unknown")).toBeNull();
  });
});
