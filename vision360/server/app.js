import "dotenv/config";
import express from "express";
import cors from "cors";
import dbRouter from "./src/routes/dbTest.js";
import resourcesRouter from "./src/routes/resources.js";
import studentsRouter from "./src/routes/students.js";
import eventsRouter from "./src/routes/events.js";

const app = express();
app.use(cors());
app.use(express.json());

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

// app.use("/api", routes);

export default app;
