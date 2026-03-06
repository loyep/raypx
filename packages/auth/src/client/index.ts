import {
  adminClient,
  jwtClient,
  lastLoginMethodClient,
  multiSessionClient,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient as createClient } from "better-auth/react";

/**
 * Pre-configured auth client for browser usage
 * Uses AUTH_URL from environment or falls back to localhost in development
 */
export const authClient = createClient({
  baseURL: getBaseURL(),
  plugins: [
    organizationClient(),
    adminClient(),
    usernameClient(),
    jwtClient(),
    multiSessionClient(),
    lastLoginMethodClient(),
  ],
});

function getBaseURL(): string | undefined {
  // Check for VITE_ prefixed env (Vite apps)
  // const viteUrl = import.meta.env.VITE_AUTH_URL;
  // if (viteUrl) return viteUrl;

  // // Check for standard env (SSR/Node)
  // const authUrl = process.env.AUTH_URL;
  // if (authUrl) return authUrl;

  // // Development fallback
  // if (process.env.NODE_ENV !== "production") {
  //   return DEFAULT_DEV_URL;
  // }

  // Production without URL configured - use relative path
  return undefined;
}

// Re-export createAuthClient for custom configurations
export { createAuthClient } from "better-auth/react";

// Export convenience methods
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
