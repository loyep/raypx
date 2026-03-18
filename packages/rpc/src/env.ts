import { authEnv, createEnv } from "@raypx/config/envs";

export const env = createEnv({
  extends: [authEnv],
});
