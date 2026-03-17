import { authEnv, createEnv } from "@raypx/config/envs";

const env = createEnv({
  extends: [authEnv],
});

/** Base URL for RPC requests. Safe to use in both browser and server. */
export function getRpcBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return env.SITE_URL ?? env.AUTH_URL ?? "http://localhost:3000";
}
