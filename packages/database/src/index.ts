/**
 * @raypx/database - Server-only (Node.js, Drizzle, Postgres)
 */
export type { InferInsertModel, InferSelectModel } from "drizzle-orm";
export {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  or,
  sql,
} from "drizzle-orm";

import { createClient, createClientWithConnection } from "./adapters/postgres";
import { env } from "./envs";

export * as schemas from "./schemas/pg";
export * from "./types";
export * from "./utils";
export { createClient, createClientWithConnection };

// Main database connection for long-running services.
export const db = createClient({
  databaseUrl: env.DATABASE_URL,
});
