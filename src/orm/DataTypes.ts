/**
 * Base options shared across all column data types.
 *
 * These represent constraints and metadata applied to any column type.
 */
interface BaseOptions {
  /** Marks the column as a primary key */
  primaryKey?: boolean;
  /** Allows null values if true (overridden by notNull) */
  nullable?: boolean;
  /** Marks the column as unique */
  unique?: boolean;
  /** Disallows null values */
  notNull?: boolean;
  /** Default value to be inserted if not provided */
  defaultValue?: any;
  /** SQL raw string to be used as the default */
  defaultRaw?: string;
  /** Adds an index on this column (true or index name) */
  index?: boolean | string;
  /** Type of index to be used */
  indexType?: "BTREE" | "HASH" | "FULLTEXT";
  /** Comment describing the column */
  comment?: string;
  /** SQL CHECK constraint expression */
  check?: string;
  /** Foreign key reference options */
  references?: {
    table: string;
    column: string;
    onDelete?: "CASCADE" | "SET NULL" | "RESTRICT";
    onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT";
  };
}

/**
 * Options specific to string/text columns.
 */
interface StringOptions extends BaseOptions {
  /** Fixed length or max length of the string */
  length?: number;
  maxLength?: number;
  minLength?: number;
  /** Allowed values (ENUM) */
  enum?: string[];
  /** Character set */
  charset?: string;
  /** Collation type */
  collation?: string;
}

/**
 * Options specific to numeric columns (int, float, decimal).
 */
interface NumericOptions extends BaseOptions {
  /** Marks the column as unsigned */
  unsigned?: boolean;
  /** Auto-increments the value (used for primary keys) */
  autoIncrement?: boolean;
  /** Total number of digits (precision) */
  precision?: number;
  /** Number of digits after the decimal point */
  scale?: number;
  /** Minimum and maximum allowed values */
  min?: number;
  max?: number;
}

/**
 * Options specific to timestamp/datetime fields.
 */
interface TimestampOptions extends BaseOptions {
  /** SQL expression to run on update (e.g., CURRENT_TIMESTAMP) */
  onUpdate?: string;
  /** Whether to include timezone info */
  timezone?: boolean;
  /** Precision for fractional seconds */
  precision?: number;
}

/**
 * Factory function to create strongly typed column definitions
 * with their respective metadata and constraints.
 *
 * @param type - Name of the SQL data type (e.g., "int", "string")
 * @returns A function that accepts options and returns a column definition
 */
const createDataType =
  <T extends BaseOptions>(type: string) =>
  (options: T = {} as T) => ({
    type,
    ...options,
  });

/**
 * Collection of predefined column data types.
 *
 * Each function returns a column definition object
 * with its associated type and allowed options.
 */
export const DataTypes = {
  /** Integer column */
  int: createDataType<NumericOptions>("int"),

  /** Variable-length string column */
  string: (options: StringOptions = {}) => ({
    type: "string",
    ...options,
  }),

  /** Text column for large strings */
  text: (options: StringOptions = {}) => ({
    type: "text",
    ...options,
  }),

  /** Boolean column (true/false) */
  boolean: (options: BaseOptions = {}) => ({
    type: "boolean",
    ...options,
  }),

  /** Floating-point number */
  float: (options: NumericOptions = {}) => ({
    type: "float",
    ...options,
  }),

  /** Double-precision floating-point */
  double: (options: NumericOptions = {}) => ({
    type: "double",
    ...options,
  }),

  /** Fixed-point decimal number */
  decimal: (options: NumericOptions = {}) => ({
    type: "decimal",
    ...options,
  }),

  /** Date (without time) */
  date: (options: BaseOptions = {}) => ({
    type: "date",
    ...options,
  }),

  /** Date and time (without timezone) */
  datetime: (options: TimestampOptions = {}) => ({
    type: "datetime",
    ...options,
  }),

  /** Timestamp (optionally with timezone) */
  timestamp: (options: TimestampOptions = {}) => ({
    type: "timestamp",
    ...options,
  }),

  /** JSON column (e.g., for dynamic or nested data) */
  json: (options: BaseOptions = {}) => ({
    type: "json",
    ...options,
  }),
};

export type { BaseOptions, StringOptions, NumericOptions, TimestampOptions };
