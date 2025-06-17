import { query } from "../db/connection";

export async function tableExists(tableName: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      );
      `,
    [tableName]
  );

  return result[0]?.exists ?? false;
}

import { ModelRegistry } from "./ModelRegistry";
import { generateCreateTableSQL } from "./sqlGenerator";

export async function migrate(): Promise<void> {
  const models = ModelRegistry.getModels();

  for (const model of models) {
    const exists = await tableExists(model.tableName);
    if (exists) {
      console.log(`Table "${model.tableName}" already exists`);
    } else {
      const sql = generateCreateTableSQL(model);
      console.log(`🛠 creating table "${model.tableName}" ...`);
      await query(sql);
      console.log(`Created "${model.tableName}`);
    }
  }
}
