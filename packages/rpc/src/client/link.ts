import { RPCLink } from "@orpc/client/fetch";
import { getRpcBaseUrl } from "../env";

function getRpcUrl(): string {
  return `${getRpcBaseUrl()}/api/rpc`;
}

const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10_000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
} as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number): number {
  const delay = Math.min(RETRY_CONFIG.baseDelay * 2 ** attempt, RETRY_CONFIG.maxDelay);
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

function isRetryable(status: number): boolean {
  return (RETRY_CONFIG.retryableStatuses as readonly number[]).includes(status);
}

export const rpcLink = new RPCLink({
  url: getRpcUrl(),
  async fetch(request, init) {
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
          await sleep(calculateDelay(attempt));
        }
      } catch (err) {
        lastError = err as Error;

        if (attempt < RETRY_CONFIG.maxRetries) {
          await sleep(calculateDelay(attempt));
        }
      }
    }

    if (lastResponse) {
      return lastResponse;
    }
    throw lastError;
  },
});
