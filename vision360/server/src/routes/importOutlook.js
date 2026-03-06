import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();

// Résout: <project-root>/src/data/outlook_calendar.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/src/routes -> server/src -> server
const SERVER_ROOT = path.resolve(__dirname, "../..");
// server -> project root (vision360/)
const PROJECT_ROOT = path.resolve(SERVER_ROOT, "..");

const OUT_DIR = path.join(PROJECT_ROOT, "src", "data");
const OUT_FILE = path.join(OUT_DIR, "outlook_calendar.json");

router.post("/outlook/week", async (req, res, next) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ ok: false, message: "Body attendu: tableau JSON" });
        }

        await fs.mkdir(OUT_DIR, { recursive: true });
        await fs.writeFile(OUT_FILE, JSON.stringify(req.body, null, 2), "utf8");
        console.log("[API] import outlook/week count =", req.body.length);
        console.log("[API] writing to =", OUT_FILE);
        return res.json({ ok: true, savedTo: "src/data/outlook_calendar.json", count: req.body.length });
    } catch (err) {
        return next(err);
    }
});

// (optionnel) pratique pour vérifier depuis le navigateur
router.get("/outlook/week", async (req, res) => {
    try {
        const raw = await fs.readFile(OUT_FILE, "utf8");
        res.type("application/json").send(raw);
    } catch {
        res.status(404).json({ ok: false, message: "Aucun fichier outlook_calendar.json" });
    }
});

export default router;