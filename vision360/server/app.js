import "dotenv/config";
import express from "express";
import cors from "cors";
import dbRouter from "./src/routes/dbTest.js";
import resourcesRouter from "./src/routes/resources.js";
import studentsRouter from "./src/routes/students.js";
import eventsRouter from "./src/routes/events.js";
import exportRouter from "./src/routes/exportData.js";
import authRouter from "./src/routes/auth.js";
import importOutlookRouter from "./src/routes/importOutlook.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Petit endpoint pratique pour tester vite
app.get("/health", (req, res) => res.json({ ok: true }));

// Alias (pratique côté front)
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Routes DB (tests)
app.use("/api/db", dbRouter);

// Routes BDD (vraies données)
app.use("/api/resources", resourcesRouter);
app.use("/api/students", studentsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/export", exportRouter);

// app.use("/api", routes);
app.use("/api/auth", authRouter);
app.use("/api/import", importOutlookRouter);

app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ ok: false, message: "JSON invalide" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ ok: false, message: "Payload trop gros" });
  }
  console.error(err);
  return res.status(500).json({ ok: false, message: "Erreur serveur" });
});

export default app;
