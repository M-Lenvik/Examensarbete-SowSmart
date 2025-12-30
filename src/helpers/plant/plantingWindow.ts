/**
 * Helper functions for selecting and validating planting windows.
 * 
 * Data sources:
 * - plantingWindows: From plants.json, accessed via Plant.plantingWindows (type: PlantingWindows)
 * - plantingMethod: From plants.json or inferred, accessed via Plant.plantingMethod (type: PlantingMethod)
 */

import type { PlantingMethod, PlantingWindows } from "../../models/Plant";

/**
 * Check if a planting window value is valid (non-null, non-empty string).
 */
const isValidWindowValue = (value: string | null | undefined): value is string => {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === "string" &&
    value.trim() !== ""
  );
};

/**
 * Select the appropriate planting window based on plantingMethod.
 * 
 * For outdoor plants, uses outdoors window directly.
 * For indoor/unknown, prefers indoors if available, otherwise uses outdoors.
 * 
 * @param plantingWindows - Planting windows (indoors/outdoors)
 * @param plantingMethod - Optional planting method to determine which window to use
 * @returns Object with start and end month names, or null if no valid window found
 * 
 * @example
 * const window = selectPlantingWindow(plantingWindows, "outdoor");
 * // Returns: { start: "maj", end: "juni" } or null
 */
export const selectPlantingWindow = (
  plantingWindows: PlantingWindows,
  plantingMethod?: PlantingMethod
): { start: string; end: string } | null => {
  // For outdoor plants, use outdoors window directly
  if (plantingMethod === "outdoor") {
    if (
      isValidWindowValue(plantingWindows.outdoors.start) &&
      isValidWindowValue(plantingWindows.outdoors.end)
    ) {
      return {
        start: plantingWindows.outdoors.start,
        end: plantingWindows.outdoors.end,
      };
    }
    return null;
  }

  // For "indoor" or undefined: prefer indoors if available, otherwise use outdoors
  if (
    isValidWindowValue(plantingWindows.indoors.start) &&
    isValidWindowValue(plantingWindows.indoors.end)
  ) {
    return {
      start: plantingWindows.indoors.start,
      end: plantingWindows.indoors.end,
    };
  }

  if (
    isValidWindowValue(plantingWindows.outdoors.start) &&
    isValidWindowValue(plantingWindows.outdoors.end)
  ) {
    return {
      start: plantingWindows.outdoors.start,
      end: plantingWindows.outdoors.end,
    };
  }

  return null;
};

