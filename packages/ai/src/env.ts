import { createEnv, z } from "@raypx/config";

export const aiEnv = {
  id: "ai",
  server: {
    APP_KEY: z.string().min(32).optional(),
    AI_CREDENTIALS_SECRET: z.string().min(32).optional(),
    AI_CACHE_TTL: z.coerce.number().default(3600),
    AI_RATE_LIMIT_REQUESTS: z.coerce.number().default(60),
    AI_RATE_LIMIT_TOKENS: z.coerce.number().default(100000),
    AI_MAX_TOKENS: z.coerce.number().default(4096),
    AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  },
} as const;

export const envs = () => createEnv(aiEnv);
