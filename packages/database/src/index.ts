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

import { createClient } from "./adapters/postgres";
import * as schemas from "./schemas/pg";

export * as schemas from "./schemas/pg";
export * from "./services/config";
export * from "./types";
export * from "./utils";

import { envs } from "./envs";

// Main database connection
export const db = createClient<typeof schemas>({
  databaseUrl: envs().DATABASE_URL,
  schema: schemas,
});
