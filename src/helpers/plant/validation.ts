import type { Plant, PlantingMethod, RawPlant } from "../../models/Plant";
import {
  DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY,
  DEFAULT_PLANTING_METHOD_BY_SUBCATEGORY,
  DEFAULT_FROST_TOLERANT_BY_SUBCATEGORY,
  DEFAULT_GERMINATION_TIME_BY_SUBCATEGORY,
  DEFAULT_GERMINATION_TEMPERATURE_BY_SUBCATEGORY,
  DEFAULT_GROWING_TEMPERATURE_BY_SUBCATEGORY,
  DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY,
  getDefaultMovePlantOutdoor,
} from "./plantDefaults";
import { calculateTotalDaysFromSeed } from "../calculation/totalDaysFromSeed";

/**
 * Helper functions for normalizing and validating plant data.
 * 
 * Data sources:
 * - Raw plant data comes from plants.json (via RawPlant type)
 * - Defaults come from plantDefaults.ts (based on subcategory)
 * - Calculates totalDaysFromSeed from plantingWindows and harvestTime
 */

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
  return value === "indoor" || value === "outdoor";
};

/**
 * Normalize temperature string to use "grader" instead of "gr".
 * Preserves other parts of the string (ranges, "ca", etc.).
 * Examples: "22-25 gr" → "22-25 grader", "ca 25 gr" → "ca 25 grader"
 */
const normalizeTemperatureString = (value: string | null): string | null => {
  if (!value) return null;
  
  const words = value.split(" ");
  const normalizedWords = words.map((word) => {
    if (word.toLowerCase() === "gr") {
      return "grader";
    }
    return word;
  });

  return normalizedWords.join(" ");
};

/**
 * Get a value with fallback to subcategory default.
 * Returns the value if not null, otherwise tries subcategory default, otherwise null.
 */
const getValueWithDefault = <T>(
  value: T | null | undefined,
  subcategory: string,
  defaults: Record<string, T>,
  fieldName: string,
  plantName: string
): T | null => {
  if (value !== null && value !== undefined) {
    return value;
  }

  const subcategoryDefault = defaults[subcategory];
  if (subcategoryDefault !== undefined) {
    console.warn(
      `[normalizePlant] Missing ${fieldName} for "${plantName}" (${subcategory}), using subcategory default: ${subcategoryDefault}`
    );
    return subcategoryDefault;
  }

  console.error(
    `[normalizePlant] Missing ${fieldName} for "${plantName}" (${subcategory}) and no subcategory default available. This plant may need manual data entry.`
  );
  return null;
};

/**
 * Calculate daysOutdoor from totalDaysFromSeed and daysIndoorGrowth.
 * Returns null if either input is null or if result would be negative.
 */
const calculateDaysOutdoor = (
  totalDaysFromSeed: number | null,
  daysIndoorGrowth: number | null,
  plantName: string
): number | null => {
  if (totalDaysFromSeed === null || daysIndoorGrowth === null) {
    return null;
  }

  const daysOutdoor = totalDaysFromSeed - daysIndoorGrowth;
  if (daysOutdoor < 0) {
    console.warn(
      `[normalizePlant] Calculated negative daysOutdoor for "${plantName}" (${totalDaysFromSeed} - ${daysIndoorGrowth} = ${daysOutdoor}), setting to null`
    );
    return null;
  }

  return daysOutdoor;
};

/**
 * Get daysIndoorGrowth for indoor plants, always null for outdoor plants.
 */
const getDaysIndoorGrowth = (
  raw: RawPlant,
  plantingMethod: PlantingMethod
): number | null => {
  if (plantingMethod !== "indoor") {
    if (raw.daysIndoorGrowth !== null && raw.daysIndoorGrowth !== undefined) {
      console.warn(
        `[normalizePlant] Ignoring daysIndoorGrowth (${raw.daysIndoorGrowth}) for outdoor plant "${raw.name}" - setting to null`
      );
    }
    return null;
  }

  return getValueWithDefault(
    raw.daysIndoorGrowth,
    raw.subcategory,
    DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY,
    "daysIndoorGrowth",
    raw.name
  );
};

