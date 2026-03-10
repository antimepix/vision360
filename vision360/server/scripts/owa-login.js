import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

puppeteer.use(StealthPlugin());

const SESSION_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '../owa-session.json');

const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
const page = await browser.newPage();
await page.goto('https://outlook.office365.com/mail', { waitUntil: 'domcontentloaded', timeout: 60000 });

console.log('Connectez-vous à OWA dans le navigateur, puis appuyez sur ENTRÉE ici...');
await new Promise(r => process.stdin.once('data', r));

if (!page.url().includes('outlook.office')) {
    console.error('❌ Pas sur OWA. URL:', page.url());
    await browser.close(); process.exit(1);
}

fs.writeFileSync(SESSION_FILE, JSON.stringify(await page.cookies(), null, 2));
console.log(`✅ Session sauvegardée (${(await page.cookies()).length} cookies) → ${SESSION_FILE}`);
await browser.close();
