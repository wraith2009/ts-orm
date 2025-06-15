import { testConnection } from "./db/connection";

testConnection().catch((err) => {
  console.error("DB connection failed:", err);
});
