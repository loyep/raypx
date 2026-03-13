import { getServerSession } from "@raypx/auth/server";
import type { SessionWithExtendedUser } from "@raypx/auth";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<SessionWithExtendedUser | null> => {
    const headers = getRequestHeaders();
    const session = await getServerSession(headers);
    return session as SessionWithExtendedUser | null;
  },
);
