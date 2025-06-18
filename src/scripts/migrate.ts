import "../models";
import { testConnection } from "../db/connection";
import { applyMigrations } from "../orm/MigrationManager";

(async () => {
  try {
    await testConnection();
    await applyMigrations();
  } catch (err) {
    console.error(" Migration application failed:", err);
    process.exit(1);
  }
})();
