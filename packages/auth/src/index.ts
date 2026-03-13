// Type augmentation for Better Auth (must be imported first)
import "./types-ext";

// Client-side exports (safe for browser)
export {
  authClient,
  createAuthClient,
  getSession,
  signIn,
  signOut,
  signUp,
  useSession,
} from "./client";
// Components (safe for browser)
export { OAuthButton, OAuthButtonGroup } from "./components/oauth-buttons";

// Hooks (safe for browser)
export { useOAuthReset } from "./hooks/use-oauth-reset";
// Provider exports (safe for browser)
export { AuthProvider, useAuthContext } from "./provider";

// Types (safe for browser)
export type {
  AuthConfig,
  AuthErrorType,
  ExtendedUser,
  OAuthProvider,
  SessionWithExtendedUser,
} from "./types";
export { AuthError, isAdmin } from "./types";
