import { createAuth, getSessionFromRequest } from "./server";

const rpcAuth = createAuth();

/**
 * Shared auth helper for RPC layers (oRPC/tRPC).
 */
export async function getRpcSessionFromRequest(request: Request) {
  return getSessionFromRequest(rpcAuth, request);
}
