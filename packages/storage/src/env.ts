import { createEnv, z } from "@raypx/config";

export const storageEnv = {
  id: "storage",
  server: {
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1),
  },
  shared: {
    R2_PUBLIC_URL: z.url().optional(),
  },
} as const;

export const envs = () => createEnv(storageEnv);
