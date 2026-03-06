import { z } from "zod";

export const aiEnv = {
  id: "ai",
  server: {
    // Zhipu (ZAI) API Key for OpenAI-compatible endpoint
    ZHIPU_API_KEY: z.string().min(1).optional(),
    ZHIPU_BASE_URL: z.string().url().optional(),
    ZHIPU_MODEL: z.string().default("glm-5"),

    // Alibaba Qwen
    ALIBABA_API_KEY: z.string().min(1).optional(),
    ALIBABA_BASE_URL: z.string().url().optional(),
    ALIBABA_MODEL: z.string().default("qwen3.5-plus"),

    // Vercel AI Gateway
    AI_GATEWAY_API_KEY: z.string().min(1).optional(),

    // OpenAI
    OPENAI_API_KEY: z.string().startsWith("sk-").optional(),

    // Anthropic
    ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),

    // AI Configuration
    AI_DEFAULT_PROVIDER: z.enum(["openai", "anthropic"]).default("openai"),
    AI_DEFAULT_MODEL: z.string().default("gpt-4o"),
    AI_CHAT_PROVIDER: z.enum(["qwen", "zhipu"]).default("qwen"),
    APP_KEY: z.string().min(32).optional(),
    AI_CREDENTIALS_SECRET: z.string().min(32).optional(),

    // Cache Configuration
    AI_CACHE_TTL: z.coerce.number().default(3600), // 1 hour

    // Rate Limiting
    AI_RATE_LIMIT_REQUESTS: z.coerce.number().default(60), // per minute
    AI_RATE_LIMIT_TOKENS: z.coerce.number().default(100000), // per day

    // Token Limits
    AI_MAX_TOKENS: z.coerce.number().default(4096),
    AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7).optional(),
  },
} as const;
