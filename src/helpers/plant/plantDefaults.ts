import type { MovePlantOutdoor, PlantingMethod } from "../../models/Plant";

/**
 * Default planting method by subcategory.
 * Used when plantingMethod is missing from raw data.
 */
export const DEFAULT_PLANTING_METHOD_BY_SUBCATEGORY: Record<string, PlantingMethod> = {
  // Frost-sensitive, typically started indoors
  "tomat": "indoor",
  "gurka": "indoor",
  "melon": "indoor",
  "aubergin": "indoor",
  "paprika": "indoor",
  "chili": "indoor",
  "physalis": "indoor",
  "pumpa": "indoor",
  // Frost-tolerant, typically direct-sown outdoors
  "ärter": "outdoor",
  "bönor": "outdoor",
  "sparris": "outdoor",
};

/**
 * Default hardening days by subcategory.
 * Used when hardeningDays is missing from raw data.
 * Most indoor-started plants need 7 days of hardening.
 */
export const DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY: Record<string, number> = {
  // Indoor-started plants need hardening
  "tomat": 7,
  "gurka": 7,
  "melon": 7,
  "aubergin": 7,
  "paprika": 7,
  "chili": 7,
  "physalis": 7,
  "pumpa": 7,
  // Outdoor plants typically don't need hardening
  "ärter": 0,
  "bönor": 0,
  "sparris": 0,
};

/**
 * Default frost tolerance by subcategory.
 * Used when frostTolerant is missing from raw data.
 */
export const DEFAULT_FROST_TOLERANT_BY_SUBCATEGORY: Record<string, boolean> = {
  // Frost-tolerant plants
  "ärter": true,
  "bönor": true,
  "sparris": true,
  // Frost-sensitive plants
  "tomat": false,
  "gurka": false,
  "melon": false,
  "aubergin": false,
  "paprika": false,
  "chili": false,
  "physalis": false,
  "pumpa": false,
};


/**
 * Default germination time by subcategory.
 * Used when germinationTime is missing from raw data.
 */
export const DEFAULT_GERMINATION_TIME_BY_SUBCATEGORY: Record<string, string> = {
  // Warm-season crops (indoor-started)
  "tomat": "5-15 dagar",
  "gurka": "5-15 dagar",
  "melon": "5-15 dagar",
  "aubergin": "10-30 dagar",
  "paprika": "20-30 dagar",
  "chili": "20-30 dagar",
  "physalis": "10-30 dagar",
  "pumpa": "5-15 dagar",
  // Cool-season crops (outdoor)
  "ärter": "5-15 dagar",
  "bönor": "5-15 dagar",
  "sparris": "20-30 dagar",
};

/**
 * Default germination temperature by subcategory.
 * Used when germinationTemperature is missing from raw data.
 */
export const DEFAULT_GERMINATION_TEMPERATURE_BY_SUBCATEGORY: Record<string, string> = {
  // Warm-season crops
  "tomat": "22-25 grader",
  "gurka": "ca 25 grader",
  "melon": "ca 25 grader",
  "aubergin": "ca 25 grader",
  "paprika": "ca 25 grader",
  "chili": "ca 25 grader",
  "physalis": "ca 25 grader",
  "pumpa": "ca 25 grader",
  // Cool-season crops (outdoor sowing temperature)
  "ärter": "5-10 grader",
  "bönor": "10-15 grader",
  "sparris": "8 grader",
};

/**
 * Default growing temperature by subcategory.
 * Used when growingTemperature is missing from raw data.
 */
export const DEFAULT_GROWING_TEMPERATURE_BY_SUBCATEGORY: Record<string, string> = {
  // Warm-season crops
  "tomat": "18-20 grader",
  "gurka": "16-20 grader",
  "melon": "20-25 grader",
  "aubergin": "20-25 grader",
  "paprika": "18-22 grader",
  "chili": "18-22 grader",
  "physalis": "18-22 grader",
  "pumpa": "18-22 grader",
  // Cool-season crops
  "ärter": "18-20 grader",
  "bönor": "15-20 grader",
  "sparris": "15-20 grader",
};

