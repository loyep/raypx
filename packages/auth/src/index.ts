/**
 * @raypx/auth - Server entry
 * For client-side code, use @raypx/auth/client
 */
import "./types-ext";

export {
  createAuth,
  createAuthRouteHandlers,
  getServerSession,
  getSessionFromRequest,
  hasServerSession,
  serverAuth,
} from "./server";
export type { Auth, AuthConfig, SessionWithExtendedUser } from "./types";
export { AuthError, isAdmin } from "./types";
