import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSession, mockBetterAuth } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockBetterAuth = vi.fn(() => ({
    api: {
      getSession: mockGetSession,
      createOrganization: vi.fn(),
    },
  }));

  return {
    mockGetSession,
    mockBetterAuth,
  };
});

vi.mock("better-auth", () => ({
  betterAuth: mockBetterAuth,
}));

vi.mock("better-auth/adapters/drizzle", () => ({
  drizzleAdapter: vi.fn(() => ({ adapter: "drizzle" })),
}));

vi.mock("better-auth/plugins", () => ({
  admin: vi.fn(() => ({ name: "admin" })),
  bearer: vi.fn(() => ({ name: "bearer" })),
  jwt: vi.fn(() => ({ name: "jwt" })),
  lastLoginMethod: vi.fn(() => ({ name: "lastLoginMethod" })),
  multiSession: vi.fn(() => ({ name: "multiSession" })),
  organization: vi.fn(() => ({ name: "organization" })),
  username: vi.fn(() => ({ name: "username" })),
}));

vi.mock("better-auth/plugins/admin/access", () => ({
  defaultRoles: {
    user: { statements: {} },
    admin: { statements: {} },
  },
}));

vi.mock("@raypx/database", () => ({
  db: {
    query: {
      member: {
        findFirst: vi.fn(),
      },
    },
  },
  uuidv7: vi.fn(() => "11111111-1111-4111-8111-111111111111"),
}));

vi.mock("@raypx/database/schemas", () => ({}));

vi.mock("../../src/envs", () => ({
  env: {
    AUTH_SECRET: "test-secret",
    APP_KEY: "app-key",
    AUTH_URL: "http://localhost:3000",
    AUTH_DOMAIN: undefined,
    AUTH_GOOGLE_ID: undefined,
    AUTH_GOOGLE_SECRET: undefined,
    AUTH_GITHUB_ID: undefined,
    AUTH_GITHUB_SECRET: undefined,
    AUTH_APPLE_ID: undefined,
    AUTH_APPLE_SECRET: undefined,
    AUTH_MICROSOFT_ID: undefined,
    AUTH_MICROSOFT_SECRET: undefined,
    AUTH_DISCORD_ID: undefined,
    AUTH_DISCORD_SECRET: undefined,
    AUTH_TWITTER_ID: undefined,
    AUTH_TWITTER_SECRET: undefined,
    AUTH_FACEBOOK_ID: undefined,
    AUTH_FACEBOOK_SECRET: undefined,
  },
}));

import { createAuth, getSessionFromRequest } from "../../src/server";

describe("auth server helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses explicit providers from config when creating auth", () => {
    createAuth({ providers: ["github"] });

    expect(mockBetterAuth).toHaveBeenCalledTimes(1);
    const config = mockBetterAuth.mock.calls[0]?.[0];
    expect(config.socialProviders.github).toEqual({
      clientId: "",
      clientSecret: "",
    });
    expect(config.socialProviders.google).toBeUndefined();
  });

  it("returns session from request headers", async () => {
    const session = { session: { id: "s1" }, user: { id: "u1" } };
    mockGetSession.mockResolvedValue(session);

    const auth = createAuth();
    const result = await getSessionFromRequest(auth, new Request("https://raypx.test"));

    expect(result).toEqual(session);
    expect(mockGetSession).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
  });

  it("returns null when auth session lookup throws", async () => {
    mockGetSession.mockRejectedValue(new Error("boom"));

    const auth = createAuth();
    const result = await getSessionFromRequest(auth, new Request("https://raypx.test"));

    expect(result).toBeNull();
  });
});