/**
 * Get hardeningDays with fallback to subcategory default.
 * Only logs error for indoor plants.
 */
const getHardeningDays = (
  raw: RawPlant,
  plantingMethod: PlantingMethod
): number | null => {
  const value = getValueWithDefault(
    raw.hardeningDays,
    raw.subcategory,
    DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY,
    "hardeningDays",
    raw.name
  );

  // Only log error for indoor plants if no default found
  if (value === null && plantingMethod === "indoor") {
    console.error(
      `[normalizePlant] Missing hardeningDays for "${raw.name}" (${raw.subcategory}) and no subcategory default available. This plant may need manual data entry.`
    );
  }

  return value;
};

/**
 * Get temperature value with normalization and fallback to subcategory default.
 */
const getTemperatureWithDefault = (
  rawValue: string | null,
  subcategory: string,
  defaults: Record<string, string>,
  fieldName: string,
  plantName: string
): string | null => {
  if (rawValue !== null) {
    return normalizeTemperatureString(rawValue);
  }

  const subcategoryDefault = defaults[subcategory];
  if (subcategoryDefault !== undefined) {
    console.warn(
      `[normalizePlant] Missing ${fieldName} for "${plantName}" (${subcategory}), using subcategory default: ${subcategoryDefault}`
    );
    return subcategoryDefault;
  }

  console.error(
    `[normalizePlant] Missing ${fieldName} for "${plantName}" (${subcategory}) and no subcategory default available. This plant may need manual data entry.`
  );
  return null;
};

const inferPlantingMethod = (raw: RawPlant): PlantingMethod => {
  // 1. Use explicit value if present
  if (isPlantingMethod(raw.plantingMethod)) return raw.plantingMethod;

  // 2. Infer from planting windows
  const hasIndoors =
    raw.plantingWindows.indoors.start.trim().length > 0 ||
    raw.plantingWindows.indoors.end.trim().length > 0;
  const hasOutdoors =
    raw.plantingWindows.outdoors.start.trim().length > 0 ||
    raw.plantingWindows.outdoors.end.trim().length > 0;

  // If both exist, prefer indoor
  if (hasIndoors && hasOutdoors) return "indoor";
  if (hasIndoors) return "indoor";
  if (hasOutdoors) return "outdoor";

  // 3. Use subcategory default
  const subcategoryDefault = DEFAULT_PLANTING_METHOD_BY_SUBCATEGORY[raw.subcategory];
  if (subcategoryDefault) {
    console.warn(
      `[normalizePlant] Missing plantingMethod for "${raw.name}" (${raw.subcategory}), using subcategory default: ${subcategoryDefault}`
    );
    return subcategoryDefault;
  }

  // 4. Use category-based default
  if (raw.category === "grönsaker") {
    // For vegetables, default to "indoor" except for ärter and bönor
    if (raw.subcategory === "ärter" || raw.subcategory === "bönor") {
      console.warn(
        `[normalizePlant] Missing plantingMethod for "${raw.name}" (${raw.subcategory}), using category-based default: "outdoor" (ärter/bönor)`
      );
      return "outdoor";
    }
    console.warn(
      `[normalizePlant] Missing plantingMethod for "${raw.name}" (${raw.subcategory}), using category-based default: "indoor" (grönsaker)`
    );
    return "indoor";
  }

  // 5. Category is not "grönsaker" - log error and use fallback
  console.error(
    `[normalizePlant] Missing plantingMethod for "${raw.name}" (category: "${raw.category}", subcategory: "${raw.subcategory}") and no defaults available. Category is not "grönsaker". Using fallback: "outdoor"`
  );
  return "outdoor";
};

