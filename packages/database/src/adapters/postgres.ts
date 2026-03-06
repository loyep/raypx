import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresType, Sql } from "postgres";
import postgres from "postgres";
import * as schema from "../schemas/pg";
import { relations } from "../schemas/pg/relations";
import type { DatabaseClient, DatabaseClientWithConnection, DatabaseConfig } from "../types";
import { DRIZZLE_CONFIG } from ".";

const DEFAULT_CLOSE_TIMEOUT = 5;

export const createClientWithConnection = ({
  databaseUrl,
  postgresOptions,
  closeTimeout = DEFAULT_CLOSE_TIMEOUT,
}: DatabaseConfig): DatabaseClientWithConnection => {
  const client = postgres(databaseUrl, postgresOptions) as Sql<Record<string, PostgresType>>;
  const db = drizzle({
    client,
    ...DRIZZLE_CONFIG,
    schema,
    relations,
  });

  return {
    db,
    client,
    close: async (options) => {
      await client.end({ timeout: options?.timeout ?? closeTimeout });
    },
  };
};

export const createClient = (options: DatabaseConfig): DatabaseClient =>
  createClientWithConnection(options).db;
