import { aiEnv, authEnv, createEnv, stripeEnv } from "@raypx/config";
import { z } from "zod";

const env = createEnv({
  extends: [authEnv, stripeEnv, aiEnv],
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  server: {
    PORT: z.coerce.number().optional().default(3000),
  },
  skip: process.env.NODE_ENV !== "production" || !!process.env.CI,
});

export default env;
