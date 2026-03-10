import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DATA_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../src/data/data.json');
const SCRAPER_URL = 'http://localhost:5000';
const API_KEY = 'Izfz3Sv5vkUFfzRURcFK6p6MjTTDPZyqoQ4Q56D360J48bXkFeMLBwSkKB2ArrEOwmg3C9YYJX8bzlIzmipMQCYemRMQsxB1LgTCkY0aYcYlq9S5s1TQa8UUevW7w0P';

const get = (ep) => fetch(`${SCRAPER_URL}${ep}`, { headers: { 'X-API-Key': API_KEY } }).then(r => r.json());

async function sync() {
    const events = await get('/planning/events/vision360');
    if (!events.length) { console.warn('⚠️ No events from scraper'); return; }

    const existing = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : [];
    const map = new Map(existing.map(e => [String(e.id), e]));
    events.forEach(e => map.set(String(e.id), e));

    const final = [...map.values()].sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
    fs.writeFileSync(DATA_FILE, JSON.stringify(final, null, 2));
    console.log(`✅ data.json: ${final.length} events (${events.length} from scraper)`);
    events.slice(0, 2).forEach(e => console.log(`  📅 ${e.start} → ${e.title?.slice(0, 50)}`));
}

sync().catch(e => { console.error('❌', e.message); process.exit(1); });
