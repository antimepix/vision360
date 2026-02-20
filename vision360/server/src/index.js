import "dotenv/config";
import app from "../app.js";

const port = Number(process.env.PORT || 3001);

// IMPORTANT : on bind sur 0.0.0.0 pour être sûr que ça écoute
app.listen(port, "0.0.0.0", () => {
  console.log(`API running on http://localhost:${port}`);
});
