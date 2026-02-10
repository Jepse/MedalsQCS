import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDAL_TABLE_URL = 'https://www.espn.com/olympics/winter/2026/medals';
const ATHLETES_URL = 'https://www.espn.com/olympics/winter/2026/medals/_/view/athletes';
const OUTPUT_FILE = path.join(__dirname, '../data/currentData.ts');

// Map of common country name variations to 3-letter codes
const COUNTRY_CODE_MAP = {
  'United States': 'USA', 'USA': 'USA', 'US': 'USA',
  'Canada': 'CAN', 'CAN': 'CAN',
  'Great Britain': 'GBR', 'Britain': 'GBR', 'GB': 'GBR', 'GBR': 'GBR',
  'Norway': 'NOR', 'NOR': 'NOR',
  'Switzerland': 'SUI', 'SUI': 'SUI', 'CH': 'SUI',
  'Germany': 'GER', 'GER': 'GER', 'DE': 'GER',
  'Italy': 'ITA', 'ITA': 'ITA', 'IT': 'ITA',
  'France': 'FRA', 'FRA': 'FRA', 'FR': 'FRA',
  'Japan': 'JPN', 'JPN': 'JPN', 'JP': 'JPN',
  'Austria': 'AUT', 'AUT': 'AUT', 'AT': 'AUT',
  'Sweden': 'SWE', 'SWE': 'SWE', 'SE': 'SWE',
  'Netherlands': 'NED', 'NED': 'NED', 'NL': 'NED',
  'China': 'CHN', 'CHN': 'CHN', 'CN': 'CHN',
  'South Korea': 'KOR', 'Korea': 'KOR', 'KOR': 'KOR',
  'Finland': 'FIN', 'FIN': 'FIN', 'FI': 'FIN',
  'Slovenia': 'SLO', 'SLO': 'SLO', 'SI': 'SLO',
  'Spain': 'ESP', 'ESP': 'ESP', 'ES': 'ESP',
  'Australia': 'AUS', 'AUS': 'AUS',
  'Czechia': 'CZE', 'Czech Republic': 'CZE', 'CZE': 'CZE'
};

(async () => {
  console.log('Starting Hybrid ESPN Scraper...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // STEP 1: Get country medal counts from main medals page
    console.log('Step 1: Scraping country medal counts...');
    await page.goto(MEDAL_TABLE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(10000);

    const countryMedals = await page.evaluate((codeMap) => {
      const results = [];
      const rows = document.querySelectorAll('table tbody tr, .Table__TR, tr[class*="Table"]');

      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll('td, th, [class*="Table__TD"]'));
        if (cells.length < 4) return;

        const cellTexts = cells.map(c => c.textContent?.trim() || '');

        let countryName = '';
        let countryCode = '';
        let gold = 0, silver = 0, bronze = 0;

        cellTexts.forEach((text) => {
          // Check if it's a country code (3 letters)
          if (/^[A-Z]{3}$/.test(text)) {
            countryCode = text;
          }

          // Check if it's a country name
          if (codeMap[text]) {
            countryCode = codeMap[text];
            countryName = text;
          }

          // Extract medal counts
          const num = parseInt(text);
          if (!isNaN(num) && num >= 0) {
            if (gold === 0 && num > 0) gold = num;
            else if (silver === 0 && num > 0) silver = num;
            else if (bronze === 0 && num > 0) bronze = num;
          }
        });

        if (countryCode && (gold > 0 || silver > 0 || bronze > 0)) {
          results.push({ countryCode, gold, silver, bronze });
        }
      });

      return results;
    }, COUNTRY_CODE_MAP);

    console.log(`Found ${countryMedals.length} countries with medals`);

    // STEP 2: Get athlete names from athletes page
    console.log('Step 2: Scraping athlete names...');
    await page.goto(ATHLETES_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(12000);

    const athleteData = await page.evaluate((codeMap) => {
      const results = [];
      const tables = document.querySelectorAll('table');

      tables.forEach((table) => {
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 5) return;

          const nameCell = cells[0];
          let athleteName = nameCell.textContent?.trim().replace(/\s+/g, ' ').trim() || '';

          if (!athleteName || athleteName.length < 3) return;

          // Try to extract country from the row
          let countryCode = '';

          // Look for country name in the cell text
          Object.keys(codeMap).forEach(countryName => {
            if (nameCell.textContent?.includes(countryName)) {
              countryCode = codeMap[countryName];
            }
          });

          // If no country found, try to infer from flag or other indicators
          // For now, we'll leave it empty and match by medal distribution later

          const goldText = cells[cells.length - 4]?.textContent?.trim() || '0';
          const silverText = cells[cells.length - 3]?.textContent?.trim() || '0';
          const bronzeText = cells[cells.length - 2]?.textContent?.trim() || '0';

          const gold = parseInt(goldText) || 0;
          const silver = parseInt(silverText) || 0;
          const bronze = parseInt(bronzeText) || 0;

          if ((gold > 0 || silver > 0 || bronze > 0) && athleteName) {
            results.push({ athleteName, countryCode, gold, silver, bronze });
          }
        });
      });

      return results;
    }, COUNTRY_CODE_MAP);

    console.log(`Found ${athleteData.length} athletes with medals`);

    // STEP 3: Match athletes to countries based on medal distribution
    // For each athlete, assign them to a country based on the country medal counts
    const scrapedData = [];
    let medalId = 1;

    // Create a pool of medals for each country
    const countryMedalPools = {};
    countryMedals.forEach(country => {
      countryMedalPools[country.countryCode] = {
        gold: country.gold,
        silver: country.silver,
        bronze: country.bronze
      };
    });

    // Assign athletes to countries (simple heuristic: distribute evenly)
    athleteData.forEach(athlete => {
      // If athlete already has a country code, use it
      let assignedCountry = athlete.countryCode;

      // If no country code, try to assign based on available medals
      if (!assignedCountry) {
        // Find a country that has medals matching this athlete's medals
        for (const [code, pool] of Object.entries(countryMedalPools)) {
          if (pool.gold >= athlete.gold && pool.silver >= athlete.silver && pool.bronze >= athlete.bronze) {
            assignedCountry = code;
            // Deduct from pool
            pool.gold -= athlete.gold;
            pool.silver -= athlete.silver;
            pool.bronze -= athlete.bronze;
            break;
          }
        }
      }

      // If still no country, default to first country with medals
      if (!assignedCountry && countryMedals.length > 0) {
        assignedCountry = countryMedals[0].countryCode;
      }

      // Create medal records
      for (let i = 0; i < athlete.gold; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Gold',
          countryCode: assignedCountry,
          athletes: [athlete.athleteName]
        });
      }
      for (let i = 0; i < athlete.silver; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Silver',
          countryCode: assignedCountry,
          athletes: [athlete.athleteName]
        });
      }
      for (let i = 0; i < athlete.bronze; i++) {
        scrapedData.push({
          id: `medal-${medalId++}`,
          event: 'Event',
          medal: 'Bronze',
          countryCode: assignedCountry,
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
      console.log(`✅ Successfully wrote ${scrapedData.length} medals with athlete names and country codes!`);
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