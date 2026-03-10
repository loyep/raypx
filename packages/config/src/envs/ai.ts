import { z } from "zod";

export const aiEnv = {
  id: "ai",
  server: {
    // Shared secret material for encrypting provider credentials at rest.
    APP_KEY: z.string().min(32).optional(),

    // Explicit AI-only override when APP_KEY should not be reused.
    AI_CREDENTIALS_SECRET: z.string().min(32).optional(),

    // Cache Configuration
    AI_CACHE_TTL: z.coerce.number().default(3600), // 1 hour

    // Rate Limiting
    AI_RATE_LIMIT_REQUESTS: z.coerce.number().default(60), // per minute
    AI_RATE_LIMIT_TOKENS: z.coerce.number().default(100000), // per day

    // Token Limits
    AI_MAX_TOKENS: z.coerce.number().default(4096),
    AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  },
} as const;
