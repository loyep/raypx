import { createEnv, databaseEnv, z } from "@raypx/config";

const databaseRuntimeEnv = {
  ...databaseEnv,
  server: {
    ...databaseEnv.server,
    DB_LOG_SQL: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value !== "false"),
    DB_LOG_PARAMS: z.enum(["off", "masked", "full"]).optional().default("masked"),
  },
} as const;

/**
 * @deprecated Prefer using the exported `env` singleton.
 */
export const envs = () => createEnv(databaseRuntimeEnv);

export const env = envs();
