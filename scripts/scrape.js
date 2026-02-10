import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATHLETES_URL = 'https://www.espn.com/olympics/winter/2026/medals/_/view/athletes';
const OUTPUT_FILE = path.join(__dirname, '../data/currentData.ts');

(async () => {
  console.log('Starting Enhanced ESPN Scraper with HTML Inspection...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to ESPN athletes page...');
    await page.goto(ATHLETES_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(12000);

    await page.screenshot({ path: path.join(__dirname, 'debug-athletes.png'), fullPage: true });

    // Extract athlete data with detailed HTML inspection
    const athleteData = await page.evaluate(() => {
      const results = [];
      const tables = document.querySelectorAll('table');

      console.log(`Found ${tables.length} tables`);

      tables.forEach((table, tableIdx) => {
        const rows = table.querySelectorAll('tbody tr');
        console.log(`Table ${tableIdx} has ${rows.length} rows`);

        rows.forEach((row, rowIdx) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 5) return;

          // Get the first cell (contains athlete name and country)
          const nameCell = cells[0];

          // Log the HTML structure of the first few rows for debugging
          if (rowIdx < 3) {
            console.log(`\n=== Row ${rowIdx} HTML ===`);
            console.log(nameCell.innerHTML);
          }

          // Extract athlete name
          let athleteName = '';

          // Try different selectors for athlete name
          const nameLink = nameCell.querySelector('a');
          if (nameLink) {
            athleteName = nameLink.textContent?.trim() || '';
          } else {
            athleteName = nameCell.textContent?.trim() || '';
          }

          // Clean up name
          athleteName = athleteName.replace(/\s+/g, ' ').trim();

          // Extract country code - try multiple methods
          let countryCode = '';

          // Method 1: Look for img with country flag
          const flagImg = nameCell.querySelector('img');
          if (flagImg) {
            const src = flagImg.getAttribute('src') || '';
            const alt = flagImg.getAttribute('alt') || '';
            const title = flagImg.getAttribute('title') || '';

            if (rowIdx < 3) {
              console.log(`Flag img src: ${src}`);
              console.log(`Flag img alt: ${alt}`);
              console.log(`Flag img title: ${title}`);
            }

            // Try to extract country code from src (e.g., /i/teamlogos/countries/500/usa.png)
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

            // Try alt text
            if (!countryCode && alt) {
              const altMatch = alt.match(/([A-Z]{3}|[A-Z]{2})/);
              if (altMatch) {
                countryCode = altMatch[1];
              }
            }
          }

          // Method 2: Look for abbr or span with country code
          const abbr = nameCell.querySelector('abbr, span[class*="country"], span[class*="flag"]');
          if (!countryCode && abbr) {
            const abbrText = abbr.textContent?.trim() || '';
            if (/^[A-Z]{3}$/.test(abbrText)) {
              countryCode = abbrText;
            }
          }

          // Extract medal counts
          const goldText = cells[cells.length - 4]?.textContent?.trim() || '0';
          const silverText = cells[cells.length - 3]?.textContent?.trim() || '0';
          const bronzeText = cells[cells.length - 2]?.textContent?.trim() || '0';

          const gold = parseInt(goldText) || 0;
          const silver = parseInt(silverText) || 0;
          const bronze = parseInt(bronzeText) || 0;

          if ((gold > 0 || silver > 0 || bronze > 0) && athleteName) {
            if (rowIdx < 5) {
              console.log(`Athlete: ${athleteName}, Country: ${countryCode || 'NOT FOUND'}, Medals: G${gold} S${silver} B${bronze}`);
            }
            results.push({ athleteName, countryCode, gold, silver, bronze });
          }
        });
      });

      return results;
    });

    console.log(`\nFound ${athleteData.length} athletes with medals`);

    // Convert to medal records
    const scrapedData = [];
    let medalId = 1;

    athleteData.forEach(athlete => {
      const country = athlete.countryCode || 'UNK';

      for (let i = 0; i < athlete.gold; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Gold',
          countryCode: country,
          athletes: [athlete.athleteName]
        });
      }
      for (let i = 0; i < athlete.silver; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Silver',
          countryCode: country,
          athletes: [athlete.athleteName]
        });
      }
      for (let i = 0; i < athlete.bronze; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Bronze',
          countryCode: country,
          athletes: [athlete.athleteName]
        });
      }
    });

    console.log(`Generated ${scrapedData.length} medal records`);

    if (scrapedData.length > 0) {
      const fileContent = `import { MedalWin, MedalType } from '../types';

/**
 * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Scraped from: ${ATHLETES_URL}
 * Timestamp: ${new Date().toISOString()}
 * 
 * Includes athlete names and country codes for regional attribution.
 */
export const OLYMPIC_DATA: MedalWin[] = ${JSON.stringify(scrapedData, null, 2)};
`;

      fs.writeFileSync(OUTPUT_FILE, fileContent);
      console.log(`✅ Successfully wrote ${scrapedData.length} medals!`);
    } else {
      console.log('⚠️  No medal data found.');
    }

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  } finally {
    await browser.close();
  }
})();