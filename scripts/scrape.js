const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const MEDALLISTS_URL = 'https://www.olympics.com/en/milano-cortina-2026/medals/medallists';
const OUTPUT_FILE = path.join(__dirname, '../data/currentData.ts');

(async () => {
  console.log('Starting Scraper...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${MEDALLISTS_URL}...`);
    await page.goto(MEDALLISTS_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Note: Since the 2026 page might be empty or change structure, 
    // this selector logic targets the standard Olympic tabular structure.
    // You may need to inspect the 2026 page once live to adjust class names.
    
    // Waiting for the main container
    // We assume there is a list or table of medallists
    // If the page is empty (pre-games), this might time out or return empty array.
    
    const scrapedData = await page.evaluate(() => {
      const results = [];
      const rows = document.querySelectorAll('[data-cy="medallist-row"], .medallist-row, tr.medalist'); // Heuristic selectors

      rows.forEach((row, index) => {
        // Extract Country
        const countryEl = row.querySelector('.country-flag, [data-cy="country-code"]');
        const countryCode = countryEl ? countryEl.innerText.trim() : 'UNK';

        // Extract Medal
        let medal = 'Bronze';
        const text = row.innerText.toLowerCase();
        if (text.includes('gold')) medal = 'Gold';
        else if (text.includes('silver')) medal = 'Silver';

        // Extract Event
        const eventEl = row.querySelector('.event-name, [data-cy="event-title"]');
        const event = eventEl ? eventEl.innerText.trim() : 'Unknown Event';

        // Extract Athletes
        // Usually a list of names or a single name
        const nameEls = row.querySelectorAll('.athlete-name, [data-cy="athlete-name"]');
        const athletes = [];
        nameEls.forEach(el => athletes.push(el.innerText.trim()));
        
        // Fallback if no specific class found, try generic text parsing
        if (athletes.length === 0) {
           const potentialName = row.querySelector('strong, h3');
           if (potentialName) athletes.push(potentialName.innerText.trim());
        }

        if (countryCode !== 'UNK') {
            results.push({
                id: `scraped-${index}`,
                event: event,
                medal: medal, // Will map to Enum string
                countryCode: countryCode,
                athletes: athletes
            });
        }
      });
      return results;
    });

    console.log(`Found ${scrapedData.length} medal records.`);

    // If no data found (e.g. before games), fallback to keep the file valid but empty 
    // OR keep using mock data if you prefer. 
    // Here we will write whatever we found.
    
    const fileContent = `
import { MedalWin, MedalType } from '../types';

/**
 * AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
 * Scraped from: ${MEDALLISTS_URL}
 * Timestamp: ${new Date().toISOString()}
 */
export const OLYMPIC_DATA: MedalWin[] = ${JSON.stringify(scrapedData, null, 2)};
`;

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`Successfully wrote data to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Scraping failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();