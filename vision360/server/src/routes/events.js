import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeDateTime(input) {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  // ISO -> "YYYY-MM-DD HH:MM:SS" (en UTC)
  if (s.includes("T")) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 19).replace("T", " ");
  }

  // "YYYY-MM-DD" -> début de journée
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s} 00:00:00`;

  // "YYYY-MM-DD HH:MM" -> ajoute ":00"
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/.test(s)) return `${s}:00`;

  // fallback (laisse MySQL parser)
  return s;
}

// GET /api/events?start=2025-11-10&end=2025-11-15&resourceId=105&q=AP5
router.get("/", async (req, res) => {
  try {
    const start = normalizeDateTime(req.query.start);
    const end = normalizeDateTime(req.query.end);
    const resourceId = req.query.resourceId ? toInt(req.query.resourceId, NaN) : null;
    const lecturerId = req.query.lecturerId ? toInt(req.query.lecturerId, NaN) : null;
    const q = (req.query.q ?? "").toString().trim();
    const limit = Math.min(Math.max(toInt(req.query.limit, 200), 1), 1000);
    const offset = Math.max(toInt(req.query.offset, 0), 0);

    let sql = `
      SELECT
        e.ID,
        e.title,
        e.debut,
        e.fin,
        e.allday,
        e.editable,
        e.classs_name,
        e.id_1 AS lecturerId,
        l.firstname AS lecturerFirstName,
        l.lastname AS lecturerLastName,
        e.ID_2 AS resourceId,
        r.code AS resourceCode,
        r.label AS resourceLabel,
        COUNT(DISTINCT a.ID_1) AS studentCount
      FROM event e
      LEFT JOIN lecturers l ON l.id = e.id_1
      LEFT JOIN resources r ON r.ID = e.ID_2
      LEFT JOIN asso_1 a ON a.ID = e.ID
    `;

    const where = [];
    const params = [];

    // Filtre "overlap" (évènements qui croisent l'intervalle)
    if (start && end) {
      where.push("e.debut < ? AND e.fin > ?");
      params.push(end, start);
    } else if (start) {
      where.push("e.fin > ?");
      params.push(start);
    } else if (end) {
      where.push("e.debut < ?");
      params.push(end);
    }

    if (Number.isFinite(resourceId)) {
      where.push("e.ID_2 = ?");
      params.push(resourceId);
    }

    if (Number.isFinite(lecturerId)) {
      where.push("e.id_1 = ?");
      params.push(lecturerId);
    }

    if (q) {
      where.push("e.title LIKE ?");
      params.push(`%${q}%`);
    }

    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;

    sql += " GROUP BY e.ID ORDER BY e.debut ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, events: rows, limit, offset, start, end });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

// GET /api/events/66127007
router.get("/:id", async (req, res) => {
  try {
    const id = toInt(req.params.id, NaN);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: "Invalid id" });

    const [rows] = await pool.query(
      `
      SELECT
        e.ID,
        e.title,
        e.debut,
        e.fin,
        e.allday,
        e.editable,
        e.classs_name,
        e.id_1 AS lecturerId,
        l.firstname AS lecturerFirstName,
        l.lastname AS lecturerLastName,
        e.ID_2 AS resourceId,
        r.code AS resourceCode,
        r.label AS resourceLabel,
        COUNT(DISTINCT a.ID_1) AS studentCount
      FROM event e
      LEFT JOIN lecturers l ON l.id = e.id_1
      LEFT JOIN resources r ON r.ID = e.ID_2
      LEFT JOIN asso_1 a ON a.ID = e.ID
      WHERE e.ID = ?
      GROUP BY e.ID
      `,
      [id]
    );

    const event = rows[0];
    if (!event) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

// GET /api/events/66127007/students
router.get("/:id/students", async (req, res) => {
  try {
    const id = toInt(req.params.id, NaN);
    if (!Number.isFinite(id)) return res.status(400).json({ ok: false, error: "Invalid id" });

    const limit = Math.min(Math.max(toInt(req.query.limit, 500), 1), 5000);
    const offset = Math.max(toInt(req.query.offset, 0), 0);

    const [rows] = await pool.query(
      `
      SELECT DISTINCT
        s.ID,
        s.firstname,
        s.lastname,
        s.junia_BDX,
        s.next_junia,
        s.intere_promo
      FROM asso_1 a
      JOIN student s ON s.ID = a.ID_1
      WHERE a.ID = ?
      ORDER BY s.lastname ASC, s.firstname ASC
      LIMIT ? OFFSET ?
      `,
      [id, limit, offset]
    );

    res.json({ ok: true, students: rows, limit, offset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

export default router;
