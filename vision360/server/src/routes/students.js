import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// GET /api/students?q=dupont
router.get("/", async (req, res) => {
  try {
    const q = (req.query.q ?? "").toString().trim();
    const limit = Math.min(Math.max(toInt(req.query.limit, 100), 1), 1000);
    const offset = Math.max(toInt(req.query.offset, 0), 0);

    let sql = "SELECT ID, firstname, lastname, junia_BDX, next_junia, intere_promo FROM student";
    const params = [];
    if (q) {
      sql += " WHERE firstname LIKE ? OR lastname LIKE ?";
      params.push(`%${q}%`, `%${q}%`);
    }
    sql += " ORDER BY lastname ASC, firstname ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, students: rows, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

// GET /api/students/123
router.get("/:id", async (req, res) => {
  try {
    const id = toInt(req.params.id, NaN);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: "Invalid id" });

    const [rows] = await pool.query(
      "SELECT ID, firstname, lastname, junia_BDX, next_junia, intere_promo FROM student WHERE ID = ?",
      [id]
    );

    const student = rows[0];
    if (!student) return res.status(404).json({ ok: false, error: "Not found" });

    res.json({ ok: true, student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

export default router;
