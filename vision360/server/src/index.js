import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 3001);

// IMPORTANT : on bind sur 0.0.0.0 pour être sûr que ça écoute
app.listen(port, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${port}`);
});
