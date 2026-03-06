import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { createContext } from "./context";
import { appRouter } from "./routers";

// Retry with exponential backoff
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10_000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number): number {
  const delay = Math.min(RETRY_CONFIG.baseDelay * 2 ** attempt, RETRY_CONFIG.maxDelay);
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

function isRetryable(status: number): boolean {
  return RETRY_CONFIG.retryableStatuses.includes(status);
}

const getORPCClient = createIsomorphicFn()
  .server(() => {
    return createRouterClient(appRouter, {
      context: async (ctx: { request: Request }) => createContext({ req: ctx.request }),
    });
  })
  .client(() => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
      async fetch(request, init, _options, _path, _input) {
        let lastError: Error | null = null;
        let lastResponse: Response | null = null;

        for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
          try {
            const retryRequest = attempt > 0 ? request.clone() : request;

            const response = await fetch(retryRequest, {
              ...init,
              credentials: "include",
            });

            if (response.ok || !isRetryable(response.status)) {
              return response;
            }

            lastResponse = response;
            lastError = new Error(`HTTP ${response.status}`);

            if (attempt < RETRY_CONFIG.maxRetries) {
              const delay = calculateDelay(attempt);
              console.warn(`RPC retry ${attempt + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms`);
              await sleep(delay);
            }
          } catch (err) {
            lastError = err as Error;

            if (attempt < RETRY_CONFIG.maxRetries) {
              const delay = calculateDelay(attempt);
              console.warn(
                `RPC network error, retry ${attempt + 1}/${RETRY_CONFIG.maxRetries} after ${delay}ms`,
              );
              await sleep(delay);
            }
          }
        }

        if (lastResponse) {
          return lastResponse;
        }
        throw lastError;
      },
    });

    return createORPCClient(link) as any;
  });

export const client = getORPCClient() as any;

export const orpc = createTanstackQueryUtils(client);

export type ORPC = typeof orpc;
