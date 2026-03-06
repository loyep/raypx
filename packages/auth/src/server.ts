import { db } from "@raypx/database";
import * as schema from "@raypx/database/schemas";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { AuthConfig } from "./types";

/**
 * Default session expiration (7 days in seconds)
 */
const DEFAULT_SESSION_EXPIRES_IN = 60 * 60 * 24 * 7;

/**
 * Create a Better Auth instance configured for the server
 */
export function createAuth(config: AuthConfig = {}) {
  const {
    baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    secret = process.env.BETTER_AUTH_SECRET,
    providers = [],
    enableCredentials = true,
    enablePasskeys = false,
    enable2FA = false,
    sessionExpiresIn = DEFAULT_SESSION_EXPIRES_IN,
  } = config;

  const auth = betterAuth({
    baseURL: baseUrl,
    secret,
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    session: {
      expiresIn: sessionExpiresIn,
      updateAge: 60 * 60 * 24, // Update session once per day
    },
    user: {
      additionalFields: {
        username: {
          type: "string",
          required: false,
          unique: true,
        },
        displayUsername: {
          type: "string",
          required: false,
        },
        role: {
          type: "string",
          required: false,
        },
        banned: {
          type: "boolean",
          defaultValue: false,
        },
        banReason: {
          type: "string",
          required: false,
        },
        banExpires: {
          type: "date",
          required: false,
        },
      },
    },
    emailAndPassword: {
      enabled: enableCredentials,
      requireEmailVerification: false,
    },
    passkey: {
      enabled: enablePasskeys,
    },
    twoFactor: {
      enabled: enable2FA,
    },
    socialProviders: {
      google: providers.includes("google")
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
          }
        : undefined,
      github: providers.includes("github")
        ? {
            clientId: process.env.GITHUB_CLIENT_ID ?? "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
          }
        : undefined,
      apple: providers.includes("apple")
        ? {
            clientId: process.env.APPLE_CLIENT_ID ?? "",
            clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
          }
        : undefined,
      microsoft: providers.includes("microsoft")
        ? {
            clientId: process.env.MICROSOFT_CLIENT_ID ?? "",
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
          }
        : undefined,
      discord: providers.includes("discord")
        ? {
            clientId: process.env.DISCORD_CLIENT_ID ?? "",
            clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
          }
        : undefined,
      twitter: providers.includes("twitter")
        ? {
            clientId: process.env.TWITTER_CLIENT_ID ?? "",
            clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
          }
        : undefined,
      facebook: providers.includes("facebook")
        ? {
            clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
          }
        : undefined,
    },
  });

  return auth;
}

/**
 * Get session from request headers
 */
export async function getSessionFromRequest(auth: ReturnType<typeof createAuth>, request: Request) {
  try {
    const headers = request.headers;
    if (!headers) {
      return null;
    }
    const session = await auth.api.getSession({ headers });
    return session;
  } catch {
    return null;
  }
}

/**
 * Type export for the auth instance
 */
export type Auth = ReturnType<typeof createAuth>;
