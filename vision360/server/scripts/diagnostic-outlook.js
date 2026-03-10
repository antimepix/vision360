/**
 * diagnostic-outlook.js
 * Test rapide de la connexion OWA et de l'API calendar pour les coordinateurs.
 */
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import 'dotenv/config';

puppeteer.use(StealthPlugin());

const EMAIL = process.env.OUTLOOK_EMAIL;
const PASS = process.env.OUTLOOK_PASSWORD;

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    console.log('Email:', EMAIL);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-FR' });

    console.log('Navigating to OWA...');
    await page.goto('https://outlook.office365.com/mail', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(3000);

    const url1 = page.url();
    console.log('URL after load:', url1);

    if (url1.includes('microsoftonline') || url1.includes('login.live')) {
        console.log('Login page detected...');

        // Chercher les inputs sur la page
        const pageTitle = await page.title();
        console.log('Page title:', pageTitle);

        // Input email
        try {
            const emailSel = 'input[type=email], input[name=loginfmt], #i0116';
            await page.waitForSelector(emailSel, { timeout: 8000 });
            await page.type(emailSel, EMAIL, { delay: 40 });
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => { });
            await delay(2000);
        } catch (e) {
            console.log('No email input:', e.message.substring(0, 80));
        }

        // Input mot de passe
        try {
            const passSel = 'input[type=password], input[name=passwd], #i0118';
            await page.waitForSelector(passSel, { timeout: 12000 });
            await page.type(passSel, PASS, { delay: 40 });
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }).catch(() => { });
            await delay(2000);
        } catch (e) {
            console.log('No password input:', e.message.substring(0, 80));
        }

        // "Rester connecté ?" 
        try {
            await page.waitForSelector('#idBtn_Back', { timeout: 5000 });
            await page.click('#idBtn_Back');
            await delay(3000);
        } catch { /* skip */ }

        await delay(4000);
        console.log('URL after login:', page.url());
    } else {
        console.log('Already on OWA (session active)');
    }

    // Test 1: Ma propre boîte
    console.log('\n--- Test API /me ---');
    const r1 = await page.evaluate(async () => {
        const url = 'https://outlook.office365.com/api/v2.0/me/calendarview?startDateTime=2026-03-01T00:00:00Z&endDateTime=2026-03-15T23:59:59Z&$select=Subject,ShowAs&$top=3';
        const r = await fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } });
        return { status: r.status, body: (await r.text()).substring(0, 600) };
    });
    console.log('Status:', r1.status);
    console.log('Body:', r1.body);

    // Test 2: Damien Ponassie
    console.log('\n--- Test API damien.ponassie@junia.com ---');
    const r2 = await page.evaluate(async () => {
        const url = 'https://outlook.office365.com/api/v2.0/users/damien.ponassie@junia.com/calendarview?startDateTime=2026-03-01T00:00:00Z&endDateTime=2026-03-15T23:59:59Z&$select=Subject,ShowAs&$top=3';
        const r = await fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } });
        return { status: r.status, body: (await r.text()).substring(0, 600) };
    });
    console.log('Status:', r2.status);
    console.log('Body:', r2.body);

    await browser.close();
    process.exit(0);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
