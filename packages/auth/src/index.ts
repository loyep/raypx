/**
 * @raypx/auth - Server entry
 * For client-side code, use @raypx/auth/client
 */
import "./types-ext";

export type { Auth } from "./server";
export {
  createAuth,
  createAuthRouteHandlers,
  getServerSession,
  getSessionFromRequest,
  hasCredentialPasswordAccount,
  hasServerSession,
  serverAuth,
} from "./server";
export type { AuthConfig, SessionWithExtendedUser } from "./types";
export { AuthError, isAdmin } from "./types";
