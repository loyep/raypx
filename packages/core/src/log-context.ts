import { AsyncLocalStorage } from "node:async_hooks";

import type { LoggerContext } from "./logger";

const logContextStorage = new AsyncLocalStorage<LoggerContext>();

export function runWithLogContext<T>(context: LoggerContext, fn: () => T): T {
  const parentContext = logContextStorage.getStore() ?? {};
  return logContextStorage.run(
    {
      ...parentContext,
      ...context,
    },
    fn,
  );
}

export function getLogContext(): LoggerContext {
  return logContextStorage.getStore() ?? {};
}
