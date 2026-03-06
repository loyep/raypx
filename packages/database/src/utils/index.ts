import { pgTableCreator, timestamp } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

/**
 * Table creator with optional prefix support
 * Used across all schema files for consistent table naming
 */
const prefix = process.env.DATABASE_PREFIX || "";
export const pgTable = pgTableCreator((name) => `${prefix}${name}`);

/**
 * Helper function for timestamp with timezone
 * Used across all schema files for consistent timestamp handling
 */
export const timestamptz = (name: string) =>
  timestamp(name, {
    withTimezone: true,
  });

// Re-export uuidv7 for use in schema files
export { uuidv7 };
