import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDAL_TABLE_URL = 'https://www.espn.com/olympics/winter/2026/medals';
const ATHLETES_URL = 'https://www.espn.com/olympics/winter/2026/medals/_/view/athletes';
const OUTPUT_FILE = path.join(__dirname, '../data/currentData.ts');

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
    // STEP 1: Get complete medal counts from country table
    console.log('Step 1: Getting complete medal counts from country table...');
    await page.goto(MEDAL_TABLE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(10000);

    // Scroll down to ensure all countries are loaded
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const countryMedals = await page.evaluate(() => {
      const results = new Map();
      const tables = document.querySelectorAll('table');

      tables.forEach((table) => {
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 5) return;

          const countryCell = cells[0];
          let countryCode = '';

          const flagImg = countryCell.querySelector('img');
          if (flagImg) {
            const src = flagImg.getAttribute('src') || '';
            const srcMatch = src.match(/countries\/\d+\/([a-z]{2,3})\./i);
            if (srcMatch) {
              countryCode = srcMatch[1].toUpperCase();
              const map = {
                'US': 'USA', 'CH': 'SUI', 'GB': 'GBR', 'CA': 'CAN',
                'DE': 'GER', 'FR': 'FRA', 'IT': 'ITA', 'JP': 'JPN',
                'NO': 'NOR', 'SE': 'SWE', 'AT': 'AUT', 'NL': 'NED',
                'CN': 'CHN', 'KR': 'KOR', 'FI': 'FIN', 'SI': 'SLO',
                'ES': 'ESP', 'AU': 'AUS', 'CZ': 'CZE', 'NZ': 'NZL',
                'PL': 'POL', 'BG': 'BUL'
              };
              if (map[countryCode]) countryCode = map[countryCode];
            }
          }

          const goldText = cells[cells.length - 4]?.textContent?.trim() || '0';
          const silverText = cells[cells.length - 3]?.textContent?.trim() || '0';
          const bronzeText = cells[cells.length - 2]?.textContent?.trim() || '0';

          const gold = parseInt(goldText) || 0;
          const silver = parseInt(silverText) || 0;
          const bronze = parseInt(bronzeText) || 0;

          if (countryCode && (gold > 0 || silver > 0 || bronze > 0)) {
            results.set(countryCode, { gold, silver, bronze });
          }
        });
      });

      return Array.from(results.entries()).map(([code, medals]) => ({ countryCode: code, ...medals }));
    });

    console.log(`Found ${countryMedals.length} countries with medals`);

    // STEP 2: Get athlete names from athletes page
    console.log('\nStep 2: Getting athlete names...');
    await page.goto(ATHLETES_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(12000);

    // Scroll multiple times to load ALL athletes (including those with only bronze)
    console.log('Scrolling to load all athletes...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    const athleteData = await page.evaluate(() => {
      const results = [];
      const tables = document.querySelectorAll('table');

      tables.forEach((table) => {
        const rows = table.querySelectorAll('tbody tr');
        console.log(`Found ${rows.length} athlete rows`);

        rows.forEach((row, idx) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 5) return;

          const nameCell = cells[0];
          const nameLink = nameCell.querySelector('a');
          let athleteName = nameLink ? nameLink.textContent?.trim() : nameCell.textContent?.trim();
          athleteName = athleteName?.replace(/\s+/g, ' ').trim() || '';

          if (!athleteName || athleteName.length < 3) return;

          let countryCode = '';
          const flagImg = nameCell.querySelector('img');
          if (flagImg) {
            const src = flagImg.getAttribute('src') || '';
            const srcMatch = src.match(/countries\/\d+\/([a-z]{2,3})\./i);
            if (srcMatch) {
              countryCode = srcMatch[1].toUpperCase();
              const map = {
                'US': 'USA', 'CH': 'SUI', 'GB': 'GBR', 'CA': 'CAN',
                'DE': 'GER', 'FR': 'FRA', 'IT': 'ITA', 'JP': 'JPN',
                'NO': 'NOR', 'SE': 'SWE', 'AT': 'AUT', 'NL': 'NED',
                'CN': 'CHN', 'KR': 'KOR', 'FI': 'FIN', 'SI': 'SLO',
                'ES': 'ESP', 'AU': 'AUS', 'CZ': 'CZE'
              };
              if (map[countryCode]) countryCode = map[countryCode];
            }
          }

          const goldText = cells[cells.length - 4]?.textContent?.trim() || '0';
          const silverText = cells[cells.length - 3]?.textContent?.trim() || '0';
          const bronzeText = cells[cells.length - 2]?.textContent?.trim() || '0';

          const gold = parseInt(goldText) || 0;
          const silver = parseInt(silverText) || 0;
          const bronze = parseInt(bronzeText) || 0;

          if ((gold > 0 || silver > 0 || bronze > 0) && athleteName && countryCode) {
            // Log Canadian athletes specifically
            if (countryCode === 'CAN') {
              console.log(`Found Canadian athlete: ${athleteName} - G:${gold} S:${silver} B:${bronze}`);
            }
            results.push({ athleteName, countryCode, gold, silver, bronze });
          }
        });
      });

      return results;
    });

    console.log(`Found ${athleteData.length} athletes with names`);
    const canadianAthletes = athleteData.filter(a => a.countryCode === 'CAN');
    console.log(`Canadian athletes found: ${canadianAthletes.length}`);
    canadianAthletes.forEach(a => console.log(`  ${a.athleteName}: G${a.gold} S${a.silver} B${a.bronze}`));

    // STEP 3: Create medal records using country totals and athlete names where available
    const scrapedData = [];

    // Create a pool of athlete names by country
    const athletesByCountry = {};
    athleteData.forEach(athlete => {
      if (!athletesByCountry[athlete.countryCode]) {
        athletesByCountry[athlete.countryCode] = [];
      }
      for (let i = 0; i < athlete.gold; i++) {
        athletesByCountry[athlete.countryCode].push({ name: athlete.athleteName, type: 'Gold' });
      }
      for (let i = 0; i < athlete.silver; i++) {
        athletesByCountry[athlete.countryCode].push({ name: athlete.athleteName, type: 'Silver' });
      }
      for (let i = 0; i < athlete.bronze; i++) {
        athletesByCountry[athlete.countryCode].push({ name: athlete.athleteName, type: 'Bronze' });
      }
    });

    // Create medal records using country totals
    countryMedals.forEach(country => {
      const athletes = athletesByCountry[country.countryCode] || [];

      // Gold medals
      for (let i = 0; i < country.gold; i++) {
        const athleteEntry = athletes.find(a => a.type === 'Gold');
        const athleteName = athleteEntry ? athleteEntry.name : `Athlete from ${country.countryCode}`;
        if (athleteEntry) {
          athletes.splice(athletes.indexOf(athleteEntry), 1);
        }

        scrapedData.push({
          id: `${country.countryCode.toLowerCase()}-gold-${i + 1}`,
          event: 'Event',
          medal: 'Gold',
          countryCode: country.countryCode,
          athletes: [athleteName]
        });
      }

      // Silver medals
      for (let i = 0; i < country.silver; i++) {
        const athleteEntry = athletes.find(a => a.type === 'Silver');
        const athleteName = athleteEntry ? athleteEntry.name : `Athlete from ${country.countryCode}`;
        if (athleteEntry) {
          athletes.splice(athletes.indexOf(athleteEntry), 1);
        }

        scrapedData.push({
          id: `${country.countryCode.toLowerCase()}-silver-${i + 1}`,
          event: 'Event',
          medal: 'Silver',
          countryCode: country.countryCode,
          athletes: [athleteName]
        });
      }

      // Bronze medals
      for (let i = 0; i < country.bronze; i++) {
        const athleteEntry = athletes.find(a => a.type === 'Bronze');
        const athleteName = athleteEntry ? athleteEntry.name : `Athlete from ${country.countryCode}`;
        if (athleteEntry) {
          athletes.splice(athletes.indexOf(athleteEntry), 1);
        }

        scrapedData.push({
          id: `${country.countryCode.toLowerCase()}-bronze-${i + 1}`,
          event: 'Event',
          medal: 'Bronze',
          countryCode: country.countryCode,
          athletes: [athleteName]
        });
      }
    });

    console.log(`\nGenerated ${scrapedData.length} medal records`);
    console.log(`Gold: ${scrapedData.filter(m => m.medal === 'Gold').length}`);
    console.log(`Silver: ${scrapedData.filter(m => m.medal === 'Silver').length}`);
    console.log(`Bronze: ${scrapedData.filter(m => m.medal === 'Bronze').length}`);

    const withRealNames = scrapedData.filter(m => !m.athletes[0].startsWith('Athlete from')).length;
    const canadianMedals = scrapedData.filter(m => m.countryCode === 'CAN');
    console.log(`Medals with real athlete names: ${withRealNames}`);
    console.log(`Canadian medals: ${canadianMedals.length}`);
    canadianMedals.forEach(m => console.log(`  ${m.medal}: ${m.athletes[0]}`));

    if (scrapedData.length > 0) {
      const fileContent = `import { MedalWin, MedalType } from '../types';

/**
 * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Scraped from: ${MEDAL_TABLE_URL} and ${ATHLETES_URL}
 * Timestamp: ${new Date().toISOString()}
 * 
 * Complete medal counts with real athlete names where available.
 * Regional attribution will match athlete names against Quebec/Scotland/Catalonia lists.
 */
export const OLYMPIC_DATA: MedalWin[] = ${JSON.stringify(scrapedData, null, 2)};
`;

      fs.writeFileSync(OUTPUT_FILE, fileContent);
      console.log(`✅ Successfully wrote ${scrapedData.length} medals!`);
    }

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  } finally {
    await browser.close();
  }
})();