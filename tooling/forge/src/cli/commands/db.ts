import { type RunOptions, runCommand } from "../runner";
import { logger, PROJECT_ROOT } from "../utils";

export type DbOperation = "generate" | "push" | "migrate" | "studio" | "pull" | "seed";

const DRIZZLE_OPERATIONS = ["generate", "push", "migrate", "studio", "pull"] as const;
const CUSTOM_OPERATIONS = ["seed"] as const;
const DB_OPERATIONS: readonly DbOperation[] = [...DRIZZLE_OPERATIONS];

const DB_DIR = `${PROJECT_ROOT}/packages/database`;

export interface DbOptions extends RunOptions {}

function validateDbInput(operation: string): asserts operation is DbOperation {
  const validOperations = [...DB_OPERATIONS, ...CUSTOM_OPERATIONS] as const;
  if (!validOperations.includes(operation as DbOperation)) {
    throw new Error(`Invalid operation: ${operation}. Valid: ${validOperations.join(", ")}`);
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

export async function runDbOperation(operation: string, options: DbOptions = {}): Promise<void> {
  validateDbInput(operation);

  logger.info(`Running db ${operation}...`);
  await runCommand(buildDbCommand(operation), options);
  logger.success(`✓ db ${operation} completed`);
}
