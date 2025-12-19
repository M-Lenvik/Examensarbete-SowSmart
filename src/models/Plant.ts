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

  // TODO: KOLLA OM INTE DETTA ÄNDRAS MED NYA JSON FILEN SEN, DEN BORDE INTE VARA TOM. BORDE KUNNA VARA NUMBER!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // Legacy field from existing dataset (often empty string).
  daysToHarvest?: string;

  harvestTime?: HarvestTime;
  germinationTime?: string;
  frostTolerant?: boolean;
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
  "daysToHarvest" | "daysOutdoorToHarvest" | "plantingMethod" | "movePlantOutdoor"
> & {
  daysOutdoorToHarvest: number | null;
  daysIndoorGrowth: number | null;
  hardeningDays: number | null;
  plantingMethod: PlantingMethod;
  movePlantOutdoor: MovePlantOutdoor | null;

  // Keep legacy raw fields optional for traceability/debugging.
  daysToHarvest?: string;
};


