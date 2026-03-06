import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { Options, PostgresType, Sql } from "postgres";
import type { Relations, Schema } from "./schemas/types";

export type DatabaseSchema = Schema;
export type DatabaseRelations = Relations;
export type DatabaseConnection = Sql<Record<string, PostgresType>>;

/**
 * Database client configuration
 */
export type DatabaseConfig = {
  databaseUrl: string;
  postgresOptions?: Options<Record<string, PostgresType>>;
  closeTimeout?: number;
};

/**
 * Database client type
 */
export type DatabaseClient = PostgresJsDatabase<Schema, Relations>;

export type DatabaseClientWithConnection = {
  db: DatabaseClient;
  client: DatabaseConnection;
  close: (options?: { timeout?: number }) => Promise<void>;
};
