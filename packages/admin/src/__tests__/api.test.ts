import { describe, expect, it, vi } from "vitest";
import { getUserStats, listUsers, updateUser } from "../api";

describe("admin api helpers", () => {
  it("delegates listUsers to client.admin.users.list", async () => {
    const list = vi.fn(async () => ({
      users: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
    }));
    const client = {
      admin: {
        users: {
          list,
          update: vi.fn(),
          stats: vi.fn(),
        },
      },
    };

    await listUsers(client as any, { page: 1 });

    expect(list).toHaveBeenCalledWith({ page: 1 });
  });

  it("delegates updateUser to client.admin.users.update", async () => {
    const update = vi.fn(async () => null);
    const client = {
      admin: {
        users: {
          list: vi.fn(),
          update,
          stats: vi.fn(),
        },
      },
    };

    await updateUser(client as any, { id: "u_1", role: "admin" });

    expect(update).toHaveBeenCalledWith({ id: "u_1", role: "admin" });
  });

  it("delegates getUserStats to client.admin.users.stats", async () => {
    const stats = vi.fn(async () => ({ total: 1, admins: 1, banned: 0, verified: 1 }));
    const client = {
      admin: {
        users: {
          list: vi.fn(),
          update: vi.fn(),
          stats,
        },
      },
    };

    await getUserStats(client as any);

    expect(stats).toHaveBeenCalledTimes(1);
  });
});
