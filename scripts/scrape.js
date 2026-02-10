import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ESPN is more scraper-friendly than Olympics.com
const MEDAL_TABLE_URL = 'https://www.espn.com/olympics/winter/2026/medals';
const OUTPUT_FILE = path.join(__dirname, '../data/currentData.ts');

(async () => {
  console.log('Starting ESPN Scraper...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log(`Navigating to ${MEDAL_TABLE_URL}...`);

    // Use domcontentloaded instead of networkidle - much faster
    await page.goto(MEDAL_TABLE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('Waiting for content to render...');
    // Give it time for JavaScript to execute
    await page.waitForTimeout(10000);

    // Take a screenshot for debugging
    const screenshotPath = path.join(__dirname, 'debug-espn-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

    const scrapedData = await page.evaluate(() => {
      const results = [];

      // ESPN uses table structure for medals
      const rows = document.querySelectorAll('table tbody tr, .Table__TR, tr[class*="Table"]');

      console.log(`Found ${rows.length} potential rows`);

      rows.forEach((row, index) => {
        try {
          const cells = Array.from(row.querySelectorAll('td, th, [class*="Table__TD"]'));

          // Skip header rows or rows with too few cells
          if (cells.length < 4) return;

          // Extract text from cells
          const cellTexts = cells.map(c => c.textContent?.trim() || '');

          // Look for country code (3 letters) or country name
          let countryCode = null;
          let countryName = '';
          let gold = 0, silver = 0, bronze = 0;

          cellTexts.forEach((text, idx) => {
            // Check for 3-letter country code
            if (/^[A-Z]{3}$/.test(text)) {
              countryCode = text;
            }

            // Check for country names and map to codes
            const countryMap = {
              'Norway': 'NOR', 'Switzerland': 'SUI', 'Japan': 'JPN',
              'Germany': 'GER', 'United States': 'USA', 'Austria': 'AUT',
              'Italy': 'ITA', 'France': 'FRA', 'Canada': 'CAN',
              'Sweden': 'SWE', 'Netherlands': 'NED', 'China': 'CHN',
              'South Korea': 'KOR', 'Finland': 'FIN', 'Slovenia': 'SLO'
            };

            if (countryMap[text] && !countryCode) {
              countryCode = countryMap[text];
              countryName = text;
            }

            // Extract numbers (medal counts)
            const num = parseInt(text);
            if (!isNaN(num) && num >= 0) {
              if (gold === 0 && num > 0) gold = num;
              else if (silver === 0 && num > 0) silver = num;
              else if (bronze === 0 && num > 0) bronze = num;
            }
          });

          // If we found a country and medals
          if (countryCode && (gold > 0 || silver > 0 || bronze > 0)) {
            console.log(`Found: ${countryCode} - G:${gold} S:${silver} B:${bronze}`);

            // Create individual medal entries
            for (let i = 0; i < gold; i++) {
              results.push({
                id: `${countryCode.toLowerCase()}-gold-${i + 1}`,
                event: 'Event',
                medal: 'Gold',
                countryCode: countryCode,
                athletes: [`Athlete from ${countryCode}`]
              });
            }
            for (let i = 0; i < silver; i++) {
              results.push({
                id: `${countryCode.toLowerCase()}-silver-${i + 1}`,
                event: 'Event',
                medal: 'Silver',
                countryCode: countryCode,
                athletes: [`Athlete from ${countryCode}`]
              });
            }
            for (let i = 0; i < bronze; i++) {
              results.push({
                id: `${countryCode.toLowerCase()}-bronze-${i + 1}`,
                event: 'Event',
                medal: 'Bronze',
                countryCode: countryCode,
                athletes: [`Athlete from ${countryCode}`]
              });
            }
          }
        } catch (err) {
          console.error('Error processing row:', err);
        }
      });

      return results;
    });

    console.log(`Found ${scrapedData.length} medal records.`);

    // If we got data, write it
    if (scrapedData.length > 0) {
      const fileContent = `import { MedalWin, MedalType } from '../types';

/**
 * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Scraped from: ${MEDAL_TABLE_URL}
 * Timestamp: ${new Date().toISOString()}
 */
export const OLYMPIC_DATA: MedalWin[] = ${JSON.stringify(scrapedData, null, 2)};
`;

      fs.writeFileSync(OUTPUT_FILE, fileContent);
      console.log(`✅ Successfully wrote ${scrapedData.length} medals to ${OUTPUT_FILE}`);
    } else {
      console.log('⚠️  No medal data found. Check debug-espn-screenshot.png for details.');
      console.log('Keeping existing data file.');
    }

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    console.log('Keeping existing data file.');
  } finally {
    await browser.close();
  }
})();