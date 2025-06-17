//model registry stores all user-defined models so that :
// - You can **generate SQL migrations** from them
// - You can **validate queries** against defined schemas
// - You can **introspect all models** during runtime

/**
 * Represents the structure and constraints of a single column
 * in a database table schema.
 *
 * This is used in model definitions to describe the type and
 * constraints (e.g., primary key, uniqueness, nullability)
 * for each field in a user-defined model.
 *
 * @typedef {Object} ColumnDefinition
 * @property {string} type - The data type of the column (e.g., 'string', 'int', 'boolean').
 * @property {boolean} [primaryKey] - Whether this column is a primary key.
 * @property {boolean} [unique] - Whether this column has a unique constraint.
 * @property {boolean} [nullable] - Whether this column allows null values.
 */
export type ColumnDefinition = {
  type: string;
  primaryKey?: boolean;
  unique?: boolean;
  nullable?: boolean;
};

/**
 * Represents the full schema of a database table, including
 * its name and all its columns.
 *
 * Used to register and introspect user-defined models.
 * Enables features such as SQL migration generation,
 * query validation, and runtime model introspection.
 *
 * @typedef {Object} TableSchema
 * @property {string} tableName - The name of the table.
 * @property {Record<string, ColumnDefinition>} columns - A mapping of column names to their definitions.
 * @example
 *  {
 *    id: { type: 'int', primaryKey: true },
 *    name: { type: 'text', nullable: false }
 *  }
 */

export type TableSchema = {
  tableName: string;
  columns: Record<string, ColumnDefinition>;
};

/**
 * An in-memory registry that stores all user-defined table schemas.
 *
 * This registry acts as a central store for models defined in the application.
 * It enables key functionality such as:
 * - **SQL migration generation**: by comparing registered schemas against existing DB state.
 * - **Query validation**: by checking query fields/types against the schema.
 * - **Runtime introspection**: allowing tools or utilities to inspect all models dynamically.
 *
 * The map keys are table names, and the values are the corresponding {@link TableSchema} objects.
 *
 * @type {Map<string, TableSchema>}
 */
const modelRegistry = new Map<string, TableSchema>();

/**
 * A utility wrapper around the internal `modelRegistry` map.
 *
 * Provides methods to register and retrieve user-defined table schemas.
 * Used for managing the ORM's model definitions at runtime.
 *
 * Features:
 * - `registerModel`: Adds a new model to the registry.
 * - `getModels`: Returns all registered models as an array.
 * - `getModel`: Retrieves a single model by table name.
 */
export const ModelRegistry = {
  /**
   * Registers a new model (table schema) into the in-memory registry.
   * If a model with the same table name already exists, it will be overwritten.
   *
   * @param {string} tableName - The name of the table to register.
   * @param {Record<string, ColumnDefinition>} columns - A map of column names to their definitions.
   */
  registerModel: (
    tableName: string,
    columns: Record<string, ColumnDefinition>
  ) => {
    modelRegistry.set(tableName, { tableName, columns });
  },

  /**
   * Retrieves all registered models in the registry.
   *
   * @returns {TableSchema[]} An array of all defined table schemas.
   */

  getModels: () => Array.from(modelRegistry.values()),

  /**
   * Fetches a specific model by its table name.
   *
   * @param {string} tableName - The name of the model to retrieve.
   * @returns {TableSchema | undefined} The schema if found, otherwise undefined.
   */

  getModel: (tableName: string) => modelRegistry.get(tableName),
};

/**
 * Example:
 *
 * // Registering a "User" model with columns
 * ModelRegistry.registerModel("User", {
 *   id: {
 *     type: "int",
 *     primaryKey: true
 *   },
 *   name: {
 *     type: "string"
 *   },
 *   email: {
 *     type: "string",
 *     unique: true
 *   }
 * });
 *
 * Internally, this is stored in `modelRegistry` like:
 *
 * {
 *   "User": {
 *     tableName: "User",
 *     columns: {
 *       id: {
 *         type: "int",
 *         primaryKey: true
 *       },
 *       name: {
 *         type: "string"
 *       },
 *       email: {
 *         type: "string",
 *         unique: true
 *       }
 *     }
 *   }
 * }
 *
 * This enables:
 * - SQL migration generation (e.g., `CREATE TABLE`)
 * - Query validation (e.g., rejecting invalid fields)
 * - Form or API auto-generation based on column metadata
 *
 * It's functionally similar to how Prisma internally tracks model definitions,
 * and acts as the schema engine for your custom ORM.
 */
