/**
 * Defines and registers a new model (i.e., a database table) with its column schema.
 *
 * This function serves as the entry point to declare a model in the ORM system.
 * It:
 * - Registers the model and its column definitions in the `ModelRegistry`
 * - Returns a model interface object with metadata and basic interaction methods
 *
 * Future extensions may include: actual DB queries, relationships, hooks, and more.
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

import { ModelRegistry } from "./ModelRegistry";
export function defineModel<T extends Record<string, any>>(
  tableName: string,
  columns: Record<keyof T, any>
) {
  ModelRegistry.registerModel(tableName, columns);

  return {
    tableName,
    columns,
    findAll: () => {
      console.log(`Finding all from ${tableName}`);
    },
  };
}
