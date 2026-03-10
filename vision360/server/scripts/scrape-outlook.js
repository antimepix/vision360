import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

puppeteer.use(StealthPlugin());

const __dir = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.join(__dir, '../../src/data/outlook_calendar.json');
const SESSION_FILE = path.join(__dir, '../owa-session.json');
const OWA = 'https://outlook.office365.com';

const COORDINATORS = [
    { name: 'Damien PONASSIE', email: 'damien.ponassie@junia.com' },
    { name: 'Olivier DEVIENNE', email: 'olivier.devienne@junia.com' },
    { name: 'Chrystelle GAUJARD', email: 'chrystelle.gaujard@junia.com' },
];

function range3Weeks() {
    const dow = (new Date().getDay() + 6) % 7;
    const start = new Date(); start.setDate(start.getDate() - dow - 7); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(start.getDate() + 20); end.setHours(23, 59, 59, 999);
    return { start, end };
}

const ymd = d => d.toISOString().slice(0, 10);
const hhmm = d => d.toTimeString().slice(0, 5);

function mapEvent(ev, name) {
    const allDay = ev.IsAllDay ?? false;
    const tz = ev.Start?.TimeZone === 'UTC' ? 'Z' : '';
    const s = ev.Start?.DateTime ? new Date(ev.Start.DateTime + tz) : null;
    const e = ev.End?.DateTime ? new Date(ev.End.DateTime + tz) : null;
    const title = { Free: 'Free', Busy: 'Busy', Away: 'Away', Tentative: 'Tentative', WorkingElsewhere: 'Working Elsewhere', Oof: 'Away' }[ev.ShowAs ?? 'Busy'] ?? 'Busy';
    const sh = !allDay && s ? hhmm(s) : null;
    const eh = !allDay && e ? hhmm(e) : null;
    return { calendar: name, day: s ? ymd(s) : null, title, text: allDay ? title : `${sh}\n${title}`, start: sh, end: eh, allDay, kind: 'overflow_event', from: '+0' };
}

export async function scrapeOutlookCalendars() {
    if (!fs.existsSync(SESSION_FILE)) {
        console.warn('[Outlook] No session — run `npm run owa-login` first.');
        return;
    }

    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
        const page = await browser.newPage();
        await page.goto(OWA, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => { });
        await page.setCookie(...JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')));
        await page.goto(`${OWA}/mail`, { waitUntil: 'networkidle2', timeout: 30000 });

        if (!page.url().includes('outlook.office')) {
            console.warn('[Outlook] Session expirée — relancer `npm run owa-login`.');
            fs.unlinkSync(SESSION_FILE);
            return;
        }

        const { start, end } = range3Weeks();
        const all = [];

        for (const c of COORDINATORS) {
            const url = `${OWA}/api/v2.0/users/${encodeURIComponent(c.email)}/calendarview` +
                `?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}` +
                `&$select=Subject,Start,End,ShowAs,IsAllDay&$top=200`;

            const { data, error } = await page.evaluate(async u => {
                try {
                    const r = await fetch(u, { credentials: 'include', headers: { Accept: 'application/json' } });
                    const txt = await r.text();
                    return r.ok ? { data: JSON.parse(txt) } : { error: `${r.status}: ${txt.slice(0, 200)}` };
                } catch (e) { return { error: e.message }; }
            }, url);

            if (error) { console.warn(`[Outlook] ⚠️ ${c.name}: ${error}`); continue; }
            const mapped = (data?.value ?? []).map(e => mapEvent(e, c.name));
            all.push(...mapped);
            console.log(`[Outlook] ${c.name}: ${mapped.length} events`);
        }

        if (all.length) {
            fs.writeFileSync(OUT_FILE, JSON.stringify(all, null, 2));
            console.log(`[Outlook] ✅ ${all.length} events saved.`);
        } else {
            console.warn('[Outlook] ⚠️ No events found.');
        }
    } catch (e) {
        console.error('[Outlook] ❌', e.message);
    } finally {
        await browser?.close();
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url))
    scrapeOutlookCalendars().then(() => process.exit(0));
