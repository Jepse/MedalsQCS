import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATHLETES_URL = 'https://www.espn.com/olympics/winter/2026/medals/_/view/athletes';
const OUTPUT_FILE = path.join(__dirname, '../data/currentData.ts');

(async () => {
  console.log('Starting Enhanced ESPN Scraper...');
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
    await page.goto(ATHLETES_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('Waiting for table to load...');
    await page.waitForTimeout(12000); // Give extra time for dynamic content

    await page.screenshot({ path: path.join(__dirname, 'debug-athletes.png'), fullPage: true });

    // Extract athlete medal data with more specific selectors
    const athleteData = await page.evaluate(() => {
      const results = [];

      // Look for the "Athlete Medal Results" section
      const tables = document.querySelectorAll('table');
      console.log(`Found ${tables.length} tables on page`);

      tables.forEach((table, tableIdx) => {
        const rows = table.querySelectorAll('tbody tr');
        console.log(`Table ${tableIdx} has ${rows.length} rows`);

        rows.forEach((row, rowIdx) => {
          try {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return; // Need at least: name, gold, silver, bronze, total

            // Extract athlete name (usually in first cell, may have flag image)
            const nameCell = cells[0];
            let athleteName = nameCell.textContent?.trim() || '';

            // Clean up athlete name (remove extra whitespace, country codes)
            athleteName = athleteName.replace(/\s+/g, ' ').trim();

            // Skip if name is empty or looks like a header
            if (!athleteName || athleteName.toLowerCase().includes('group') || athleteName.length < 3) {
              return;
            }

            // Extract medal counts from subsequent cells
            const goldText = cells[cells.length - 4]?.textContent?.trim() || '0';
            const silverText = cells[cells.length - 3]?.textContent?.trim() || '0';
            const bronzeText = cells[cells.length - 2]?.textContent?.trim() || '0';

            const gold = parseInt(goldText) || 0;
            const silver = parseInt(silverText) || 0;
            const bronze = parseInt(bronzeText) || 0;

            // Try to extract country code from flag image or other indicators
            let countryCode = '';
            const flagImg = nameCell.querySelector('img[class*="flag"], img[alt*="flag"], img[src*="flag"]');
            if (flagImg) {
              const src = flagImg.getAttribute('src') || '';
              const alt = flagImg.getAttribute('alt') || '';
              // Try to extract country code from image src or alt
              const codeMatch = (src + alt).match(/([A-Z]{3}|[A-Z]{2})/);
              if (codeMatch) {
                countryCode = codeMatch[1];
                if (countryCode.length === 2) {
                  // Convert 2-letter to 3-letter codes (common ones)
                  const map = {
                    'US': 'USA', 'CH': 'SUI', 'GB': 'GBR', 'CA': 'CAN',
                    'DE': 'GER', 'FR': 'FRA', 'IT': 'ITA', 'JP': 'JPN',
                    'NO': 'NOR', 'SE': 'SWE', 'AT': 'AUT', 'NL': 'NED'
                  };
                  countryCode = map[countryCode] || countryCode;
                }
              }
            }

            // If no country code found, try to infer from context or use placeholder
            if (!countryCode) {
              countryCode = 'UNK';
            }

            if ((gold > 0 || silver > 0 || bronze > 0) && athleteName) {
              console.log(`Found: ${athleteName} (${countryCode}) - G:${gold} S:${silver} B:${bronze}`);
              results.push({ athleteName, countryCode, gold, silver, bronze });
            }
          } catch (err) {
            console.error(`Error processing row ${rowIdx}:`, err);
          }
        });
      });

      return results;
    });

    console.log(`Found ${athleteData.length} athletes with medals`);

    // Convert athlete data to medal wins
    const scrapedData = [];
    let medalId = 1;

    athleteData.forEach(athlete => {
      for (let i = 0; i < athlete.gold; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Gold',
          countryCode: athlete.countryCode,
          athletes: [athlete.athleteName]
        });
      }
      for (let i = 0; i < athlete.silver; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Silver',
          countryCode: athlete.countryCode,
          athletes: [athlete.athleteName]
        });
      }
      for (let i = 0; i < athlete.bronze; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Bronze',
          countryCode: athlete.countryCode,
          athletes: [athlete.athleteName]
        });
      }
    });

    console.log(`Generated ${scrapedData.length} medal records with athlete names`);

    if (scrapedData.length > 0) {
      const fileContent = `import { MedalWin, MedalType } from '../types';

/**
 * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Scraped from: ${ATHLETES_URL}
 * Timestamp: ${new Date().toISOString()}
 * 
 * This data includes individual athlete names for regional attribution.
 */
export const OLYMPIC_DATA: MedalWin[] = ${JSON.stringify(scrapedData, null, 2)};
`;

      fs.writeFileSync(OUTPUT_FILE, fileContent);
      console.log(`✅ Successfully wrote ${scrapedData.length} medals with athlete names!`);
      console.log(`✅ Regional attribution should now work!`);
    } else {
      console.log('⚠️  No medal data found. Keeping existing data file.');
    }

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    console.log('Keeping existing data file.');
  } finally {
    await browser.close();
  }
})();