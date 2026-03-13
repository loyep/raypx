import { createGetSession } from "@raypx/auth/tanstack-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSession = createGetSession(getRequestHeaders);
