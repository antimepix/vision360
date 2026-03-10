import { Router } from 'express';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();
const SYNC_SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..', 'scripts', 'sync-scraper.js');
const SCRAPER_URL = 'http://localhost:5000';
const API_KEY = 'Izfz3Sv5vkUFfzRURcFK6p6MjTTDPZyqoQ4Q56D360J48bXkFeMLBwSkKB2ArrEOwmg3C9YYJX8bzlIzmipMQCYemRMQsxB1LgTCkY0aYcYlq9S5s1TQa8UUevW7w0P';

let running = false;

async function runSync() {
  if (running) return;
  running = true;
  try {
    let fetched = null;
    try {
      const r = await fetch(`${SCRAPER_URL}/planning/sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: '{}', signal: AbortSignal.timeout(5 * 60 * 1000),
      });
      const d = await r.json();
      if (d.success) fetched = d.eventsFetched;
    } catch (e) { console.warn('[export/data] Scraper indispo:', e.message); }

    await new Promise((res, rej) =>
      execFile(process.execPath, [SYNC_SCRIPT], { timeout: 60_000 }, (e, out) =>
        e ? rej(e) : res(out)));

    console.log(`[export/data] ✅ Sync OK${fetched != null ? ` (${fetched} events)` : ''}`);
  } catch (e) {
    console.error('[export/data] ❌', e.message);
  } finally { running = false; }
}

router.get('/data', (req, res) => {
  runSync();
  res.json({ ok: true, message: 'Sync lancée — rechargement dans 35s.', running: true });
});

router.get('/status', (req, res) => res.json({ running }));

export default router;