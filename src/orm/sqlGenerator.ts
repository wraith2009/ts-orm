import { TableSchema, ColumnDefinition } from "./ModelRegistry";

const typeMap: Record<string, string> = {
  int: "INTEGER",
  text: "TEXT",
  string: "VARCHAR",
  boolean: "BOOLEAN",
  float: "REAL",
  double: "DOUBLE PRECISION",
  decimal: "DECIMAL",
  date: "DATE",
  datetime: "TIMESTAMP",
  timestamp: "TIMESTAMP",
  json: "JSON",
};

function columnToSQL(columnName: string, col: ColumnDefinition): string {
  let parts = [`"${columnName}"`]; // ✅ only quotes around column name

  const sqlType = typeMap[col.type];
  if (!sqlType) throw new Error(`Unknown column type: ${col.type}`);
  parts.push(sqlType);

  if (col.primaryKey) parts.push("PRIMARY KEY");
  if (col.unique) parts.push("UNIQUE");
  if (col.nullable === false) parts.push("NOT NULL");

  return parts.join(" ");
}

export function generateCreateTableSQL(schema: TableSchema): string {
  const { tableName, columns } = schema;

  const columnDefs = Object.entries(columns).map(([colName, colDef]) =>
    columnToSQL(colName, colDef)
  );

  const joinedCols = columnDefs.join(",\n  ");
  return `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${joinedCols}\n);`;
}
