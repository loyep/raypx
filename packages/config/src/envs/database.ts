import { z } from "zod";

export const databaseEnv = {
  id: "database",
  server: {
    DATABASE_URL: z.string().min(1),
    DATABASE_PREFIX: z.string().min(1).optional(),
  },
} as const;
