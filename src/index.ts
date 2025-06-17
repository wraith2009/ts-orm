import { testConnection } from "./db/connection";
import { defineModel } from "./orm/defineModel";
import { DataTypes } from "./orm/DataTypes";
import { generateCreateTableSQL } from "./orm/sqlGenerator";
import { ModelRegistry } from "./orm/ModelRegistry";

async function main() {
  await testConnection().catch((err) => {
    console.error("DB connection failed:", err);
  });
}

main();

defineModel("users", {
  id: DataTypes.int({ primaryKey: true }),
  name: DataTypes.text({ nullable: false }),
  email: DataTypes.text({ unique: true }),
});

const schema = ModelRegistry.getModel("users");
if (schema) {
  const sql = generateCreateTableSQL(schema);
  console.log(sql);
} else {
  console.log(" Model not found in registry.");
}
