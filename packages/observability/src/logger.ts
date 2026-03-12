import {
  type LogLevel as CoreLogLevel,
  createLogger as createBaseLogger,
  type LoggerPort,
} from "@raypx/core/logger";

import type { LogContext, LogEntry, LogLevel } from "./types";

/**
 * Structured logger with context support
 */
export class StructuredLogger {
  private logger: LoggerPort;
  private defaultContext: LogContext;
  private serviceName: string;

  constructor(options: {
    serviceName: string;
    level?: LogLevel;
    context?: LogContext;
  }) {
    this.serviceName = options.serviceName;
    this.defaultContext = options.context ?? {};

    this.logger = createBaseLogger({
      level: this.mapLogLevel(options.level ?? "info"),
      compact: false,
      timestamp: true,
      colors: true,
    });
  }

  /**
   * Map log level to consola level
   */
  private mapLogLevel(level: LogLevel): CoreLogLevel {
    const levels: Record<LogLevel, CoreLogLevel> = {
      trace: 5,
      debug: 4,
      info: 3,
      warn: 2,
      error: 1,
      fatal: 0,
    };
    return levels[level];
  }

  /**
   * Create a log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error,
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: {
        service: this.serviceName,
        ...this.defaultContext,
        ...context,
      },
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };
  }

  /**
   * Log with context
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry = this.createEntry(level, message, context, error);
    const payload = {
      ...entry.context,
      ...(entry.error ? { error: entry.error } : {}),
    };

    switch (level) {
      case "trace":
        this.logger.trace(payload, message);
        break;
      case "debug":
        this.logger.debug(payload, message);
        break;
      case "info":
        this.logger.info(payload, message);
        break;
      case "warn":
        this.logger.warn(payload, message);
        break;
      case "error":
      case "fatal":
        this.logger.error(payload, error ?? message);
        break;
    }
  }

  /**
   * Log trace message
   */
  trace(message: string, context?: LogContext): void {
    this.log("trace", message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, context, error);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log("fatal", message, context, error);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): StructuredLogger {
    return new StructuredLogger({
      serviceName: this.serviceName,
      level: this.getLogLevel(),
      context: {
        ...this.defaultContext,
        ...context,
      },
    });
  }

  /**
   * Get current log level
   */
  private getLogLevel(): LogLevel {
    const level = this.logger.level;
    const levels: Record<number, LogLevel> = {
      5: "trace",
      4: "debug",
      3: "info",
      2: "warn",
      1: "error",
      0: "fatal",
    };
    return levels[level] ?? "info";
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.logger.level = this.mapLogLevel(level);
  }

  /**
   * Create a tagged sub-logger
   */
  withTag(tag: string): LoggerPort {
    return this.logger.withTag(tag);
  }
}

/**
 * Create a logger from environment
 */
export function createStructuredLogger(
  serviceName: string = process.env.SERVICE_NAME ?? "raypx",
  context?: LogContext,
): StructuredLogger {
  const level = (process.env.LOG_LEVEL as LogLevel) ?? "info";
  const environment = process.env.NODE_ENV ?? "development";

  return new StructuredLogger({
    serviceName,
    level,
    context: {
      environment,
      ...context,
    },
  });
}

/**
 * Default logger instance
 */
export const structuredLogger = createStructuredLogger();

// Backward-compatible aliases. Prefer the structured names from this package.
export const logger = structuredLogger;
export const createLogger = createStructuredLogger;
