import mysql from "mysql2/promise";
import "dotenv/config";

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "vision360",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "vision360",
  waitForConnections: true,
  connectionLimit: 10,
});
