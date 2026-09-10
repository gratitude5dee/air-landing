import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error("DATABASE_URL is required to migrate the Air waitlist schema.");
  process.exit(1);
}

const schemaPath = resolve("db/schema.sql");
if (!existsSync(schemaPath)) {
  console.error(`Schema file not found: ${schemaPath}`);
  process.exit(1);
}

const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", schemaPath], {
  stdio: "inherit",
});

if (result.error) {
  console.error(`Could not start psql: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
