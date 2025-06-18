/**
 * Defines and registers a new model (i.e., a database table) with its column schema.
 *
 * This function serves as the entry point to declare a model in the ORM system.
 * It:
 * - Registers the model and its column definitions in the `ModelRegistry`
 * - Returns a model interface object with metadata and basic interaction methods
 *
 * @template T - The shape of the model as a record of column names to types
 *
 * @param {string} tableName - The name of the model/table (e.g., "User", "Post")
 * @param {Record<keyof T, any>} columns - The column definitions for this model.
 * Should map each field name to a column definition created via `DataTypes`.
 *
 * @returns {{
 *   tableName: string;
 *   columns: Record<keyof T, any>;
 *   findAll: () => void;
 * }} An object containing:
 * - `tableName`: the model's name
 * - `columns`: the registered column definitions
 * - `findAll`: a dummy method simulating fetching all records (logs to console)
 *
 * @example
 * const User = defineModel("User", {
 *   id: DataTypes.int({ primaryKey: true }),
 *   name: DataTypes.string({ maxLength: 100 }),
 *   email: DataTypes.string({ unique: true }),
 * });
 *
 * User.findAll(); // Logs: Finding all from User
 */

import { query } from "../db/connection";
import { ModelRegistry } from "./ModelRegistry";
import { QueryBuilder } from "./QueryBuilder";

/**
 * Defines and registers a new model (i.e., a database table) with its column schema.
 * Includes basic CRUD operations: create, find, update, delete.
 */
export function defineModel<T extends Record<string, any>>(
  tableName: string,
  columns: Record<keyof T, any>
) {
  ModelRegistry.registerModel(tableName, columns);

  return {
    tableName,

    async create(data: Partial<T>): Promise<T> {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`);

      const sql = `INSERT INTO "${tableName}" (${keys
        .map((k) => `"${k}"`)
        .join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *;`;

      const result = await query<T>(sql, values);
      return result[0];
    },

    async find(where: Partial<T> = {}): Promise<T[]> {
      const keys = Object.keys(where);
      const values: any[] = [];

      let sql = `SELECT * FROM "${tableName}"`;

      if (keys.length > 0) {
        const clauses = keys.map((key, i) => `"${key}" = $${i + 1}`);
        sql += ` WHERE ${clauses.join(" AND ")}`;
        values.push(...keys.map((key) => where[key as keyof T]));
      }

      const result = await query<T>(sql, values);
      return result;
    },

    async update(where: Partial<T>, data: Partial<T>): Promise<T[]> {
      const whereKeys = Object.keys(where);
      const dataKeys = Object.keys(data);

      if (whereKeys.length === 0)
        throw new Error("Missing WHERE clause in update");
      if (dataKeys.length === 0) throw new Error("No update data provided");

      const setClauses = dataKeys.map((key, i) => `"${key}" = $${i + 1}`);
      const whereClauses = whereKeys.map(
        (key, i) => `"${key}" = $${i + 1 + dataKeys.length}`
      );

      const sql = `
        UPDATE "${tableName}"
        SET ${setClauses.join(", ")}
        WHERE ${whereClauses.join(" AND ")}
        RETURNING *;
      `;

      const values = [
        ...dataKeys.map((k) => data[k as keyof T]),
        ...whereKeys.map((k) => where[k as keyof T]),
      ];

      const result = await query<T>(sql.trim(), values);
      return result;
    },

    async delete(where: Partial<T>): Promise<number> {
      const keys = Object.keys(where);
      if (keys.length === 0) throw new Error("Missing WHERE clause in delete");

      const clauses = keys.map((key, i) => `"${key}" = $${i + 1}`);
      const sql = `DELETE FROM "${tableName}" WHERE ${clauses.join(" AND ")}`;

      const values = keys.map((k) => where[k as keyof T]);

      const result = await query<T>(sql, values);
      return result.length;
    },

    hasMany(relatedModel: any, foreignKey: string) {
      return async (userId: any) => {
        return relatedModel.find({ [foreignKey]: userId });
      };
    },

    belongsTo(relatedModel: any, foreignKey: string) {
      return async (record: T) => {
        const foreignId = record[foreignKey];
        return foreignId ? relatedModel.find({ id: foreignId }) : null;
      };
    },

    query: () => new QueryBuilder<T>("users"),
  };
}
