import { createConsola } from "consola";
import type { DrizzleConfig } from "drizzle-orm";
import { env } from "../envs";
import type { Relations, Schema } from "../schemas/types";

const MAX_PARAM_LENGTH = 120;
const SENSITIVE_KEY_PATTERN = /(token|secret|password|authorization|cookie|email)/i;

export type DbLogParamsMode = "off" | "masked" | "full";

const maskString = (value: string): string => {
  if (value.length <= 4) return "***";
  if (value.includes("@")) {
    const [local = "", domain = ""] = value.split("@");
    return `${local.slice(0, 1)}***@${domain}`;
  }
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
};

const truncateString = (value: string): string =>
  value.length > MAX_PARAM_LENGTH ? `${value.slice(0, MAX_PARAM_LENGTH)}…` : value;

const looksSensitiveString = (value: string): boolean => {
  if (value.includes("@")) return true;
  if (value.length >= 24 && /^[A-Za-z0-9._-]+$/.test(value)) return true;
  return false;
};

const sanitizeValue = (value: unknown, keyHint?: string): unknown => {
  if (typeof value === "string") {
    const shouldMask =
      (keyHint && SENSITIVE_KEY_PATTERN.test(keyHint)) || looksSensitiveString(value);
    return shouldMask ? maskString(value) : truncateString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, keyHint));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue, key)]),
    );
  }

  return value;
};

export const sanitizeParams = (params: unknown[]): unknown[] =>
  params.map((param) => sanitizeValue(param));

export const formatLogParams = (
  params: unknown[],
  mode: DbLogParamsMode,
): unknown[] | undefined => {
  if (mode === "off") return undefined;
  if (mode === "full") return params;
  return sanitizeParams(params);
};

/**
 * Database-specific logger with [Database] tag
 */
const dbLogger = createConsola({
  level: process.env.NODE_ENV === "production" ? 3 : 4, // info in prod, debug in dev
  formatOptions: {
    colors: true,
    date: false,
    compact: true,
  },
}).withTag("Database");

/**
 * Custom logger that filters out queries for vector tables
 * Vector tables (vector_embeddings, vector_chunks) can be very verbose
 */
const createFilteredLogger = (paramsMode: DbLogParamsMode) => {
  return {
    logQuery(query: string, params: unknown[]): void {
      // Filter out all vector table queries (vector_embeddings, vector_chunks, etc.)
      const queryLower = query.toLowerCase();
      const isVectorTableQuery = queryLower.includes("vector_");

      if (isVectorTableQuery) {
        // Skip logging for vector tables
        return;
      }

      // Log other queries
      dbLogger.debug(query);
      if (params && params.length > 0) {
        const formattedParams = formatLogParams(params, paramsMode);
        if (formattedParams !== undefined) {
          dbLogger.debug("Params:", formattedParams);
        }
      }
    },
  };
};

const isDevelopment = process.env.NODE_ENV === "development";
const paramsMode = env.DB_LOG_PARAMS as DbLogParamsMode;
const shouldLogSql = isDevelopment && env.DB_LOG_SQL;

/**
 * Shared Drizzle client configuration options
 */
export const DRIZZLE_CONFIG: DrizzleConfig<Schema, Relations> = {
  casing: "snake_case",
  logger: shouldLogSql ? createFilteredLogger(paramsMode) : false,
};
