import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

// Test connexion MySQL (ne dépend d’aucune table)
router.get("/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok, NOW() AS now, DATABASE() AS db");
    res.json({ ok: true, result: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

// Liste des tables de la BDD (pratique pour vérifier le schéma)
router.get("/tables", async (req, res) => {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    res.json({ ok: true, tables: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.code || err.message });
  }
});

// Voir 5 lignes d'une table (par défaut: event)
router.get("/sample", async (req, res) => {
  try {
    const table = (req.query.table || "event").toString();

    // sécurité: whitelist des tables autorisées
    const allowed = new Set(["event", "student", "resources", "asso_1"]);
    if (!allowed.has(table)) {
      return res.status(400).json({ ok: false, error: "Invalid table name" });
    }

    const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT 5`);
    res.json({ ok: true, table, rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.code || e.message });
  }
});

// Compter le nombre de lignes par table
router.get("/counts", async (req, res) => {
  try {
    const [[event]] = await pool.query("SELECT COUNT(*) AS n FROM event");
    const [[student]] = await pool.query("SELECT COUNT(*) AS n FROM student");
    const [[resources]] = await pool.query("SELECT COUNT(*) AS n FROM resources");
    const [[asso]] = await pool.query("SELECT COUNT(*) AS n FROM asso_1");

    res.json({
      ok: true,
      counts: {
        event: event.n,
        student: student.n,
        resources: resources.n,
        asso_1: asso.n,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.code || e.message });
  }
});

// Exemple de jointure: events + salle (resources) + nb d'étudiants via asso_1
router.get("/events", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 50);

    const [rows] = await pool.query(
      `
      SELECT
        e.*,
        r.Name AS room_name,
        (SELECT COUNT(*) FROM asso_1 a WHERE a.ID_2 = e.ID) AS students_count
      FROM event e
      LEFT JOIN resources r ON r.ID = e.ID_3
      ORDER BY e.ID DESC
      LIMIT ?
      `,
      [limit]
    );

    res.json({ ok: true, limit, events: rows });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.code || e.message });
  }
});


export default router;
