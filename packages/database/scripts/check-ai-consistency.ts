import postgres from "postgres";

type RowCount = {
  count: string;
};

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL is required");
}

const sql = postgres(databaseUrl);
const writeOut = (message: string) => process.stdout.write(`${message}\n`);
const writeErr = (message: string) => process.stderr.write(`${message}\n`);

async function fetchCount(query: postgres.PendingQuery<RowCount[]>): Promise<number> {
  const rows = await query;
  const countText = rows[0]?.count ?? "0";
  return Number(countText);
}

async function main() {
  const checks = [
    {
      id: "orphan_messages",
      severity: "critical",
      description: "Messages referencing missing conversations",
      value: await fetchCount(sql<RowCount[]>`
        SELECT COUNT(*)::text AS count
        FROM ai_messages m
        LEFT JOIN ai_conversations c ON c.id = m.conversation_id
        WHERE c.id IS NULL
      `),
    },
    {
      id: "orphan_conversations",
      severity: "critical",
      description: "Conversations referencing missing users",
      value: await fetchCount(sql<RowCount[]>`
        SELECT COUNT(*)::text AS count
        FROM ai_conversations c
        LEFT JOIN "user" u ON u.id = c.user_id
        WHERE u.id IS NULL
      `),
    },
    {
      id: "error_without_code",
      severity: "warn",
      description: "Error call logs with missing error_code",
      value: await fetchCount(sql<RowCount[]>`
        SELECT COUNT(*)::text AS count
        FROM ai_call_logs
        WHERE status = 'error' AND error_code IS NULL
      `),
    },
    {
      id: "missing_request_id",
      severity: "warn",
      description: "AI call logs with missing request_id",
      value: await fetchCount(sql<RowCount[]>`
        SELECT COUNT(*)::text AS count
        FROM ai_call_logs
        WHERE route IN ('ai.chat', 'ai.chatStream') AND (request_id IS NULL OR request_id = '')
      `),
    },
    {
      id: "empty_conversation_messages",
      severity: "warn",
      description: "Conversations without messages",
      value: await fetchCount(sql<RowCount[]>`
        SELECT COUNT(*)::text AS count
        FROM ai_conversations c
        LEFT JOIN ai_messages m ON m.conversation_id = c.id
        WHERE m.id IS NULL
      `),
    },
    {
      id: "assistant_without_user",
      severity: "warn",
      description: "Assistant messages in conversations with no user message",
      value: await fetchCount(sql<RowCount[]>`
        SELECT COUNT(*)::text AS count
        FROM ai_messages m
        WHERE m.role = 'assistant'
          AND NOT EXISTS (
            SELECT 1
            FROM ai_messages mu
            WHERE mu.conversation_id = m.conversation_id
              AND mu.role = 'user'
          )
      `),
    },
  ] as const;

  const totalCritical = checks
    .filter((check) => check.severity === "critical")
    .reduce((acc, check) => acc + check.value, 0);
  const totalWarn = checks
    .filter((check) => check.severity === "warn")
    .reduce((acc, check) => acc + check.value, 0);

  writeOut("[ai-check] AI consistency report");
  for (const check of checks) {
    const marker = check.severity === "critical" ? "CRITICAL" : "WARN";
    writeOut(
      `${marker.padEnd(8)} ${check.id.padEnd(28)} ${String(check.value).padStart(6)}  ${check.description}`,
    );
  }
  writeOut(
    `[ai-check] summary critical=${totalCritical} warn=${totalWarn} checks=${checks.length}`,
  );

  if (totalCritical > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    writeErr(
      `[ai-check] failed: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
