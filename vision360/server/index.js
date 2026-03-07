import "dotenv/config";
import app from "./app.js";
import { pool } from "./src/db.js";

const PORT = process.env.PORT || 3001;

// Test DB connection at startup (non-blocking)
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ MySQL connected (${process.env.DB_NAME || "vision360"})`);
    conn.release();
  } catch (err) {
    console.warn("⚠️  MySQL non disponible:", err.message);
    console.warn("   → Les routes nécessitant la BDD (Refresh, export) ne fonctionneront pas.");
    console.warn("   → Les routes fichiers (auth, outlook) restent actives.");
  }
})();

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
