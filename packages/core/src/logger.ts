import { type ConsolaInstance, createConsola } from "consola";

export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type LogLevelName = "silent" | "error" | "warn" | "info" | "debug" | "trace";

export interface LoggerContext {
  [key: string]: unknown;
}

export interface LoggerPort {
  level: number;
  trace: (message: unknown, ...args: unknown[]) => void;
  debug: (message: unknown, ...args: unknown[]) => void;
  info: (message: unknown, ...args: unknown[]) => void;
  warn: (message: unknown, ...args: unknown[]) => void;
  error: (message: unknown, ...args: unknown[]) => void;
  success: (message: unknown, ...args: unknown[]) => void;
  log: (message: unknown, ...args: unknown[]) => void;
  withTag: (tag: string) => LoggerPort;
}

export interface LoggerOptions {
  level?: LogLevel | LogLevelName;
  colors?: boolean;
  timestamp?: boolean;
  compact?: boolean;
  tag?: string;
}

function parseLevel(level: LogLevel | LogLevelName): number {
  if (typeof level === "number") return level;

  const levels: Record<LogLevelName, number> = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  };

  return levels[level] ?? 3;
}

function getDefaultLevel(): number {
  const envLevel = process.env.LOG_LEVEL;
  if (envLevel) {
    const parsed = Number.parseInt(envLevel, 10);
    if (!Number.isNaN(parsed)) return Math.min(5, Math.max(0, parsed));
  }
  return process.env.NODE_ENV === "production" ? 3 : 4;
}

let _logger: ConsolaInstance = createConsola({
  level: getDefaultLevel(),
  formatOptions: {
    colors: true,
    date: true,
    compact: false,
  },
});

export function getLogger(): ConsolaInstance {
  return _logger;
}

export function setLogger(newLogger: ConsolaInstance): void {
  _logger = newLogger;
}

export function createLogger(options: LoggerOptions = {}): ConsolaInstance {
  const level = options.level !== undefined ? parseLevel(options.level) : getDefaultLevel();

  const logger = createConsola({
    level,
    formatOptions: {
      colors: options.colors ?? true,
      date: options.timestamp ?? true,
      compact: options.compact ?? false,
    },
  });

  if (options.tag) {
    return logger.withTag(options.tag);
  }

  return logger;
}

export const logger = new Proxy({} as ConsolaInstance, {
  get(_, prop) {
    return _logger[prop as keyof ConsolaInstance];
  },
});

export function setSilentMode(silent: boolean): void {
  _logger.level = silent ? 0 : getDefaultLevel();
}

export function withTag(tag: string): ConsolaInstance {
  return _logger.withTag(tag);
}

const _loggerPortContractCheck: LoggerPort = _logger as unknown as LoggerPort;
void _loggerPortContractCheck;

export type { ConsolaInstance } from "consola";
export { createConsola } from "consola";
