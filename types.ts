export enum MedalType {
  GOLD = 'Gold',
  SILVER = 'Silver',
  BRONZE = 'Bronze',
}

export interface Athlete {
  name: string;
  sport: string;
}

export interface MedalWin {
  id: string;
  event: string;
  medal: MedalType;
  countryCode: string; // The official country code (e.g., CAN, GBR, ESP)
  athletes: string[]; // List of athlete names involved in this win
}

export interface CountryStats {
  rank: number;
  countryCode: string;
  countryName: string;
  flagUrl: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  isRegion?: boolean; // To highlight the new regions
}

export interface TransferLog {
  id: string;
  originalCountry: string;
  newRegion: string;
  athleteNames: string[];
  medal: MedalType;
  event: string;
}

export interface RegionDefinition {
  id: string;
  name: string;
  parentCountryCode: string;
  flagUrl: string;
  athletes: string[]; // List of names belonging to this region
}