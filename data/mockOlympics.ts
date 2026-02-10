import { MedalWin, MedalType, CountryStats } from '../types';

/**
 * Since Milano Cortina 2026 hasn't happened yet, this data simulates
 * what the "Scraper" would return. It includes a mix of regional and 
 * non-regional athletes winning medals for their parent countries.
 */
export const MOCK_RAW_MEDALS: MedalWin[] = [
  // --- CANADA (Quebec & Non-Quebec Mix) ---
  {
    id: 'can-1',
    event: 'Men\'s Moguls',
    medal: MedalType.GOLD,
    countryCode: 'CAN',
    athletes: ['Mikaël Kingsbury'] // QUEBEC
  },
  {
    id: 'can-2',
    event: 'Women\'s Hockey',
    medal: MedalType.GOLD,
    countryCode: 'CAN',
    athletes: ['Marie-Philip Poulin', 'Sarah Fillier', 'Erin Ambrose', 'Ann-Renée Desbiens'] // Mixed, but Captain is QUE
  },
  {
    id: 'can-3',
    event: 'Men\'s Snowboard Cross',
    medal: MedalType.SILVER,
    countryCode: 'CAN',
    athletes: ['Éliot Grondin'] // QUEBEC
  },
  {
    id: 'can-4',
    event: 'Men\'s Slopestyle',
    medal: MedalType.BRONZE,
    countryCode: 'CAN',
    athletes: ['Mark McMorris'] // SASK (Not Quebec)
  },
  {
    id: 'can-5',
    event: 'Short Track 500m',
    medal: MedalType.GOLD,
    countryCode: 'CAN',
    athletes: ['Steven Dubois'] // QUEBEC
  },
  
  // --- GREAT BRITAIN (Scotland & Non-Scotland Mix) ---
  {
    id: 'gbr-1',
    event: 'Men\'s Curling',
    medal: MedalType.GOLD,
    countryCode: 'GBR',
    athletes: ['Bruce Mouat', 'Grant Hardie', 'Bobby Lammie', 'Hammy McMillan Jnr'] // ALL SCOTLAND
  },
  {
    id: 'gbr-2',
    event: 'Women\'s Skeleton',
    medal: MedalType.BRONZE,
    countryCode: 'GBR',
    athletes: ['Tabitha Stoecker'] // England (Hypothetical)
  },
  {
    id: 'gbr-3',
    event: 'Mixed Doubles Curling',
    medal: MedalType.SILVER,
    countryCode: 'GBR',
    athletes: ['Bruce Mouat', 'Jennifer Dodds'] // SCOTLAND
  },

  // --- SPAIN (Catalonia & Non-Catalonia Mix) ---
  {
    id: 'esp-1',
    event: 'Women\'s Snowboard Halfpipe',
    medal: MedalType.SILVER,
    countryCode: 'ESP',
    athletes: ['Queralt Castellet'] // CATALONIA
  },
  {
    id: 'esp-2',
    event: 'Men\'s Figure Skating',
    medal: MedalType.BRONZE,
    countryCode: 'ESP',
    athletes: ['Tomàs-Llorenç Guarino Sabaté'] // CATALONIA
  },
  {
    id: 'esp-3',
    event: 'Men\'s Skeleton',
    medal: MedalType.GOLD,
    countryCode: 'ESP',
    athletes: ['Ander Mirambell'] // CATALONIA (Actually retired, but hypothetical for list matching logic)
  }, 
  {
    id: 'esp-4',
    event: 'Mixed Snowboard Cross',
    medal: MedalType.BRONZE,
    countryCode: 'ESP',
    athletes: ['Lucas Eguibar', 'Álvaro Romero'] // Basque/Other (Not Catalonia)
  },

  // --- OTHER NATIONS (To populate the table) ---
  { id: 'nor-1', event: 'Biathlon Sprint', medal: MedalType.GOLD, countryCode: 'NOR', athletes: ['Johannes Boe'] },
  { id: 'nor-2', event: 'Biathlon Pursuit', medal: MedalType.GOLD, countryCode: 'NOR', athletes: ['Johannes Boe'] },
  { id: 'nor-3', event: 'XC Skiing', medal: MedalType.SILVER, countryCode: 'NOR', athletes: ['Klæbo'] },
  { id: 'usa-1', event: 'Figure Skating', medal: MedalType.GOLD, countryCode: 'USA', athletes: ['Ilia Malinin'] },
  { id: 'usa-2', event: 'Ice Hockey', medal: MedalType.SILVER, countryCode: 'USA', athletes: ['Team USA'] },
  { id: 'ger-1', event: 'Luge', medal: MedalType.GOLD, countryCode: 'GER', athletes: ['Felix Loch'] },
];

export const INITIAL_COUNTRY_STATS: CountryStats[] = [
    { rank: 0, countryCode: 'NOR', countryName: 'Norway', flagUrl: 'https://flagcdn.com/w320/no.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'USA', countryName: 'United States', flagUrl: 'https://flagcdn.com/w320/us.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'GER', countryName: 'Germany', flagUrl: 'https://flagcdn.com/w320/de.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'CAN', countryName: 'Canada', flagUrl: 'https://flagcdn.com/w320/ca.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'GBR', countryName: 'Great Britain', flagUrl: 'https://flagcdn.com/w320/gb.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'ESP', countryName: 'Spain', flagUrl: 'https://flagcdn.com/w320/es.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'AUT', countryName: 'Austria', flagUrl: 'https://flagcdn.com/w320/at.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'SWE', countryName: 'Sweden', flagUrl: 'https://flagcdn.com/w320/se.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'ITA', countryName: 'Italy', flagUrl: 'https://flagcdn.com/w320/it.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'NED', countryName: 'Netherlands', flagUrl: 'https://flagcdn.com/w320/nl.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'FRA', countryName: 'France', flagUrl: 'https://flagcdn.com/w320/fr.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'SUI', countryName: 'Switzerland', flagUrl: 'https://flagcdn.com/w320/ch.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'FIN', countryName: 'Finland', flagUrl: 'https://flagcdn.com/w320/fi.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'CHN', countryName: 'China', flagUrl: 'https://flagcdn.com/w320/cn.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'JPN', countryName: 'Japan', flagUrl: 'https://flagcdn.com/w320/jp.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'KOR', countryName: 'South Korea', flagUrl: 'https://flagcdn.com/w320/kr.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'AUS', countryName: 'Australia', flagUrl: 'https://flagcdn.com/w320/au.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'SLO', countryName: 'Slovenia', flagUrl: 'https://flagcdn.com/w320/si.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'CZE', countryName: 'Czechia', flagUrl: 'https://flagcdn.com/w320/cz.png', gold: 0, silver: 0, bronze: 0, total: 0 },
    { rank: 0, countryCode: 'POL', countryName: 'Poland', flagUrl: 'https://flagcdn.com/w320/pl.png', gold: 0, silver: 0, bronze: 0, total: 0 },
];
