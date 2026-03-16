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
  format?: "auto" | "json" | "pretty";
}
