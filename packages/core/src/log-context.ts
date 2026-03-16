import type { LoggerContext } from "./logger-types";

/**
 * Simplified log context without node:async_hooks.
 * Context is not propagated; getLogContext always returns {}.
 * runWithLogContext exists for API compatibility but does not persist context.
 */
export function runWithLogContext<T>(_context: LoggerContext, fn: () => T): T {
  return fn();
}

export function getLogContext(): LoggerContext {
  return {};
}
