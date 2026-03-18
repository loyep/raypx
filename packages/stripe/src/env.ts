import { createEnv, z } from "@raypx/config";

export const stripeEnv = {
  id: "stripe",
  shared: {
    VITE_BILLING_PROVIDER: z.string().optional(),
    VITE_PAY_SUCCESS_URL: z.url().optional(),
    VITE_PAY_CANCEL_URL: z.url().optional(),
  },
  server: {
    STRIPE_PUBLIC_KEY: z.string().min(1).optional(),
    STRIPE_PRIVATE_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  },
} as const;

export const envs = () => createEnv(stripeEnv);
