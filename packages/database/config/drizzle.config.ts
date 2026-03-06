/**
 * Drizzle Kit configuration for main database
 *
 * Usage:
 *   drizzle-kit generate --config=config/drizzle.config.ts
 *   drizzle-kit push --config=config/drizzle.config.ts
 *   drizzle-kit migrate --config=config/drizzle.config.ts
 *
 * Note: Environment variables are loaded by forge CLI before this config is read
 */

import assert from "node:assert/strict";
import type { Config } from "drizzle-kit";

// Use direct URL for migrations (port 5432), fallback to DATABASE_URL
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
assert(databaseUrl, "Missing DATABASE_URL environment variable");

const config: Config = {
  // Main database schemas (pg subdirectory)
  // Vector schemas are in schemas/vector/ and handled by drizzle-vector.config.ts
  // Avoid loading pg/index.ts re-exports and relations files to prevent duplicate schema entries.
  schema: [
    "./src/schemas/pg/ai.ts",
    "./src/schemas/pg/auth.ts",
    "./src/schemas/pg/organizations.ts",
    "./src/schemas/pg/resources.ts",
    "./src/schemas/pg/subscription.ts",
    "./src/schemas/pg/vector.ts",
  ],
  out: "./migrations/pg",
  dialect: "postgresql",
  // Limit diff/sync to business tables in public schema.
  // Prevent Drizzle from treating provider-managed schemas (e.g. auth.*) as rename candidates.
  schemaFilter: ["public"],
  dbCredentials: {
    url: databaseUrl,
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
};

export default config;
