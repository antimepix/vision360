import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

/**
 * Test connexion MySQL + infos basiques
 * GET /api/db/ping
 */
router.get("/ping", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT NOW() AS now, VERSION() AS version, DATABASE() AS database"
    );
    res.json({ ok: true, db: rows[0] });
  } catch (err) {
    console.error("DB ping error:", err);
    res.status(500).json({
      ok: false,
      error: err.code || err.message,
    });
  }
});

/**
 * Comptages simples
 * GET /api/db/stats
 */
router.get("/stats", async (req, res) => {
  try {
    const [[events]] = await pool.query("SELECT COUNT(*) AS count FROM events");
    const [[students]] = await pool.query(
      "SELECT COUNT(*) AS count FROM students"
    );
    const [[lecturers]] = await pool.query(
      "SELECT COUNT(*) AS count FROM lecturers"
    );

    res.json({
      ok: true,
      counts: {
        events: events.count,
        students: students.count,
        lecturers: lecturers.count,
      },
    });
  } catch (err) {
    console.error("DB stats error:", err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

/**
 * Quelques events + compteurs de liaisons (étudiants/groupes/salles/profs)
 * GET /api/db/events?limit=5
 */
router.get("/events", async (req, res) => {
  try {
    const limitRaw = Number(req.query.limit ?? 5);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 5;

    const [rows] = await pool.query(
      `
      SELECT
        e.id,
        e.title,
        e.starts_at,
        e.ends_at,
        (SELECT COUNT(*) FROM event_students  es WHERE es.event_id = e.id) AS students_count,
        (SELECT COUNT(*) FROM event_lecturers el WHERE el.event_id = e.id) AS lecturers_count,
        (SELECT COUNT(*) FROM event_groups    eg WHERE eg.event_id = e.id) AS groups_count,
        (SELECT COUNT(*) FROM event_resources er WHERE er.event_id = e.id) AS resources_count
      FROM events e
      ORDER BY e.starts_at DESC
      LIMIT ?
      `,
      [limit]
    );

    res.json({ ok: true, limit, events: rows });
  } catch (err) {
    console.error("DB events error:", err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

export default router;
