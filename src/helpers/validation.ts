import type { Plant, PlantingMethod, RawPlant } from "../models/Plant";

const DEFAULT_PLANTING_METHOD: PlantingMethod = "outdoor";

/**
 * Parse a value into a nullable number.
 * Returns null for empty strings, non-numeric strings, NaN, or non-finite numbers.
 */
export const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  const num = Number(trimmed.replace(",", "."));
  return Number.isFinite(num) ? num : null;
};

export const isPlantingMethod = (value: unknown): value is PlantingMethod => {
  return value === "indoor" || value === "outdoor" || value === "both";
};

const inferPlantingMethod = (raw: RawPlant): PlantingMethod => {
  if (isPlantingMethod(raw.plantingMethod)) return raw.plantingMethod;

  const hasIndoors =
    raw.plantingWindows.indoors.start.trim().length > 0 ||
    raw.plantingWindows.indoors.end.trim().length > 0;
  const hasOutdoors =
    raw.plantingWindows.outdoors.start.trim().length > 0 ||
    raw.plantingWindows.outdoors.end.trim().length > 0;

  if (hasIndoors && hasOutdoors) return "both";
  if (hasIndoors) return "indoor";
  if (hasOutdoors) return "outdoor";

  return DEFAULT_PLANTING_METHOD;
};

/**
 * Normalize a RawPlant into the app's stable Plant type.
 * Never throws; instead uses safe defaults.
 */
export const normalizePlant = (raw: RawPlant): Plant => {
  const daysOutdoorToHarvest =
    raw.daysOutdoorToHarvest ?? toNullableNumber(raw.daysToHarvest) ?? null;

  const daysIndoorGrowth = raw.daysIndoorGrowth ?? null;
  const hardeningDays = raw.hardeningDays ?? null;
  const plantingMethod = inferPlantingMethod(raw);
  const movePlantOutdoor = raw.movePlantOutdoor ?? null;

  return {
    ...raw,
    daysOutdoorToHarvest,
    daysIndoorGrowth,
    hardeningDays,
    plantingMethod,
    movePlantOutdoor,
  };
};


