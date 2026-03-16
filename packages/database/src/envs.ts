import { createEnv, databaseEnv, z } from "@raypx/config";

const databaseRuntimeEnv = {
  extends: [databaseEnv],
  shared: {
    DB_LOG_PARAMS: z.enum(["off", "masked", "full"]).optional().default("masked"),
    DB_LOG_SQL: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value !== "false"),
  },
} as const;

/**
 * @deprecated Prefer using the exported `env` singleton.
 */
export const envs = () => createEnv(databaseRuntimeEnv);

export const env = envs();
