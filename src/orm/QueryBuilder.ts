import { query } from "../db/connection";

interface WhereClause {
  column: string;
  operator: "=" | "<" | ">" | "<=" | ">=" | "!=";
  value: any;
}

export class QueryBuilder<T = any> {
  private tableName: string;
  private whereClauses: WhereClause[] = [];
  private order: { column: string; direction: "asc" | "desc" } | null = null;
  private limitValue?: number;
  private offsetValue?: number;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  where(column: string, operator: WhereClause["operator"], value: any): this {
    this.whereClauses.push({ column, operator, value });
    return this;
  }

  orderBy(column: string, direction: "asc" | "desc" = "asc"): this {
    this.order = { column, direction };
    return this;
  }

  limit(n: number): this {
    this.limitValue = n;
    return this;
  }

  offset(n: number): this {
    this.offsetValue = n;
    return this;
  }

  toSQL(): { text: string; values: any[] } {
    let sql = `SELECT * FROM "${this.tableName}"`;
    const values: any[] = [];

    if (this.whereClauses.length > 0) {
      const conditions = this.whereClauses.map((clause, i) => {
        values.push(clause.value);
        return `"${clause.column}" ${clause.operator} $${i + 1}`;
      });
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    if (this.order) {
      sql += ` ORDER BY "${
        this.order.column
      }" ${this.order.direction.toUpperCase()}`;
    }

    if (this.limitValue !== undefined) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue !== undefined) {
      sql += ` OFFSET ${this.offsetValue}`;
    }

    return { text: sql, values };
  }

  async execute(): Promise<T[]> {
    const { text, values } = this.toSQL();
    const result = await query<T>(text, values);
    return result;
  }
}