/**
 * Normalize a RawPlant into the app's stable Plant type.
 * Never throws; instead uses safe defaults.
 * 
 * Fallback order:
 * 1. Use value from raw if present
 * 2. Use subcategory default from plantDefaults.ts
 * 3. Use null and log warning/error
 */
export const normalizePlant = (raw: RawPlant): Plant => {
  // Calculate plantingMethod early as it's needed for other fields
  const plantingMethod = inferPlantingMethod(raw);

  // totalDaysFromSeed: calculate from plantingWindows and harvestTime
  // This is now calculated, not read from JSON
  // Pass plantingMethod to ensure outdoor plants use outdoors window
  const totalDaysFromSeed = calculateTotalDaysFromSeed(raw.plantingWindows, raw.harvestTime ?? null, plantingMethod);

  // daysIndoorGrowth: only for indoor plants, always null for outdoor plants
  const daysIndoorGrowth = getDaysIndoorGrowth(raw, plantingMethod);

  // daysOutdoor: calculate from totalDaysFromSeed and daysIndoorGrowth
  // Formula: daysOutdoor = totalDaysFromSeed - daysIndoorGrowth
  const daysOutdoor = calculateDaysOutdoor(totalDaysFromSeed, daysIndoorGrowth, raw.name);

  // hardeningDays: use raw value, then subcategory default
  const hardeningDays = getHardeningDays(raw, plantingMethod);

  // frostTolerant: use raw value, then subcategory default
  const frostTolerant = getValueWithDefault(
    raw.frostTolerant,
    raw.subcategory,
    DEFAULT_FROST_TOLERANT_BY_SUBCATEGORY,
    "frostTolerant",
    raw.name
  );

  // movePlantOutdoor: use raw value, then getDefaultMovePlantOutdoor
  let movePlantOutdoor = raw.movePlantOutdoor ?? null;
  if (movePlantOutdoor === null && plantingMethod === "indoor") {
    movePlantOutdoor = getDefaultMovePlantOutdoor(raw.subcategory, frostTolerant);
    if (movePlantOutdoor) {
      console.warn(
        `[normalizePlant] Missing movePlantOutdoor for "${raw.name}" (${raw.subcategory}), using default`
      );
    }
  }

  // germinationTime: use raw value, then subcategory default
  const germinationTime = getValueWithDefault(
    raw.germinationTime,
    raw.subcategory,
    DEFAULT_GERMINATION_TIME_BY_SUBCATEGORY,
    "germinationTime",
    raw.name
  );

  // germinationTemperature: use raw value, then subcategory default, normalize to use "grader"
  const germinationTemperature = getTemperatureWithDefault(
    raw.germinationTemperature ?? null,
    raw.subcategory,
    DEFAULT_GERMINATION_TEMPERATURE_BY_SUBCATEGORY,
    "germinationTemperature",
    raw.name
  );

  // growingTemperature: use raw value, then subcategory default, normalize to use "grader"
  const growingTemperature = getTemperatureWithDefault(
    raw.growingTemperature ?? null,
    raw.subcategory,
    DEFAULT_GROWING_TEMPERATURE_BY_SUBCATEGORY,
    "growingTemperature",
    raw.name
  );

  // soilMix, transplantingInstructions, careInstructions, description: use raw value or null
  const soilMix = raw.soilMix?.trim() || null;
  const transplantingInstructions = raw.transplantingInstructions?.trim() || null;
  const careInstructions = raw.careInstructions?.trim() || null;
  const description = raw.description?.trim() || null;

  return {
    ...raw,
    daysOutdoor,
    daysIndoorGrowth,
    hardeningDays,
    plantingMethod,
    movePlantOutdoor,
    germinationTime,
    germinationTemperature,
    growingTemperature,
    frostTolerant,
    totalDaysFromSeed,
    soilMix,
    transplantingInstructions,
    careInstructions,
    description,
  };
};


