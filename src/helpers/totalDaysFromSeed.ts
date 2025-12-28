/**
 * Helper functions for calculating totalDaysFromSeed.
 */

import type { HarvestTime, PlantingWindows } from "../models/Plant";
import { getMonthSpan } from "./monthSpan";

/**
 * Calculate totalDaysFromSeed from plantingWindows and harvestTime.
 * 
 * This calculates the span from the first day of the first month in plantingWindows
 * to the last day of the last month in harvestTime.
 * 
 * @param plantingWindows - Planting windows (indoors/outdoors)
 * @param harvestTime - Harvest time window, or null if missing
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
  harvestTime: HarvestTime | null
): number | null => {
  // Check if harvestTime is missing
  if (!harvestTime) {
    return null;
  }

  // Determine which planting window to use (indoors or outdoors)
  // Prefer indoors if it has valid data, otherwise use outdoors
  let plantingStart: string | null = null;
  let plantingEnd: string | null = null;

  // Check indoors first
  if (
    plantingWindows.indoors.start &&
    plantingWindows.indoors.end &&
    plantingWindows.indoors.start.trim() !== "" &&
    plantingWindows.indoors.end.trim() !== ""
  ) {
    plantingStart = plantingWindows.indoors.start;
    plantingEnd = plantingWindows.indoors.end;
  } else if (
    plantingWindows.outdoors.start &&
    plantingWindows.outdoors.end &&
    plantingWindows.outdoors.start.trim() !== "" &&
    plantingWindows.outdoors.end.trim() !== ""
  ) {
    plantingStart = plantingWindows.outdoors.start;
    plantingEnd = plantingWindows.outdoors.end;
  }

  // If no valid planting window found, return null
  if (!plantingStart || !plantingEnd) {
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

  // Calculate span from first day in plantingStart to last day in harvestTime.end
  // This is the total days from seed (first possible planting day) to harvest (last possible harvest day)
  const span = getMonthSpan(plantingStart, harvestTime.end);

  return span;
};

