import express from "express";
import bcrypt from "bcryptjs";

const router = express.Router();

const USERS = [
  { role: "damien", redirect: "/", envKey: "AUTH_DAMIEN_HASH" },
  { role: "eleve", redirect: "/campus", envKey: "AUTH_ELEVE_HASH" },
  { role: "admin", redirect: "/", envKey: "AUTH_ADMIN_HASH" },
];

function normalize(input) {
  const s = String(input ?? "").trim();
  if (!s) return "";
  if (/^\d+$/.test(s)) return s;     // 1234
  return s.toUpperCase();            // ponassie -> PONASSIE
}

router.post("/login", async (req, res) => {
  try {
    const password = normalize(req.body?.password);
    const role = req.body?.role; // Optional role filter

    console.log(`[AUTH] Login attempt - Role: ${role}, Pwd (norm): ${password}`);

    if (!password) {
      return res.status(400).json({ ok: false, message: "Mot de passe manquant" });
    }

    // Si le serveur n'est pas configuré, on répond proprement au lieu de crash
    const missing = USERS.filter(u => !process.env[u.envKey]).map(u => u.envKey);
    if (missing.length) {
      console.error("AUTH env missing:", missing);
      return res.status(500).json({ ok: false, message: "Serveur non configuré (hash manquant)" });
    }

    const targets = role ? USERS.filter(u => u.role === role) : USERS;

    if (targets.length === 0) {
      return res.status(400).json({ ok: false, message: "Rôle invalide" });
    }

    for (const u of targets) {
      const hash = process.env[u.envKey];
      const match = await bcrypt.compare(password, hash);
      if (match) return res.json({ ok: true, role: u.role, redirect: u.redirect });
    }

    return res.status(401).json({ ok: false, message: "Mot de passe incorrect" });
  } catch (err) {
    console.error("POST /api/auth/login failed:", err);
    return res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

export default router;