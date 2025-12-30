/**
 * Helper functions for calculating totalDaysFromSeed.
 * 
 * Data sources:
 * - plantingWindows: From plants.json (Plant.plantingWindows)
 * - harvestTime: From plants.json (Plant.harvestTime)
 * - Calculates span from first day of first month in plantingWindows to last day of last month in harvestTime
 */

import type { HarvestTime, PlantingWindows } from "../../models/Plant";
import { selectPlantingWindow } from "../plant/plantingWindow";
import { getMonthSpan } from "../date/monthSpan";

/**
 * Calculate totalDaysFromSeed from plantingWindows and harvestTime.
 * 
 * This calculates the span from the first day of the first month in plantingWindows
 * to the last day of the last month in harvestTime.
 * 
 * For outdoor plants, uses outdoors planting window directly.
 * For indoor plants, prefers indoors if available, otherwise uses outdoors.
 * 
 * @param plantingWindows - Planting windows (indoors/outdoors)
 * @param harvestTime - Harvest time window, or null if missing
 * @param plantingMethod - Optional planting method to determine which window to use
 * @returns Number of days from first day in plantingWindows to last day in harvestTime, or null if data is missing
 * 
 * @example
 * // Example: plantingWindows.indoors = { start: "feb", end: "april" }
 * // harvestTime = { start: "juli", end: "okt" }
 * // Returns: span from 1 feb to 31 okt = 273 days
 * calculateTotalDaysFromSeed(plantingWindows, harvestTime)
 */
export const calculateTotalDaysFromSeed = (
  plantingWindows: PlantingWindows,
  harvestTime: HarvestTime | null,
  plantingMethod?: "indoor" | "outdoor"
): number | null => {
  // Check if harvestTime is missing
  if (!harvestTime) {
    return null;
  }

  // Select the appropriate planting window based on plantingMethod
  const plantingWindow = selectPlantingWindow(plantingWindows, plantingMethod);
  if (!plantingWindow) {
    return null;
  }

  // Check if harvestTime has valid data
  if (
    !harvestTime.start ||
    !harvestTime.end ||
    harvestTime.start.trim() === "" ||
    harvestTime.end.trim() === ""
  ) {
    return null;
  }

  // Calculate span from first day in plantingWindow.start to last day in harvestTime.end
  // This is the total days from seed (first possible planting day) to harvest (last possible harvest day)
  const span = getMonthSpan(plantingWindow.start, harvestTime.end);

  return span;
};

