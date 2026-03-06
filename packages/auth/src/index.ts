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

// Provider exports (safe for browser)
export { AuthProvider, useAuthContext } from "./provider";

// Types (safe for browser)
export type {
  AuthConfig,
  AuthErrorType,
  AuthSession,
  AuthUser,
  OAuthProvider,
  SessionContext,
} from "./types";
export { AuthError } from "./types";
