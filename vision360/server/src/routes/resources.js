import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// GET /api/resources?q=J10
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q ?? "").toString().trim();
    const limit = Math.min(Math.max(toInt(req.query.limit, 200), 1), 1000);
    const offset = Math.max(toInt(req.query.offset, 0), 0);

    let sql = "SELECT ID, label, code, location FROM resources";
    const params = [];

    if (q) {
      sql += " WHERE label LIKE ? OR code LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += " ORDER BY ID ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, resources: rows, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

export default router;
