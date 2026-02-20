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

export default router;
