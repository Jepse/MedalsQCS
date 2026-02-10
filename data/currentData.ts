import { MedalWin, MedalType } from '../types';

// This file is the default target for the scraper script.
// It initializes with the Mock Data so the app works immediately.
// When the GitHub Action runs, this file will be overwritten with real scraped data.

export const OLYMPIC_DATA: MedalWin[] = [
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