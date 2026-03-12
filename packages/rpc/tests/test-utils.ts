import type { Context } from "../src/context";

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    username: null,
    displayUsername: null,
    role: "user",
    banned: false,
    banReason: null,
    banExpires: null,
    ...overrides,
  };
}

/**
 * Create a mock session for testing
 */
export function createMockSession(overrides: Record<string, unknown> = {}) {
  return {
    id: "test-session-id",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    token: "test-token",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActive: new Date(),
    ipAddress: null,
    userAgent: null,
    userId: "test-user-id",
    impersonatedBy: null,
    activeOrganizationId: null,
    ...overrides,
  };
}

/**
 * Create a mock context for RPC testing
 */
export function createMockContext(
  options: {
    withSession?: boolean;
    userOverrides?: Record<string, unknown>;
    sessionOverrides?: Record<string, unknown>;
  } = {},
): Context {
  const { withSession = true, userOverrides, sessionOverrides } = options;

  if (!withSession) {
    return {
      db: {} as Context["db"],
      requestId: "req-test-1",
      session: null,
      traceId: "trace-test-1",
    } as unknown as Context;
  }

  const user = createMockUser(userOverrides);
  const session = {
    ...createMockSession({ userId: user.id, ...sessionOverrides }),
    user,
  };

  return {
    db: {} as Context["db"],
    requestId: "req-test-1",
    session,
    traceId: "trace-test-1",
  } as unknown as Context;
}

/**
 * Create a mock admin context for RPC testing
 */
export function createMockAdminContext(
  options: { withSession?: boolean; sessionOverrides?: Record<string, unknown> } = {},
): Context {
  return createMockContext({
    ...options,
    userOverrides: { role: "admin" },
  });
}
