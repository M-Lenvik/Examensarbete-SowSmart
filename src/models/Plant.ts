export type PlantingMethod = "indoor" | "outdoor";

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
 * 
 * This type represents the exact structure of plant data as it appears in the JSON file.
 * It may contain inconsistent or optional fields that need normalization before use.
 * 
 * **When to use**: Only in `plantsService.ts` when loading and validating data from `plants.json`.
 * **When NOT to use**: Never use this type in components, pages, or other application code.
 * 
 * @see {@link Plant} - Use this normalized type instead for all application logic.
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
  soilMix?: string;
  transplantingInstructions?: string;
  careInstructions?: string;
  description?: string;
  daysOutdoor?: number | null;
  daysIndoorGrowth?: number | null;
  hardeningDays?: number | null;
  plantingMethod?: PlantingMethod;
  movePlantOutdoor?: MovePlantOutdoor;
  totalDaysFromSeed?: number | null;
};

/**
 * Normalized plant shape used by the app (returned by services).
 * 
 * This is the **stable, internal contract** that all application code should use.
 * It represents a plant with all fields normalized, validated, and guaranteed to have
 * consistent types (e.g., `daysOutdoor` is always `number | null`, never `string | number | null`).
 * 
 * **Key differences from RawPlant:**
 * - All optional fields that should be nullable are explicitly `| null` instead of `| undefined`
 * - Legacy fields like `daysToHarvest` are kept optional for debugging but should not be used
 * - Fields are normalized during data loading in `plantsService.ts`
 * 
 * **When to use**: Always use this type in components, pages, helpers, and all application logic.
 * **When NOT to use**: Do not use when loading raw data from JSON - use `RawPlant` instead.
 * 
 * @see {@link RawPlant} - The raw data structure from `plants.json` before normalization.
 */
export type Plant = Omit<
  RawPlant,
  "daysToHarvest" | "daysOutdoor" | "plantingMethod" | "movePlantOutdoor" | "germinationTime" | "germinationTemperature" | "growingTemperature" | "frostTolerant" | "totalDaysFromSeed" | "soilMix" | "transplantingInstructions" | "careInstructions" | "description"
> & {
  daysOutdoor: number | null;
  daysIndoorGrowth: number | null;
  hardeningDays: number | null;
  plantingMethod: PlantingMethod;
  movePlantOutdoor: MovePlantOutdoor | null;
  germinationTime: string | null;
  germinationTemperature: string | null;
  growingTemperature: string | null;
  frostTolerant: boolean | null;
  totalDaysFromSeed: number | null;
  soilMix: string | null;
  transplantingInstructions: string | null;
  careInstructions: string | null;
  description: string | null;

  // Keep legacy raw fields optional for traceability/debugging.
  daysToHarvest?: number | string;
};


