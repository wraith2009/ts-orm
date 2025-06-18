import { query } from "../db/connection";

export async function getTableColumns(tableName: string): Promise<
  {
    column_name: string;
    data_type: string;
    is_nullable: "YES" | "NO";
  }[]
> {
  const result = await query<{
    column_name: string;
    data_type: string;
    is_nullable: "YES" | "NO";
  }>(
    `SELECT column_name, data_type, is_nullable
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
       ORDER BY ordinal_position`,
    [tableName]
  );

  return result;
}
