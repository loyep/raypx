import { aiEnv } from "@raypx/ai/env";
import { authEnv, createEnv } from "@raypx/config";
import { emailEnv } from "@raypx/email/env";
import { stripeEnv } from "@raypx/stripe/env";
import { z } from "zod";

const env = createEnv({
  extends: [authEnv, stripeEnv, aiEnv, emailEnv],
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  server: {
    PORT: z.coerce.number().optional().default(3000),
  },
  skip: process.env.NODE_ENV !== "production" || !!process.env.CI,
});

export default env;
