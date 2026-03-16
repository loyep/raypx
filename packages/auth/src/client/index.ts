/**
 * @raypx/auth/client - Client entry (browser-safe)
 */
import {
  adminClient,
  emailOTPClient,
  jwtClient,
  lastLoginMethodClient,
  multiSessionClient,
  organizationClient,
  usernameClient,
} from "better-auth/client/plugins";
import { createAuthClient as createClient } from "better-auth/react";

/**
 * Pre-configured auth client for browser usage
 * Uses AUTH_URL from environment or falls back to relative path in production
 */
export const authClient = createClient({
  baseURL: getBaseURL(),
  plugins: [
    emailOTPClient(),
    organizationClient(),
    adminClient(),
    usernameClient(),
    jwtClient(),
    multiSessionClient(),
    lastLoginMethodClient(),
  ],
});

function getBaseURL(): string | undefined {
  return undefined;
}

export { createAuthClient } from "better-auth/react";
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export { OAuthButton, OAuthButtonGroup } from "../components/oauth-buttons";
export { useOAuthReset } from "../hooks/use-oauth-reset";
// Provider and UI components
export { AuthProvider, useAuthContext } from "../provider";

// Types (client-safe)
export type {
  AuthConfig,
  AuthErrorType,
  ExtendedUser,
  OAuthProvider,
  SessionWithExtendedUser,
} from "../types";
export { AuthError, isAdmin } from "../types";
