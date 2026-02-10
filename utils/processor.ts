import { MedalWin, CountryStats, TransferLog, MedalType, RegionDefinition } from '../types';
import { REGIONS } from '../data/regionalData';

// Helper to determine if a list of athletes belongs to a region (Majority Rule)
const isRegionalWin = (winAthletes: string[], region: RegionDefinition): boolean => {
  if (winAthletes.length === 0) return false;

  let matchCount = 0;
  
  // Normalize checking (case insensitive, basic trim)
  const normalizedRegionAthletes = region.athletes.map(a => a.toLowerCase().trim());

  winAthletes.forEach(athleteName => {
    // Check for exact match or substring match (e.g. "Bruce Mouat" in "Team Mouat")
    const isMatch = normalizedRegionAthletes.some(ra => 
       athleteName.toLowerCase().includes(ra) || ra.includes(athleteName.toLowerCase())
    );
    if (isMatch) matchCount++;
  });

  // Logic Gate: If > 50% of the team is from the region, claim the medal
  return (matchCount / winAthletes.length) > 0.5;
};

export const processMedals = (
  rawMedals: MedalWin[], 
  baseCountries: CountryStats[]
): { stats: CountryStats[], logs: TransferLog[] } => {
  
  // 1. Deep copy base stats to avoid mutation
  const statsMap = new Map<string, CountryStats>();
  baseCountries.forEach(c => statsMap.set(c.countryCode, { ...c, gold: 0, silver: 0, bronze: 0, total: 0 }));

  // 2. Initialize Regions in stats map
  REGIONS.forEach(region => {
    statsMap.set(region.id, {
      rank: 0,
      countryCode: region.id,
      countryName: region.name,
      flagUrl: region.flagUrl,
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0,
      isRegion: true
    });
  });

  const logs: TransferLog[] = [];

  // 3. Process every medal win
  rawMedals.forEach(win => {
    let assignedToCode = win.countryCode; // Default to parent nation

    // Check if this win belongs to a Region
    // We iterate regions to see if we can "steal" it
    for (const region of REGIONS) {
      if (win.countryCode === region.parentCountryCode) {
        if (isRegionalWin(win.athletes, region)) {
          assignedToCode = region.id;
          
          // Log the transfer
          logs.push({
            id: win.id,
            originalCountry: region.parentCountryCode,
            newRegion: region.name,
            athleteNames: win.athletes,
            medal: win.medal,
            event: win.event
          });
          break; // Stop checking other regions (assume mutually exclusive per parent)
        }
      }
    }

    // Update the stats for the assigned entity
    const stat = statsMap.get(assignedToCode);
    if (stat) {
      if (win.medal === MedalType.GOLD) stat.gold++;
      else if (win.medal === MedalType.SILVER) stat.silver++;
      else if (win.medal === MedalType.BRONZE) stat.bronze++;
      stat.total++;
    } else {
        // Fallback for nations not in INITIAL_COUNTRY_STATS (like NOR/GER in mock)
        // If we were building a full app, we'd fetch these details. 
        // For now, we add them dynamically if missing.
        statsMap.set(assignedToCode, {
            rank: 0,
            countryCode: assignedToCode,
            countryName: assignedToCode, // Fallback name
            flagUrl: `https://flagcdn.com/w320/${assignedToCode.toLowerCase().slice(0,2)}.png`, // Guessing flag URL
            gold: win.medal === MedalType.GOLD ? 1 : 0,
            silver: win.medal === MedalType.SILVER ? 1 : 0,
            bronze: win.medal === MedalType.BRONZE ? 1 : 0,
            total: 1
        });
    }
  });

  // 4. Convert Map to Array and Sort
  // Sort Logic: Gold DESC -> Silver DESC -> Bronze DESC -> Name ASC
  const sortedStats = Array.from(statsMap.values()).sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    return a.countryName.localeCompare(b.countryName);
  });

  // 5. Assign Ranks
  sortedStats.forEach((stat, index) => {
    stat.rank = index + 1;
  });

  return { stats: sortedStats, logs };
};