import mysql from "mysql2/promise";
import "dotenv/config";

export const pool = mysql.createPool({
  // Astuce Windows/WSL: préfère 127.0.0.1 à "localhost" (évite parfois une résolution IPv6 ::1).
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "vision360",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "vision360",
  waitForConnections: true,
  connectionLimit: 10,

  // Pratique pour éviter des surprises de timezone côté JS.
  // Les DATETIME/TIMESTAMP seront renvoyés en string "YYYY-MM-DD HH:MM:SS".
  dateStrings: true,
});
