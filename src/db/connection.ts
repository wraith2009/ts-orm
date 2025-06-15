import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Executes a parameterized SQL query using the PostgreSQL connection pool.
 *
 * This function serves as the low-level query executor for ORM.
 * It connects to the database via a shared connection pool and returns
 * the resulting rows as an array of typed objects.
 *
 * @template T - The expected shape of the result rows.
 *
 * @param {string} text - The SQL query string, optionally with placeholders (e.g., `$1`, `$2`).
 * @param {any[]} [params] - An optional array of parameter values to safely inject into the query.
 *
 * @returns {Promise<T[]>} A promise that resolves to an array of result rows, typed as T.
 *
 * @example
//  * // Basic SELECT example
 * const users = await query<{ id: number; name: string }>(
 *   "SELECT id, name FROM users WHERE active = $1",
 *   [true]
 * );
 *
 * @example
//  * // INSERT example
 * await query("INSERT INTO posts (title, content) VALUES ($1, $2)", [
 *   "Hello World",
 *   "My first blog post"
 * ]);
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows;
}

export async function testConnection() {
  const result = await query("SELECT NOW()");
  console.log("connected at:", result[0].now);
}
