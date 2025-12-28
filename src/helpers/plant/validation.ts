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
 * 3. Use global default
 * 4. Use null and log warning
 */
export const normalizePlant = (raw: RawPlant): Plant => {
  // Calculate plantingMethod early as it's needed for other fields
  const plantingMethod = inferPlantingMethod(raw);

  // totalDaysFromSeed: calculate from plantingWindows and harvestTime
  // This is now calculated, not read from JSON
  const totalDaysFromSeed = calculateTotalDaysFromSeed(raw.plantingWindows, raw.harvestTime ?? null);

  // daysIndoorGrowth: use raw value (now contains values moved from totalDaysFromSeed), then subcategory default
  let daysIndoorGrowth = raw.daysIndoorGrowth ?? null;
  if (daysIndoorGrowth === null) {
    const subcategoryDefault = DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      daysIndoorGrowth = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing daysIndoorGrowth for "${raw.name}" (${raw.subcategory}), using subcategory default: ${daysIndoorGrowth}`
      );
    } else {
      // No default available - log error
      if (plantingMethod === "indoor" || plantingMethod === "both") {
        console.error(
          `[normalizePlant] Missing daysIndoorGrowth for "${raw.name}" (${raw.subcategory}) and no subcategory default available. This plant may need manual data entry.`
        );
      }
      // Leave as null - will be handled by calling code
    }
  }

  // daysOutdoor: calculate from totalDaysFromSeed and daysIndoorGrowth
  // Formula: daysOutdoor = totalDaysFromSeed - daysIndoorGrowth
  let daysOutdoor: number | null = null;
  if (totalDaysFromSeed !== null && daysIndoorGrowth !== null) {
    daysOutdoor = totalDaysFromSeed - daysIndoorGrowth;
    // Ensure non-negative result
    if (daysOutdoor < 0) {
      console.warn(
        `[normalizePlant] Calculated negative daysOutdoor for "${raw.name}" (${totalDaysFromSeed} - ${daysIndoorGrowth} = ${daysOutdoor}), setting to null`
      );
      daysOutdoor = null;
    }
  }

  // hardeningDays: use raw value, then subcategory default
  let hardeningDays = raw.hardeningDays ?? null;
  if (hardeningDays === null) {
    const subcategoryDefault = DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      hardeningDays = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing hardeningDays for "${raw.name}" (${raw.subcategory}), using subcategory default: ${hardeningDays}`
      );
    } else {
      // No default available - log error
      if (plantingMethod === "indoor") {
        console.error(
          `[normalizePlant] Missing hardeningDays for "${raw.name}" (${raw.subcategory}) and no subcategory default available. This plant may need manual data entry.`
        );
      }
      // Leave as null - will be handled by calling code
    }
  }

  // frostTolerant: use raw value, then subcategory default
  let frostTolerant = raw.frostTolerant ?? null;
  if (frostTolerant === null) {
    const subcategoryDefault = DEFAULT_FROST_TOLERANT_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      frostTolerant = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing frostTolerant for "${raw.name}" (${raw.subcategory}), using subcategory default: ${frostTolerant}`
      );
    } else {
      // No default available - log error
      console.error(
        `[normalizePlant] Missing frostTolerant for "${raw.name}" (${raw.subcategory}) and no subcategory default available. This plant may need manual data entry.`
      );
      // Leave as null - will be handled by calling code
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

  // germinationTime: use raw value, then subcategory default
  let germinationTime = raw.germinationTime ?? null;
  if (germinationTime === null) {
    const subcategoryDefault = DEFAULT_GERMINATION_TIME_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      germinationTime = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing germinationTime for "${raw.name}" (${raw.subcategory}), using subcategory default: ${germinationTime}`
      );
    } else {
      // No default available - log error
      console.error(
        `[normalizePlant] Missing germinationTime for "${raw.name}" (${raw.subcategory}) and no subcategory default available. This plant may need manual data entry.`
      );
      // Leave as null - will be handled by calling code
    }
  }

  // germinationTemperature: use raw value, then subcategory default
  let germinationTemperature = raw.germinationTemperature ?? null;
  if (germinationTemperature === null) {
    const subcategoryDefault = DEFAULT_GERMINATION_TEMPERATURE_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      germinationTemperature = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing germinationTemperature for "${raw.name}" (${raw.subcategory}), using subcategory default: ${germinationTemperature}`
      );
    } else {
      // No default available - log error
      console.error(
        `[normalizePlant] Missing germinationTemperature for "${raw.name}" (${raw.subcategory}) and no subcategory default available. This plant may need manual data entry.`
      );
      // Leave as null - will be handled by calling code
    }
  } else {
    // Normalize existing value to use "grader"
    germinationTemperature = normalizeTemperatureString(germinationTemperature);
  }

  // growingTemperature: use raw value, then subcategory default
  let growingTemperature = raw.growingTemperature ?? null;
  if (growingTemperature === null) {
    const subcategoryDefault = DEFAULT_GROWING_TEMPERATURE_BY_SUBCATEGORY[raw.subcategory];
    if (subcategoryDefault !== undefined) {
      growingTemperature = subcategoryDefault;
      console.warn(
        `[normalizePlant] Missing growingTemperature for "${raw.name}" (${raw.subcategory}), using subcategory default: ${growingTemperature}`
      );
    } else {
      // No default available - log error
      console.error(
        `[normalizePlant] Missing growingTemperature for "${raw.name}" (${raw.subcategory}) and no subcategory default available. This plant may need manual data entry.`
      );
      // Leave as null - will be handled by calling code
    }
  } else {
    // Normalize existing value to use "grader"
    growingTemperature = normalizeTemperatureString(growingTemperature);
  }

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
  };
};


