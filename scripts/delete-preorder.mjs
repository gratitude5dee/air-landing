#!/usr/bin/env node

import process from "node:process";
import { neon } from "@neondatabase/serverless";

const RECEIPT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_ENVIRONMENTS = new Set(["preview", "production"]);

const usage = `Usage:
  npm run data:delete-preorder -- --receipt <uuid> --environment <preview|production> --dry-run
  npm run data:delete-preorder -- --receipt <uuid> --environment <preview|production> --confirm DELETE

The command requires DATABASE_URL and an AIR_DATABASE_ENV value matching
--environment. It prints aggregate match/delete counts only.`;

function parseArgs(argv) {
  const options = {
    receipt: null,
    environment: null,
    dryRun: false,
    confirmation: null,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--dry-run") {
      if (options.dryRun) throw new Error("--dry-run may be provided only once");
      options.dryRun = true;
      continue;
    }

    if (argument === "--receipt" || argument === "--environment" || argument === "--confirm") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value`);
      }
      index += 1;

      if (argument === "--receipt") {
        if (options.receipt !== null) throw new Error("--receipt may be provided only once");
        options.receipt = value;
      } else if (argument === "--environment") {
        if (options.environment !== null) {
          throw new Error("--environment may be provided only once");
        }
        options.environment = value;
      } else {
        if (options.confirmation !== null) {
          throw new Error("--confirm may be provided only once");
        }
        options.confirmation = value;
      }
      continue;
    }

    throw new Error(`unknown argument: ${argument}`);
  }

  return options;
}

function validateOptions(options) {
  if (!options.receipt || !RECEIPT_PATTERN.test(options.receipt)) {
    throw new Error("--receipt must be a valid UUID receipt");
  }
  if (!options.environment || !ALLOWED_ENVIRONMENTS.has(options.environment)) {
    throw new Error("--environment must be preview or production");
  }

  const destructiveConfirmation = options.confirmation === "DELETE";
  if (options.confirmation !== null && !destructiveConfirmation) {
    throw new Error("destructive confirmation must be exactly: --confirm DELETE");
  }
  if (Number(options.dryRun) + Number(destructiveConfirmation) !== 1) {
    throw new Error("choose exactly one mode: --dry-run or --confirm DELETE");
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const configuredEnvironment = process.env.AIR_DATABASE_ENV?.trim();
  if (configuredEnvironment !== options.environment) {
    throw new Error("AIR_DATABASE_ENV does not match --environment");
  }

  return databaseUrl;
}

async function run() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : "invalid arguments"}`);
    console.error(usage);
    process.exitCode = 2;
    return;
  }

  if (options.help) {
    console.log(usage);
    return;
  }

  let databaseUrl;
  try {
    databaseUrl = validateOptions(options);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : "invalid configuration"}`);
    console.error(usage);
    process.exitCode = 2;
    return;
  }

  const sql = neon(databaseUrl);

  try {
    if (options.dryRun) {
      const rows = await sql`
        SELECT EXISTS (
          SELECT 1
          FROM air_preorders
          WHERE id = ${options.receipt}::uuid
        ) AS matched
      `;
      const matched = rows[0]?.matched === true ? 1 : 0;
      console.log(`mode=dry-run environment=${options.environment} matched=${matched}`);
      return;
    }

    const rows = await sql`
      DELETE FROM air_preorders
      WHERE id = ${options.receipt}::uuid
      RETURNING 1 AS deleted
    `;
    console.log(`mode=delete environment=${options.environment} deleted=${rows.length}`);
  } catch {
    console.error("Preorder deletion failed; no database, receipt, or contact details were logged.");
    process.exitCode = 1;
  }
}

await run();
