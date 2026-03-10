import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import { scrapeOutlookCalendars } from '../scripts/scrape-outlook.js';

const SYNC_SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'sync-scraper.js');
const SCRAPER_URL = 'http://localhost:5000';
const API_KEY = 'Izfz3Sv5vkUFfzRURcFK6p6MjTTDPZyqoQ4Q56D360J48bXkFeMLBwSkKB2ArrEOwmg3C9YYJX8bzlIzmipMQCYemRMQsxB1LgTCkY0aYcYlq9S5s1TQa8UUevW7w0P';
const INTERVAL_MS = 12 * 60 * 60 * 1000;

async function sync() {
    try {
        const res = await fetch(`${SCRAPER_URL}/planning/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
            body: '{}',
            signal: AbortSignal.timeout(5 * 60 * 1000),
        });
        const { success, eventsFetched } = await res.json();
        console.log(success ? `[Scheduler] ✅ Aurion — ${eventsFetched} events` : '[Scheduler] ⚠️ Aurion sync KO');
    } catch (e) {
        console.error('[Scheduler] ❌ Aurion:', e.message);
        return;
    }

    execFile(process.execPath, [SYNC_SCRIPT], (err, stdout) => {
        if (err) console.error('[Scheduler] ❌ sync-scraper:', err.message);
        else console.log('[Scheduler] ✅ data.json updated', stdout?.trim() ? `\n${stdout.trim()}` : '');
        scrapeOutlookCalendars().catch(e => console.error('[Scheduler] ❌ Outlook:', e.message));
    });
}

export function startScheduler() {
    console.log('[Scheduler] Auto-sync every 12h');
    sync();
    setInterval(sync, INTERVAL_MS);
}
