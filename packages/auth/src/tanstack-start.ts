import { createServerFn } from "@tanstack/react-start";

import { getServerSession } from "./server";

/**
 * Create a getSession server function for TanStack Start loaders.
 * Pass getRequestHeaders from @tanstack/react-start/server.
 *
 * @example
 * ```ts
 * import { createGetSession } from "@raypx/auth/tanstack-start";
 * import { getRequestHeaders } from "@tanstack/react-start/server";
 *
 * export const getSession = createGetSession(getRequestHeaders);
 * ```
 */
export function createGetSession(getHeaders: () => Headers) {
  return createServerFn({ method: "GET" }).handler(async () => {
    return getServerSession(getHeaders());
  });
}

/**
 * Pre-built getSession server function. Uses dynamic import inside the handler
 * to avoid pulling @tanstack/react-start/server into client bundles.
 * Safe to import from route loaders and components.
 */
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getRequest } = await import("@tanstack/react-start/server");
  return getServerSession(getRequest().headers);
});
