import { call, ORPCError } from "@orpc/server";
import type { AuthSession as Session, AuthUser as User } from "@raypx/auth/types";
import { describe, expect, it } from "vitest";
import type { Context } from "../context";
import {
  publicProcedure as o,
  optionalAuthMiddleware,
  optionalAuthProcedure,
  protectedProcedure,
  requireAuthMiddleware,
  requirePermission,
  requireRole,
} from "../middleware";

// Mock user and session data with all required fields
const mockUser: User = {
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
} as User;

const mockSession: Session = {
  id: "session-123",
  userId: "user-123",
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  createdAt: new Date(),
  updatedAt: new Date(),
  token: "token-123",
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
} as Session;

// Helper to create mock context with session
function createMockContext(withSession: boolean): Context {
  if (!withSession) {
    return {
      session: null,
      db: {} as Context["db"],
    };
  }
  return {
    session: {
      session: mockSession,
      user: mockUser,
    },
    db: {} as Context["db"],
  } as Context;
}

describe("requireAuthMiddleware", () => {
  it("throws UNAUTHORIZED error when no session exists", async () => {
    const context = createMockContext(false);

    // Create a test procedure that uses the middleware
    const testProcedure = o.use(requireAuthMiddleware).handler(async () => "success");

    await expect(call(testProcedure, undefined, { context })).rejects.toThrow(ORPCError);

    await expect(call(testProcedure, undefined, { context })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("passes context correctly when session exists", async () => {
    const context = createMockContext(true);

    let capturedContext: unknown;
    const testProcedure = o
      .use(requireAuthMiddleware)
      .handler(async ({ context }: { context: unknown }) => {
        capturedContext = context;
        return "success";
      });

    await call(testProcedure, undefined, { context });

    expect(capturedContext).toEqual(
      expect.objectContaining({
        user: mockUser,
      }),
    );
    // Session is the SessionContext (contains nested session + user)
    const capturedSession = (capturedContext as { session: { session: Session } }).session;
    expect(capturedSession.session).toHaveProperty("id", mockSession.id);
  });
});

describe("optionalAuthMiddleware", () => {
  it("sets session and user to null when no session exists", async () => {
    const context = createMockContext(false);

    let capturedContext: unknown;
    const testProcedure = o
      .use(optionalAuthMiddleware)
      .handler(async ({ context }: { context: unknown }) => {
        capturedContext = context;
        return "success";
      });

    await call(testProcedure, undefined, { context });

    expect(capturedContext).toEqual(
      expect.objectContaining({
        session: null,
        user: null,
      }),
    );
  });

  it("preserves session when it exists", async () => {
    const context = createMockContext(true);

    let capturedContext: unknown;
    const testProcedure = o
      .use(optionalAuthMiddleware)
      .handler(async ({ context }: { context: unknown }) => {
        capturedContext = context;
        return "success";
      });

    await call(testProcedure, undefined, { context });

    expect(capturedContext).toEqual(
      expect.objectContaining({
        user: mockUser,
      }),
    );
    // Session is the SessionContext (contains nested session + user)
    const capturedSession = (capturedContext as { session: { session: Session } }).session;
    expect(capturedSession.session).toHaveProperty("id", mockSession.id);
  });
});

describe("protectedProcedure", () => {
  it("is correctly configured with requireAuth middleware", async () => {
    const context = createMockContext(false);

    const testHandler = protectedProcedure.handler(async () => "success");

    await expect(call(testHandler, undefined, { context })).rejects.toThrow(ORPCError);
  });
});

describe("optionalAuthProcedure", () => {
  it("is correctly configured with optionalAuth middleware", async () => {
    const context = createMockContext(false);

    let capturedContext: unknown;
    const testHandler = optionalAuthProcedure.handler(async ({ context }) => {
      capturedContext = context;
      return "success";
    });

    await call(testHandler, undefined, { context });

    expect(capturedContext).toEqual(
      expect.objectContaining({
        session: null,
        user: null,
      }),
    );
  });
});

describe("requireRole", () => {
  it("throws FORBIDDEN when user role is not allowed", async () => {
    const context = createMockContext(true);
    const testHandler = requireRole("admin").handler(async () => "success");

    await expect(call(testHandler, undefined, { context })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows access when user role is allowed", async () => {
    const context = createMockContext(true);
    if (!context.session) throw new Error("Expected session in test context");
    context.session.user = {
      ...context.session.user,
      role: "admin",
      banned: false,
      banReason: null,
      banExpires: null,
    };
    const testHandler = requireRole("admin").handler(async () => "success");

    await expect(call(testHandler, undefined, { context })).resolves.toBe("success");
  });
});

describe("requirePermission", () => {
  it("throws FORBIDDEN when role does not have permission", async () => {
    const context = createMockContext(true);
    const testHandler = requirePermission("users:update").handler(async () => "success");

    await expect(call(testHandler, undefined, { context })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows access when role has permission", async () => {
    const context = createMockContext(true);
    if (!context.session) throw new Error("Expected session in test context");
    context.session.user = {
      ...context.session.user,
      role: "admin",
      banned: false,
      banReason: null,
      banExpires: null,
    };
    const testHandler = requirePermission("users:update").handler(async () => "success");

    await expect(call(testHandler, undefined, { context })).resolves.toBe("success");
  });
});
