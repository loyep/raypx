import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createEnv, DEFAULT_CLIENT_PREFIX } from "../src/env";
import { aiEnv } from "../src/envs/ai";
import { analyticsEnv } from "../src/envs/analytics";
import { authEnv } from "../src/envs/auth";
import { databaseEnv } from "../src/envs/database";

describe("config env helpers", () => {
  it("uses the default client prefix and resolves declared values", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgres://prod/raypx");
    vi.stubEnv("VITE_APP_URL", "https://raypx.com");

    const env = createEnv({
      skip: true,
      shared: {
        NODE_ENV: z.enum(["development", "production"]).default("development"),
      },
      server: {
        DATABASE_URL: z.string().default("postgres://localhost/raypx"),
      },
      client: {
        VITE_APP_URL: z.string().default("http://localhost:3000"),
      },
    });

    expect(DEFAULT_CLIENT_PREFIX).toBe("VITE_");
    expect(env.NODE_ENV).toBe("production");
    expect(env.DATABASE_URL).toBe("postgres://prod/raypx");
    expect(env.VITE_APP_URL).toBe("https://raypx.com");
  });

  it("supports custom client prefixes", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.raypx.com");

    const env = createEnv({
      skip: true,
      clientPrefix: "NEXT_PUBLIC_",
      client: {
        NEXT_PUBLIC_APP_URL: z.string().url(),
      },
    });

    expect(env.NEXT_PUBLIC_APP_URL).toBe("https://app.raypx.com");
  });
});

describe("config env schemas", () => {
  it("provides auth and analytics defaults", () => {
    expect(authEnv.shared.SITE_URL.parse(undefined)).toBe("http://localhost:3000");
    expect(analyticsEnv.client.VITE_PUBLIC_ENABLE_GA.parse(undefined)).toBe(false);
  });

  it("falls back VECTOR_URL to DATABASE_URL when omitted", () => {
    vi.stubEnv("DATABASE_URL", "postgres://db/raypx");

    expect(databaseEnv.server.VECTOR_URL.parse(undefined)).toBe("postgres://db/raypx");
  });

  it("keeps AI runtime env limited to shared runtime controls", () => {
    expect(aiEnv.server.AI_CACHE_TTL.parse(undefined)).toBe(3600);
    expect(aiEnv.server.AI_RATE_LIMIT_REQUESTS.parse(undefined)).toBe(60);
    expect(aiEnv.server.AI_RATE_LIMIT_TOKENS.parse(undefined)).toBe(100000);
    expect(aiEnv.server.AI_MAX_TOKENS.parse(undefined)).toBe(4096);
    expect(aiEnv.server.AI_TEMPERATURE.parse(undefined)).toBe(0.7);
  });
});
