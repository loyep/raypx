import { createEnv, emailEnv, z } from "@raypx/config";

const sharedConfigEnv = {
  extends: [emailEnv],
  server: {
    EMAIL_DOMAIN: z.string().default("localhost"),
    NOREPLY_EMAIL: z.string().optional(),
    HELLO_EMAIL: z.string().optional(),
    SUPPORT_EMAIL: z.string().optional(),
    TEST_EMAIL: z.string().optional(),
    MESSAGE_ID_DOMAIN: z.string().optional(),
  },
} as const;

export const env = createEnv(sharedConfigEnv);
