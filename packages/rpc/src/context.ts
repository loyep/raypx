import { createAuth, getSessionFromRequest } from "@raypx/auth/server";
import { db } from "@raypx/database";
import type { Session, User } from "better-auth";

// Create auth instance (can be configured via environment)
const auth = createAuth();

export interface SessionContext {
  session: Session;
  user: User;
}

export async function createContext({ req }: { req: Request }) {
  if (!req) {
    return {
      session: null,
      db,
    };
  }

  // Get session from auth
  const sessionData = await getSessionFromRequest(auth, req);

  return {
    session: sessionData,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