/**
 * Default days indoor growth by subcategory.
 * Used when daysIndoorGrowth is missing from raw data.
 * Source: odla.nu
 * Values converted from weeks to days (1 week = 7 days):
 * - 6-8 weeks = 49 days (average of 42-56)
 * - 4-5 weeks = 32 days (average of 28-35)
 * - 3-4 weeks = 25 days (average of 21-28)
 * 
 * TODO: Verify values for aubergine and physalis
 */
export const DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY: Record<string, number> = {
  // 6-8 weeks (49 days average)
  "aubergin": 49, // TODO: Verify value, not on odla.nu
  "chili": 49,
  "paprika": 49,
  "physalis": 49, // TODO: Verify value, not on odla.nu
  "tomat": 49,
  // 4-5 weeks (32 days average)
  "gurka": 32,
  "melon": 32,
  // 3-4 weeks (25 days average)
  "pumpa": 25,
};


/**
 * Get movePlantOutdoor configuration for frost-tolerant plants.
 */
const getFrostTolerantMovePlantOutdoor = (): MovePlantOutdoor => ({
  description: "när frosten släpper",
  start: "april",
  end: "maj",
});

/**
 * Get movePlantOutdoor configuration for frost-sensitive plants.
 */
const getFrostSensitiveMovePlantOutdoor = (): MovePlantOutdoor => ({
  description: "efter avhärdning när frostrisken är över",
  start: "maj",
  end: "juni",
});

/**
 * Get default movePlantOutdoor configuration based on subcategory and frost tolerance.
 * 
 * Returns a MovePlantOutdoor object with description and month range for when to move
 * plants outdoors. Uses explicit frost tolerance if available, otherwise falls back
 * to subcategory defaults.
 * 
 * **Frost-tolerant plants:** April-May ("när frosten släpper")
 * **Frost-sensitive plants:** May-June ("efter avhärdning när frostrisken är över")
 * 
 * @param subcategory - Plant subcategory (e.g., "tomat", "gurka", "ärter")
 * @param frostTolerant - Explicit frost tolerance value, or null to use subcategory default
 * @returns MovePlantOutdoor configuration, or null if no default can be determined
 * 
 * @example
 * // Frost-sensitive plant
 * getDefaultMovePlantOutdoor("tomat", false)
 * // Returns: { description: "efter avhärdning när frostrisken är över", start: "maj", end: "juni" }
 * 
 * // Frost-tolerant plant
 * getDefaultMovePlantOutdoor("ärter", true)
 * // Returns: { description: "när frosten släpper", start: "april", end: "maj" }
 * 
 * // Uses subcategory default when frostTolerant is null
 * getDefaultMovePlantOutdoor("tomat", null)
 * // Returns: { description: "efter avhärdning när frostrisken är över", start: "maj", end: "juni" }
 */
export const getDefaultMovePlantOutdoor = (
  subcategory: string,
  frostTolerant: boolean | null
): MovePlantOutdoor | null => {
  // Use explicit frost tolerance if available
  if (frostTolerant === true) {
    return getFrostTolerantMovePlantOutdoor();
  }
  
  if (frostTolerant === false) {
    return getFrostSensitiveMovePlantOutdoor();
  }

  // If frost tolerance is unknown, check subcategory defaults
  const frostTolerantDefault = DEFAULT_FROST_TOLERANT_BY_SUBCATEGORY[subcategory];
  if (frostTolerantDefault === true) {
    return getFrostTolerantMovePlantOutdoor();
  }
  
  if (frostTolerantDefault === false) {
    return getFrostSensitiveMovePlantOutdoor();
  }

  // If no default can be determined, return null
  return null;
};

