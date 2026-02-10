import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDAL_TABLE_URL = 'https://www.espn.com/olympics/winter/2026/medals';
const OUTPUT_FILE = path.join(__dirname, '../data/currentData.ts');

(async () => {
  console.log('Starting ESPN Medal Table Scraper...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to ESPN medal table...');
    await page.goto(MEDAL_TABLE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(10000);

    await page.screenshot({ path: path.join(__dirname, 'debug-medals.png'), fullPage: true });

    // Extract country medal data
    const countryData = await page.evaluate(() => {
      const results = [];
      const tables = document.querySelectorAll('table');

      console.log(`Found ${tables.length} tables`);

      tables.forEach((table, tableIdx) => {
        const rows = table.querySelectorAll('tbody tr');
        console.log(`Table ${tableIdx} has ${rows.length} rows`);

        rows.forEach((row, rowIdx) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 5) return;

          // Get country name/code from first cell
          const countryCell = cells[0];

          // Extract country code from flag image
          let countryCode = '';
          const flagImg = countryCell.querySelector('img');
          if (flagImg) {
            const src = flagImg.getAttribute('src') || '';
            const srcMatch = src.match(/countries\/\d+\/([a-z]{2,3})\./i);
            if (srcMatch) {
              countryCode = srcMatch[1].toUpperCase();
              // Convert 2-letter to 3-letter codes
              const map = {
                'US': 'USA', 'CH': 'SUI', 'GB': 'GBR', 'CA': 'CAN',
                'DE': 'GER', 'FR': 'FRA', 'IT': 'ITA', 'JP': 'JPN',
                'NO': 'NOR', 'SE': 'SWE', 'AT': 'AUT', 'NL': 'NED',
                'CN': 'CHN', 'KR': 'KOR', 'FI': 'FIN', 'SI': 'SLO',
                'ES': 'ESP', 'AU': 'AUS', 'CZ': 'CZE'
              };
              if (map[countryCode]) {
                countryCode = map[countryCode];
              }
            }
          }

          // Extract country name
          const countryName = countryCell.textContent?.trim().replace(/\s+/g, ' ') || '';

          // Extract medal counts from last 4 cells: Gold, Silver, Bronze, Total
          const goldText = cells[cells.length - 4]?.textContent?.trim() || '0';
          const silverText = cells[cells.length - 3]?.textContent?.trim() || '0';
          const bronzeText = cells[cells.length - 2]?.textContent?.trim() || '0';

          const gold = parseInt(goldText) || 0;
          const silver = parseInt(silverText) || 0;
          const bronze = parseInt(bronzeText) || 0;

          if (countryCode && (gold > 0 || silver > 0 || bronze > 0)) {
            if (rowIdx < 10) {
              console.log(`${countryCode}: G${gold} S${silver} B${bronze}`);
            }
            results.push({ countryCode, countryName, gold, silver, bronze });
          }
        });
      });

      return results;
    });

    console.log(`\nFound ${countryData.length} countries with medals`);

    // Convert country medal counts to individual medal records
    // Since we don't have individual athlete names from this view,
    // we'll create generic medal entries
    const scrapedData = [];
    let medalId = 1;

    countryData.forEach(country => {
      // Create individual medal entries for each medal
      for (let i = 0; i < country.gold; i++) {
        scrapedData.push({
          id: `${country.countryCode.toLowerCase()}-gold-${i + 1}`,
          event: 'Event',
          medal: 'Gold',
          countryCode: country.countryCode,
          athletes: [`Athlete from ${country.countryCode}`]
        });
      }
      for (let i = 0; i < country.silver; i++) {
        scrapedData.push({
          id: `${country.countryCode.toLowerCase()}-silver-${i + 1}`,
          event: 'Event',
          medal: 'Silver',
          countryCode: country.countryCode,
          athletes: [`Athlete from ${country.countryCode}`]
        });
      }
      for (let i = 0; i < country.bronze; i++) {
        scrapedData.push({
          id: `${country.countryCode.toLowerCase()}-bronze-${i + 1}`,
          event: 'Event',
          medal: 'Bronze',
          countryCode: country.countryCode,
          athletes: [`Athlete from ${country.countryCode}`]
        });
      }
    });

    console.log(`Generated ${scrapedData.length} medal records`);
    console.log(`Gold: ${scrapedData.filter(m => m.medal === 'Gold').length}`);
    console.log(`Silver: ${scrapedData.filter(m => m.medal === 'Silver').length}`);
    console.log(`Bronze: ${scrapedData.filter(m => m.medal === 'Bronze').length}`);

    if (scrapedData.length > 0) {
      const fileContent = `import { MedalWin, MedalType } from '../types';

/**
 * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Scraped from: ${MEDAL_TABLE_URL}
 * Timestamp: ${new Date().toISOString()}
 * 
 * Complete medal counts (gold, silver, bronze) for all countries.
 * Note: Athlete names are generic placeholders. Regional attribution
 * will work once we match real athlete names from a detailed source.
 */
export const OLYMPIC_DATA: MedalWin[] = ${JSON.stringify(scrapedData, null, 2)};
`;

      fs.writeFileSync(OUTPUT_FILE, fileContent);
      console.log(`✅ Successfully wrote ${scrapedData.length} medals with complete counts!`);
    } else {
      console.log('⚠️  No medal data found.');
    }

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  } finally {
    await browser.close();
  }
})();