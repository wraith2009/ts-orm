import fs from "fs";
import path from "path";
import { query } from "../db/connection";
import { time } from "console";
import { ModelRegistry } from "./ModelRegistry";
import { generateCreateTableSQL } from "./sqlGenerator";
import { tableExists } from "./Migrate";

const MIGRATION_FOLDER = path.join(__dirname, "../../migrations");
const MIGRATION_TABLE = `_migrations`;

export async function ensureMigrationTableExists() {
  await query(`
        CREATE TABLE IF NOT EXISTS "_migrations" (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
}

export async function ensureMigrationExists() {
  if (!fs.existsSync(MIGRATION_FOLDER)) {
    fs.mkdirSync(MIGRATION_FOLDER);
    console.log("Created migration folder");
  }
}

export async function listAppliedMigrations(): Promise<string[]> {
  const result = await query<{ name: string }>(
    `SELECT name FROM ${MIGRATION_TABLE}`
  );

  return result.map((r) => r.name);
}

export async function markMigrationAsApplied(name: string) {
  await query(`INSERT INTO ${MIGRATION_TABLE} (name) VALUES ($1)`, [name]);
}

export async function generateMigration() {
  ensureMigrationExists(); // makes /migrations dir
  await ensureMigrationTableExists(); // makes _migrations table

  const models = ModelRegistry.getModels();

  // STEP 1: Filter only those tables that don’t exist
  const pendingModels = [];

  for (const model of models) {
    const exists = await tableExists(model.tableName);
    if (!exists) {
      pendingModels.push(model);
    }
  }

  // STEP 2: If none pending, exit
  if (pendingModels.length === 0) {
    console.log("⚠️ No new schema changes to migrate.");
    return;
  }

  // STEP 3: Generate SQL
  const statements = pendingModels
    .map(generateCreateTableSQL)
    .filter(Boolean)
    .join("\n\n");

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .split(".")[0];

  const filename = `${timestamp}_migration.sql`;
  const filePath = path.join(MIGRATION_FOLDER, filename);

  fs.writeFileSync(filePath, statements + "\n");
  console.log(` Migration generated: ${filename}`);
}

export { MIGRATION_FOLDER, MIGRATION_TABLE };
