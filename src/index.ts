import { testConnection } from "./db/connection";
import { defineModel } from "./orm/defineModel";
import { DataTypes } from "./orm/DataTypes";
import { generateCreateTableSQL } from "./orm/sqlGenerator";
import { ModelRegistry } from "./orm/ModelRegistry";
import { migrate } from "./orm/Migrate";

async function main() {
  await testConnection().catch((err) => {
    console.error("DB connection failed:", err);
  });
}

main();

const User = defineModel("users", {
  id: DataTypes.int({ primaryKey: true }),
  name: DataTypes.text({ nullable: false }),
  email: DataTypes.text({ unique: true }),
});

defineModel("managers", {
  id: DataTypes.int({ autoIncrement: true, primaryKey: true }),
  name: DataTypes.text({ nullable: false }),
});

async function testMigrate() {
  await migrate();
}

testMigrate();

// const schema = ModelRegistry.getModel("users");
// if (schema) {
//   const sql = generateCreateTableSQL(schema);
//   console.log(sql);
// } else {
//   console.log(" Model not found in registry.");
// }
async function query() {
  // await User.create({ id: 1, name: "Rahul", email: "rahul@example.com" });

  // Use find
  const results = await User.find({ email: "rahul@example.com" });
  console.log(" Found users:", results);

  await User.update({ email: "rahul@example.com" }, { name: "Updated rahul" });

  // Delete
  await User.delete({ email: "rahul@example.com" });
}
query();
