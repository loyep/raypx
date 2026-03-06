import { type ConsolaInstance, createConsola } from "consola";

/**
 * Log levels for the logger
 * 0: silent (fatal only)
 * 1: error
 * 2: warn
 * 3: info (default for production)
 * 4: debug (default for development)
 * 5: trace
 */
export type LogLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Log level names
 */
export type LogLevelName = "silent" | "error" | "warn" | "info" | "debug" | "trace";

/**
 * Logger context for structured logging
 */
export interface LoggerContext {
  [key: string]: unknown;
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  /**
   * Log level (0-5 or name)
   */
  level?: LogLevel | LogLevelName;

  /**
   * Enable colors in output
   */
  colors?: boolean;

  /**
   * Show timestamp
   */
  timestamp?: boolean;

  /**
   * Compact output mode
   */
  compact?: boolean;

  /**
   * Tag for the logger
   */
  tag?: string;
}

/**
 * Map log level name to number
 */
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

/**
 * Get default log level based on environment
 */
function getDefaultLevel(): number {
  const envLevel = process.env.LOG_LEVEL;
  if (envLevel) {
    const parsed = Number.parseInt(envLevel, 10);
    if (!isNaN(parsed)) return Math.min(5, Math.max(0, parsed));
  }
  return process.env.NODE_ENV === "production" ? 3 : 4;
}

/**
 * Internal logger instance
 * Can be replaced via setLogger() for testing or custom configurations
 */
let _logger: ConsolaInstance = createConsola({
  level: getDefaultLevel(),
  formatOptions: {
    colors: true,
    date: true,
    compact: false,
  },
});

/**
 * Get the current logger instance
 */
export function getLogger(): ConsolaInstance {
  return _logger;
}

/**
 * Replace the logger instance
 * Useful for testing or providing custom logger configurations
 */
export function setLogger(newLogger: ConsolaInstance): void {
  _logger = newLogger;
}

/**
 * Create a new logger instance with custom options
 */
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

/**
 * Global logger instance with backward compatibility
 * Uses Proxy to delegate all calls to the current logger instance
 */
export const logger = new Proxy({} as ConsolaInstance, {
  get(_, prop) {
    return _logger[prop as keyof ConsolaInstance];
  },
});

/**
 * Set logger to silent mode (only error messages will be shown)
 */
export function setSilentMode(silent: boolean): void {
  _logger.level = silent ? 0 : getDefaultLevel();
}

/**
 * Create a child logger with a tag
 */
export function withTag(tag: string): ConsolaInstance {
  return _logger.withTag(tag);
}

export type { ConsolaInstance } from "consola";
// Re-export consola types and utilities
export { createConsola } from "consola";
