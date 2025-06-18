import type { TableSchema } from "./ModelRegistry";
import { getTableColumns } from "./getTableColumns";

export async function diffCOlumns(model: TableSchema): Promise<string[]> {
  const dbColumns = await getTableColumns(model.tableName);
  const dbColumnMap = new Map(dbColumns.map((col) => [col.column_name, col]));

  const alterStatements: string[] = [];

  for (const [columnName, columnDef] of Object.entries(model.columns)) {
    if (!dbColumnMap.has(columnName)) {
      // Only supporting ADD COLUMN for now
      const type = mapToSQLType(columnDef.type);
      const nullable = columnDef.nullable === false ? "NOT NULL" : "";
      alterStatements.push(
        `ALTER TABLE "${model.tableName}" ADD COLUMN "${columnName}" ${type} ${nullable};`
      );
    }
  }

  return alterStatements;
}

function mapToSQLType(type: string): string {
  switch (type) {
    case "int":
    case "integer":
      return "INTEGER";
    case "text":
    case "string":
      return "TEXT";
    case "boolean":
      return "BOOLEAN";
    case "float":
      return "REAL";
    case "timestamp":
      return "TIMESTAMP";
    default:
      return type.toUpperCase();
  }
}
