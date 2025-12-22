export type PlantingMethod = "indoor" | "outdoor" | "both";

export type PlantingWindow = {
  start: string;
  end: string;
};

export type PlantingWindows = {
  indoors: PlantingWindow;
  outdoors: PlantingWindow;
};

export type MovePlantOutdoor = {
  description: string;
  start: string;
  end: string;
};

export type HarvestTime = {
  start: string;
  end: string;
};

/**
 * Raw plant shape as it exists in `plants.json`.
 */
export type RawPlant = {
  id: number;
  type: string;
  name: string;
  englishName?: string;
  scientificName?: string;
  category: string;
  subcategory: string;

  articleNumber?: string;
  url?: string;
  price?: string;
  inStock?: boolean;
  isOrganic?: boolean;

  imageUrl?: string;
  imageUrls?: string[];

  annuality?: string;
  portionSize?: string;
  height?: string;
  color?: string;
  growingLocation?: string;

  plantingWindows: PlantingWindows;

  // Legacy field from existing dataset (can be number or string).
  daysToHarvest?: number | string;

  harvestTime?: HarvestTime;
  germinationTime?: string;
  germinationTemperature?: string;
  growingTemperature?: string;
  frostTolerant?: boolean | null;
  source?: string;

  // todo ta bort kommentar!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // Enrichment fields (may be missing until migration is done)
  daysOutdoorToHarvest?: number | null;
  daysIndoorGrowth?: number | null;
  hardeningDays?: number | null;
  plantingMethod?: PlantingMethod;
  movePlantOutdoor?: MovePlantOutdoor;
};

/**
 * Normalized plant shape used by the app (returned by services).
 * This is the stable contract we code against.
 */
export type Plant = Omit<
  RawPlant,
  "daysToHarvest" | "daysOutdoorToHarvest" | "plantingMethod" | "movePlantOutdoor" | "germinationTime" | "germinationTemperature" | "growingTemperature" | "frostTolerant"
> & {
  daysOutdoorToHarvest: number | null;
  daysIndoorGrowth: number | null;
  hardeningDays: number | null;
  plantingMethod: PlantingMethod;
  movePlantOutdoor: MovePlantOutdoor | null;
  germinationTime: string | null;
  germinationTemperature: string | null;
  growingTemperature: string | null;
  frostTolerant: boolean | null;

  // Keep legacy raw fields optional for traceability/debugging.
  daysToHarvest?: number | string;
};


