import pino, {
  type DestinationStream,
  type Logger as PinoLogger,
  type LoggerOptions as PinoLoggerOptions,
} from "pino";
import { getLogContext } from "./log-context";
import type { LoggerContext, LoggerOptions, LoggerPort } from "./logger-types";

type PinoLevelName = "silent" | "error" | "warn" | "info" | "debug" | "trace";

const LEVEL_NAME_TO_VALUE: Record<string, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const LEVEL_VALUE_TO_NAME: Record<number, PinoLevelName> = {
  0: "silent",
  1: "error",
  2: "warn",
  3: "info",
  4: "debug",
  5: "trace",
};

function parseLevel(level: number | string): number {
  if (typeof level === "number") return level;
  return LEVEL_NAME_TO_VALUE[level.toLowerCase()] ?? 3;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getDefaultLevel(): number {
  const envLevel = process.env.LOG_LEVEL;
  if (envLevel) {
    const numericLevel = Number.parseInt(envLevel, 10);
    if (!Number.isNaN(numericLevel)) {
      return Math.min(5, Math.max(0, numericLevel));
    }
    const normalizedLevel = envLevel.toLowerCase();
    const level = LEVEL_NAME_TO_VALUE[normalizedLevel];
    if (level !== undefined) return level;
  }
  return process.env.NODE_ENV === "production" ? 3 : 4;
}

function resolveFormat(format: LoggerOptions["format"] = "auto"): "json" | "pretty" {
  if (format === "json" || format === "pretty") return format;
  return process.env.NODE_ENV === "production" ? "json" : "pretty";
}

function createDestination(options: LoggerOptions): DestinationStream | undefined {
  if (resolveFormat(options.format) !== "pretty") return undefined;
  return pino.transport({
    target: "pino-pretty",
    options: {
      colorize: options.colors ?? true,
      translateTime: options.timestamp === false ? false : "SYS:standard",
      ignore: options.compact ? "pid,hostname" : undefined,
      messageFormat: "{msg}",
      singleLine: options.compact ?? false,
    },
  });
}

function createPinoInstance(options: LoggerOptions = {}, bindings: LoggerContext = {}): PinoLogger {
  const resolvedLevel = options.level !== undefined ? parseLevel(options.level) : getDefaultLevel();
  const format = resolveFormat(options.format);

  const loggerOptions: PinoLoggerOptions = {
    level: LEVEL_VALUE_TO_NAME[resolvedLevel],
    enabled: resolvedLevel > 0,
    base: {
      service: process.env.SERVICE_NAME ?? "raypx",
      environment: process.env.NODE_ENV ?? "development",
      ...bindings,
    },
    timestamp: options.timestamp === false ? false : pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
      bindings: (baseBindings) => baseBindings,
    },
  };

  if (format === "pretty") {
    loggerOptions.base = options.compact
      ? bindings
      : {
          service: process.env.SERVICE_NAME ?? "raypx",
          environment: process.env.NODE_ENV ?? "development",
          ...bindings,
        };
  }

  return pino(loggerOptions, createDestination(options));
}

class PinoLoggerPort implements LoggerPort {
  constructor(
    private readonly pinoLogger: PinoLogger,
    private readonly options: LoggerOptions = {},
  ) {}

  get level(): number {
    const level = this.pinoLogger.level as PinoLevelName;
    return LEVEL_NAME_TO_VALUE[level as string] ?? 3;
  }

  set level(value: number) {
    const normalized = Math.min(5, Math.max(0, value)) as 0 | 1 | 2 | 3 | 4 | 5;
    const name = LEVEL_VALUE_TO_NAME[normalized];
    if (name) this.pinoLogger.level = name;
  }

  private write(level: Exclude<PinoLevelName, "silent">, message: unknown, args: unknown[]): void {
    const payload: Record<string, unknown> = { ...getLogContext() };
    const rest: unknown[] = [];
    let error: Error | undefined;
    let text: string | undefined;

    const consume = (value: unknown): void => {
      if (value instanceof Error) {
        error ??= value;
        text ??= value.message;
        return;
      }
      if (typeof value === "string") {
        text = text ? `${text} ${value}` : value;
        return;
      }
      if (isRecord(value)) {
        Object.assign(payload, value);
        return;
      }
      if (value !== undefined) rest.push(value);
    };

    consume(message);
    for (const arg of args) consume(arg);
    if (rest.length > 0) payload.args = rest;
    if (error) payload.err = error;

    if (text !== undefined && Object.keys(payload).length > 0) {
      this.pinoLogger[level](payload, text);
      return;
    }
    if (text !== undefined) {
      this.pinoLogger[level](text);
      return;
    }
    if (Object.keys(payload).length > 0) {
      this.pinoLogger[level](payload);
      return;
    }
    this.pinoLogger[level]("");
  }

  trace(message: unknown, ...args: unknown[]): void {
    this.write("trace", message, args);
  }
  debug(message: unknown, ...args: unknown[]): void {
    this.write("debug", message, args);
  }
  info(message: unknown, ...args: unknown[]): void {
    this.write("info", message, args);
  }
  warn(message: unknown, ...args: unknown[]): void {
    this.write("warn", message, args);
  }
  error(message: unknown, ...args: unknown[]): void {
    this.write("error", message, args);
  }
  success(message: unknown, ...args: unknown[]): void {
    this.write("info", message, args);
  }
  log(message: unknown, ...args: unknown[]): void {
    this.write("info", message, args);
  }
  withTag(tag: string): LoggerPort {
    return new PinoLoggerPort(this.pinoLogger.child({ tag }), this.options);
  }
}

let _logger: LoggerPort = new PinoLoggerPort(createPinoInstance());

export function getLogger(): LoggerPort {
  return _logger;
}

export function setLogger(newLogger: LoggerPort): void {
  _logger = newLogger;
}

export function createLogger(options: LoggerOptions = {}): LoggerPort {
  const bindings = options.tag ? { tag: options.tag } : {};
  return new PinoLoggerPort(createPinoInstance(options, bindings), options);
}

export const logger = new Proxy({} as LoggerPort, {
  get(_, prop) {
    return _logger[prop as keyof LoggerPort];
  },
  set(_, prop, value) {
    _logger[prop as keyof LoggerPort] = value;
    return true;
  },
});

export function setSilentMode(silent: boolean): void {
  _logger.level = silent ? 0 : getDefaultLevel();
}

export function withTag(tag: string): LoggerPort {
  return _logger.withTag(tag);
}
