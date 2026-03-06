/**
 * Script to drop all tables in the public schema
 * Run with: npx tsx scripts/drop-all-tables.ts
 */

import postgres from "postgres";

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL!);

async function dropAllTables() {
  try {
    console.log("Dropping all tables in public schema...");

    // Get all tables in public schema
    const tables = await sql<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;

    console.log(`Found ${tables.length} tables:`, tables.map((t) => t.tablename).join(", "));

    if (tables.length === 0) {
      console.log("No tables to drop.");
      return;
    }

    // Drop all tables with CASCADE
    for (const { tablename } of tables) {
      console.log(`Dropping table: ${tablename}`);
      await sql.unsafe(`DROP TABLE IF EXISTS "${tablename}" CASCADE`);
    }

    console.log("All tables dropped successfully!");
  } catch (error) {
    console.error("Error dropping tables:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

dropAllTables();
