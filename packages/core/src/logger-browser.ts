import type { LoggerOptions, LoggerPort } from "./logger-types";

const noop = () => {};

function createConsoleStub(_options?: LoggerOptions): LoggerPort {
  return {
    level: 4,
    trace: noop,
    debug: noop,
    info: (...args: unknown[]) => console.info("[raypx]", ...args),
    warn: (...args: unknown[]) => console.warn("[raypx]", ...args),
    error: (...args: unknown[]) => console.error("[raypx]", ...args),
    success: (...args: unknown[]) => console.info("[raypx]", ...args),
    log: (...args: unknown[]) => console.info("[raypx]", ...args),
    withTag: () => createConsoleStub(),
  };
}

let _logger: LoggerPort = createConsoleStub();

export function getLogger(): LoggerPort {
  return _logger;
}

export function setLogger(newLogger: LoggerPort): void {
  _logger = newLogger;
}

export function createLogger(_options: LoggerOptions = {}): LoggerPort {
  return createConsoleStub();
}

export const logger = new Proxy({} as LoggerPort, {
  get(_, prop) {
    return _logger[prop as keyof LoggerPort];
  },
  set(_, prop, value) {
    (_logger as unknown as Record<string, unknown>)[prop as string] = value;
    return true;
  },
});

export function setSilentMode(silent: boolean): void {
  _logger.level = silent ? 0 : 4;
}

export function withTag(_tag: string): LoggerPort {
  return _logger;
}
