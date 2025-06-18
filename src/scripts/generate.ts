import "../models";
import { generateMigration } from "../orm/MigrationManager";

(async () => {
  try {
    await generateMigration();
  } catch (err) {
    console.error(" Migration generation failed:", err);
    process.exit(1);
  }
})();
