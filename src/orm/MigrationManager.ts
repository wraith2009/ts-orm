import fs from "fs";
import path from "path";
import { query } from "../db/connection";
import { time } from "console";
import { ModelRegistry } from "./ModelRegistry";
import { generateCreateTableSQL } from "./sqlGenerator";
import { tableExists } from "./Migrate";
import { diffCOlumns } from "./diffColumns";

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
  ensureMigrationExists(); // ensure /migrations dir exists
  await ensureMigrationTableExists(); // ensure _migrations table exists

  const models = ModelRegistry.getModels();

  const pendingModels = [];
  const alterTableStmts: string[] = [];

  for (const model of models) {
    const exists = await tableExists(model.tableName);
    if (!exists) {
      pendingModels.push(model);
    } else {
      const alterStatements = await diffCOlumns(model);
      if (alterStatements.length > 0) {
        alterTableStmts.push(...alterStatements);
      }
    }
  }

  // If no new models or schema changes, exit
  if (pendingModels.length === 0 && alterTableStmts.length === 0) {
    console.log("⚠️ No new schema changes to migrate.");
    return;
  }

  // Generate SQL statements
  const createStatements = pendingModels
    .map(generateCreateTableSQL)
    .filter(Boolean)
    .join("\n\n");

  const alterStatements = alterTableStmts.join("\n\n");

  const finalSQL = [createStatements, alterStatements]
    .filter(Boolean)
    .join("\n\n");

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .split(".")[0];

  const filename = `${timestamp}_migration.sql`;
  const filePath = path.join(MIGRATION_FOLDER, filename);

  fs.writeFileSync(filePath, finalSQL + "\n");
  console.log(`📦 Migration generated: ${filename}`);
}

export async function applyMigrations() {
  await ensureMigrationTableExists();
  ensureMigrationExists();

  const applied = await listAppliedMigrations();
  const files = fs
    .readdirSync(MIGRATION_FOLDER)
    .filter((f) => f.endsWith(".sql"));

  for (const file of files) {
    if (applied.includes(file)) {
      console.log(`skipping already applied: ${file}`);
      continue;
    }

    const filePath = path.join(MIGRATION_FOLDER, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    try {
      console.log(`Applyin migration: ${file}`);
      await query(sql);
      await markMigrationAsApplied(file);
      console.log(`Applied: ${file}`);
    } catch (error) {
      console.error(`Failed to apply ${file}`, error);
      process.exit(1);
    }
  }

  console.log("All migrations applied");
}

export { MIGRATION_FOLDER, MIGRATION_TABLE };
