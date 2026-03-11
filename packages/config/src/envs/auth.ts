import { z } from "zod";

export const authEnv = {
  id: "auth",
  shared: {
    AUTH_URL: z.url().default("http://localhost:3000"),
    SITE_URL: z.url().default("http://localhost:3000"),
  },
  server: {
    AUTH_SECRET: z.string().min(32).optional(),
    APP_KEY: z.string().min(32).optional(),
    AUTH_DOMAIN: z.string().min(1).optional(),
    // CORS - comma-separated list of allowed origins
    ALLOWED_ORIGINS: z.string().min(1).optional(),
    // OAuth providers
    AUTH_GITHUB_ID: z.string().min(1).optional(),
    AUTH_GITHUB_SECRET: z.string().min(1).optional(),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
    AUTH_APPLE_ID: z.string().min(1).optional(),
    AUTH_APPLE_SECRET: z.string().min(1).optional(),
    AUTH_MICROSOFT_ID: z.string().min(1).optional(),
    AUTH_MICROSOFT_SECRET: z.string().min(1).optional(),
    AUTH_DISCORD_ID: z.string().min(1).optional(),
    AUTH_DISCORD_SECRET: z.string().min(1).optional(),
    AUTH_TWITTER_ID: z.string().min(1).optional(),
    AUTH_TWITTER_SECRET: z.string().min(1).optional(),
    AUTH_FACEBOOK_ID: z.string().min(1).optional(),
    AUTH_FACEBOOK_SECRET: z.string().min(1).optional(),
  },
} as const;
