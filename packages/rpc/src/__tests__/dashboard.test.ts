import { call } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Context } from "../context";
import { dashboardRouter } from "../routers/dashboard";

// Mock the database module
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();

vi.mock("@raypx/database", () => ({
  db: {},
  uuidv7: vi.fn(() => "00000000-0000-4000-8000-000000000000"),
  and: vi.fn((...args) => args),
  count: vi.fn(() => "count"),
  eq: vi.fn((a, b) => ({ a, b })),
  gte: vi.fn((a, b) => ({ a, b })),
}));

// Setup mock chain
beforeEach(() => {
  mockSelect.mockReturnValue({
    from: mockFrom,
  });
  mockFrom.mockReturnValue({
    where: mockWhere,
  });
  mockWhere.mockResolvedValue([]);
});

// Mock user and session
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  image: null,
  role: "user",
  banned: false,
  banReason: null,
  banExpires: null,
};

const mockSession = {
  id: "session-123",
  userId: "user-123",
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  createdAt: new Date(),
  updatedAt: new Date(),
  token: "token-123",
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
};

// Helper to create mock context
function createMockContext(role = "user"): Context {
  return {
    session: {
      session: mockSession,
      user: {
        ...mockUser,
        role,
      },
    },
    db: {
      select: () => mockSelect(),
    } as Context["db"],
  } as Context;
}

describe("dashboardRouter", () => {
  describe("stats", () => {
    it("returns stats for authenticated user", async () => {
      const context = createMockContext();

      const result = await call(dashboardRouter.stats, undefined, {
        context,
      });

      expect(result).toHaveProperty("apiKeys");
      expect(result).toHaveProperty("sessionsThisMonth");
      expect(result).toHaveProperty("storage");
      expect(result.storage).toHaveProperty("used");
      expect(result.storage).toHaveProperty("limit");
    });

    it("returns numeric values for stats", async () => {
      const context = createMockContext();

      const result = await call(dashboardRouter.stats, undefined, {
        context,
      });

      expect(typeof result.apiKeys).toBe("number");
      expect(typeof result.sessionsThisMonth).toBe("number");
      expect(typeof result.storage.used).toBe("number");
      expect(typeof result.storage.limit).toBe("number");
    });
  });

  describe("activity", () => {
    it("returns activity data for last 7 days", async () => {
      const context = createMockContext();

      const result = await call(dashboardRouter.activity, undefined, {
        context,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it("returns data with date and count fields", async () => {
      const context = createMockContext();

      const result = await call(dashboardRouter.activity, undefined, {
        context,
      });

      for (const item of result) {
        expect(item).toHaveProperty("date");
        expect(item).toHaveProperty("count");
        expect(typeof item.date).toBe("string");
        expect(typeof item.count).toBe("number");
      }
    });

    it("returns dates in chronological order", async () => {
      const context = createMockContext();

      const result = await call(dashboardRouter.activity, undefined, {
        context,
      });

      const dates = result.map((item: { date: string }) => new Date(item.date).getTime());
      for (let i = 1; i < dates.length; i++) {
        const current = dates[i];
        const previous = dates[i - 1];
        if (current !== undefined && previous !== undefined) {
          expect(current).toBeGreaterThan(previous);
        }
      }
    });
  });
});
