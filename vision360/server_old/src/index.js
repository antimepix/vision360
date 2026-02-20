import "dotenv/config";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import outlookRouter from "./routes/outlook.js";
import dbRouter from "./routes/dbTest.js";
//dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/outlook", outlookRouter);
app.use("/api/db", dbRouter);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 3001);

// IMPORTANT : on bind sur 0.0.0.0 pour être sûr que ça écoute
app.listen(port, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${port}`);
});
