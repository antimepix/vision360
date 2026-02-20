import "dotenv/config";
import express from "express";
import cors from "cors";
import dbRouter from "./src/routes/dbTest.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/db", dbRouter);

export default app;
