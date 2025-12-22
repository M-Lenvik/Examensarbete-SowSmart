import type { Plant, PlantingMethod, RawPlant } from "../models/Plant";
import {
  DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY,
  DEFAULT_PLANTING_METHOD_BY_SUBCATEGORY,
  DEFAULT_FROST_TOLERANT_BY_SUBCATEGORY,
  DEFAULT_GERMINATION_TIME_BY_SUBCATEGORY,
  DEFAULT_GERMINATION_TEMPERATURE_BY_SUBCATEGORY,
  DEFAULT_GROWING_TEMPERATURE_BY_SUBCATEGORY,
  GLOBAL_DEFAULT_HARDENING_DAYS,
  GLOBAL_DEFAULT_PLANTING_METHOD,
  GLOBAL_DEFAULT_FROST_TOLERANT,
  GLOBAL_DEFAULT_GERMINATION_TIME,
  GLOBAL_DEFAULT_GERMINATION_TEMPERATURE,
  GLOBAL_DEFAULT_GROWING_TEMPERATURE,
  getDefaultMovePlantOutdoor,
} from "./plantDefaults";

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

  if (hasIndoors && hasOutdoors) return "both";
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

  // 4. Use global default
  console.warn(
    `[normalizePlant] Missing plantingMethod for "${raw.name}" (${raw.subcategory}), using global default: ${GLOBAL_DEFAULT_PLANTING_METHOD}`
  );
  return GLOBAL_DEFAULT_PLANTING_METHOD;
};

/**
 * Normalize a RawPlant into the app's stable Plant type.
 * Never throws; instead uses safe defaults.
 * 
 * Fallback order:
 * 1. Use value from raw if present
 * 2. Use subcategory default from plantDefaults.ts
 * 3. Use global default
 * 4. Use null and log warning
 */
export const normalizePlant = (raw: RawPlant): Plant => {
  // Calculate plantingMethod early as it's needed for other fields
  const plantingMethod = inferPlantingMethod(raw);

  // daysOutdoorToHarvest: use raw value or legacy daysToHarvest, otherwise null
  const daysOutdoorToHarvest =
    raw.daysOutdoorToHarvest ?? toNullableNumber(raw.daysToHarvest) ?? null;

  // daysIndoorGrowth: use raw value, otherwise null (no defaults available)
  const daysIndoorGrowth = raw.daysIndoorGrowth ?? null;

  // hardeningDays: use raw value, then subcategory default, then global default
  let hardeningDays = raw.hardeningDays ?? null;
  if (hardeningDays === null) {
    const subcategoryDefault = DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      hardeningDays = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing hardeningDays for "${raw.name}" (${raw.subcategory}), using subcategory default: ${hardeningDays}`
      );
    } else {
      // Use global default only for indoor plants
      if (plantingMethod === "indoor") {
        hardeningDays = GLOBAL_DEFAULT_HARDENING_DAYS;
        console.warn(
          `[normalizePlant] Missing hardeningDays for "${raw.name}" (${raw.subcategory}), using global default: ${hardeningDays}`
        );
      }
    }
  }

  // frostTolerant: use raw value, then subcategory default, then global default
  let frostTolerant = raw.frostTolerant ?? null;
  if (frostTolerant === null) {
    const subcategoryDefault = DEFAULT_FROST_TOLERANT_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      frostTolerant = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing frostTolerant for "${raw.name}" (${raw.subcategory}), using subcategory default: ${frostTolerant}`
      );
    } else {
      frostTolerant = GLOBAL_DEFAULT_FROST_TOLERANT;
      console.warn(
        `[normalizePlant] Missing frostTolerant for "${raw.name}" (${raw.subcategory}), using global default: ${frostTolerant}`
      );
    }
  }

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

  // germinationTime: use raw value, then subcategory default, then global default
  let germinationTime = raw.germinationTime ?? null;
  if (germinationTime === null) {
    const subcategoryDefault = DEFAULT_GERMINATION_TIME_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      germinationTime = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing germinationTime for "${raw.name}" (${raw.subcategory}), using subcategory default: ${germinationTime}`
      );
    } else {
      germinationTime = GLOBAL_DEFAULT_GERMINATION_TIME;
      console.warn(
        `[normalizePlant] Missing germinationTime for "${raw.name}" (${raw.subcategory}), using global default: ${germinationTime}`
      );
    }
  }

  // germinationTemperature: use raw value, then subcategory default, then global default
  let germinationTemperature = raw.germinationTemperature ?? null;
  if (germinationTemperature === null) {
    const subcategoryDefault = DEFAULT_GERMINATION_TEMPERATURE_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      germinationTemperature = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing germinationTemperature for "${raw.name}" (${raw.subcategory}), using subcategory default: ${germinationTemperature}`
      );
    } else {
      germinationTemperature = GLOBAL_DEFAULT_GERMINATION_TEMPERATURE;
      console.warn(
        `[normalizePlant] Missing germinationTemperature for "${raw.name}" (${raw.subcategory}), using global default: ${germinationTemperature}`
      );
    }
  } else {
    // Normalize existing value to use "grader"
    germinationTemperature = normalizeTemperatureString(germinationTemperature);
  }

  // growingTemperature: use raw value, then subcategory default, then global default
  let growingTemperature = raw.growingTemperature ?? null;
  if (growingTemperature === null) {
    const subcategoryDefault = DEFAULT_GROWING_TEMPERATURE_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      growingTemperature = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing growingTemperature for "${raw.name}" (${raw.subcategory}), using subcategory default: ${growingTemperature}`
      );
    } else {
      growingTemperature = GLOBAL_DEFAULT_GROWING_TEMPERATURE;
      console.warn(
        `[normalizePlant] Missing growingTemperature for "${raw.name}" (${raw.subcategory}), using global default: ${growingTemperature}`
      );
    }
  } else {
    // Normalize existing value to use "grader"
    growingTemperature = normalizeTemperatureString(growingTemperature);
  }

  return {
    ...raw,
    daysOutdoorToHarvest,
    daysIndoorGrowth,
    hardeningDays,
    plantingMethod,
    movePlantOutdoor,
    germinationTime,
    germinationTemperature,
    growingTemperature,
    frostTolerant,
  };
};


