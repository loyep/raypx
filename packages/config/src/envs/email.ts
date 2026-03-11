import { z } from "zod";

export const emailEnv = {
  id: "email",
  server: {
    EMAIL_FROM: z.string().min(1).optional(),
    EMAIL_FROM_NAME: z.string().min(1).optional(),
    RESEND_API_KEY: z
      .string()
      .min(1)
      .startsWith("re_", "Resend token must start with 're_'")
      .optional(),
    SMTP_URL: z.url().optional(),
  },
} as const;
