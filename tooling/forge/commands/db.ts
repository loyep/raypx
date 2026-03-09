import { type RunOptions, runCommand } from "../libs/runner";
import { logger, PROJECT_ROOT } from "../libs/utils";

/**
 * Database operation types
 */
export type DbOperation = "generate" | "push" | "migrate" | "studio" | "pull" | "seed";

const DRIZZLE_OPERATIONS = ["generate", "push", "migrate", "studio", "pull"] as const;
const CUSTOM_OPERATIONS = ["seed"] as const;
const DB_OPERATIONS: readonly DbOperation[] = [...DRIZZLE_OPERATIONS, ...CUSTOM_OPERATIONS];

const DB_DIR = `${PROJECT_ROOT}/packages/database`;

/**
 * Options for database operations
 */
export interface DbOptions extends RunOptions {}

function validateDbInput(operation: string): asserts operation is DbOperation {
  if (!DB_OPERATIONS.includes(operation as DbOperation)) {
    throw new Error(`Invalid operation: ${operation}. Valid: ${DB_OPERATIONS.join(", ")}`);
  }
}

function buildDbCommand(operation: DbOperation) {
  if (operation === "seed") {
    return {
      command: "node",
      args: ["--import", "tsx", "seed/seed.ts"],
      cwd: DB_DIR,
    };
  }

  return {
    command: "pnpm",
    args: ["exec", "drizzle-kit", operation, "--config=config/drizzle.config.ts"],
    cwd: DB_DIR,
  };
}

/**
 * Run a database operation
 */
export async function runDbOperation(operation: string, options: DbOptions = {}): Promise<void> {
  validateDbInput(operation);

  logger.info(`Running db ${operation}...`);
  await runCommand(buildDbCommand(operation), options);
  logger.success(`DB ${operation} completed`);
}
