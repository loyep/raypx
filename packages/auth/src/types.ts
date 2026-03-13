import type { Session, User } from "better-auth/types";

/**
 * Auth user type from Better Auth
 */
export type AuthUser = User;

/**
 * Extended user with admin/username plugin fields.
 * Use when session.user includes role, banned, username, etc.
 */
export type ExtendedUser = AuthUser & {
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  username?: string | null;
  displayUsername?: string | null;
};

/**
 * Session with extended user (for admin/username plugins).
 * Matches getSession return: { session, user }
 */
export type SessionWithExtendedUser = {
  session: Session;
  user: ExtendedUser;
};

/**
 * Auth session type from Better Auth
 */
export type AuthSession = Session;

/**
 * Session context with user information
 */
export interface SessionContext {
  session: AuthSession;
  user: AuthUser;
}

/**
 * OAuth provider types
 */
export type OAuthProvider =
  | "google"
  | "github"
  | "apple"
  | "microsoft"
  | "discord"
  | "twitter"
  | "facebook";

/**
 * Auth configuration options
 */
export interface AuthConfig {
  /**
   * Base URL for the auth server
   */
  baseURL?: string;

  /**
   * Secret key for signing tokens
   */
  secret?: string;

  /**
   * OAuth providers to enable
   */
  providers?: OAuthProvider[];

  /**
   * Enable email/password authentication
   */
  enableCredentials?: boolean;

  /**
   * Enable passkey authentication
   */
  enablePasskeys?: boolean;

  /**
   * Enable two-factor authentication
   */
  enable2FA?: boolean;

  /**
   * Require email verification after sign-up (default: true).
   * Requires RESEND_API_KEY or SMTP_URL to be configured.
   */
  requireEmailVerification?: boolean;

  /**
   * Session expiration in seconds (default: 7 days)
   */
  sessionExpiresIn?: number;
}

/**
 * Auth error types
 */
export type AuthErrorType =
  | "INVALID_CREDENTIALS"
  | "USER_NOT_FOUND"
  | "USER_ALREADY_EXISTS"
  | "SESSION_EXPIRED"
  | "UNAUTHORIZED"
  | "OAUTH_ERROR"
  | "TWO_FACTOR_REQUIRED"
  | "EMAIL_NOT_VERIFIED";

/**
 * Custom auth error class
 */
export class AuthError extends Error {
  constructor(
    public type: AuthErrorType,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
