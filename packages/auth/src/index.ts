// Server-side exports

// Client-side exports
export { createAuthClient } from "better-auth/react";
export type { Auth } from "./server";
export { createAuth, getSessionFromRequest } from "./server";

// Types
export type {
  AuthConfig,
  AuthErrorType,
  AuthSession,
  AuthUser,
  OAuthProvider,
  SessionContext,
} from "./types";
export { AuthError } from "./types";
