/**
 * Helper functions for calculating sow date.
 * 
 * Data sources:
 * - plantingWindows: From plants.json (Plant.plantingWindows)
 * - harvestTime: From plants.json (Plant.harvestTime)
 * - harvestDate: User input (selected harvest date)
 * - Uses seedConstant formula to calculate relative sow date based on harvest date position in harvest window
 */

import { addDays, subtractDays, normalizeToStartOfDay, getMonthIndex } from "../date/date";
import type { HarvestTime, PlantingMethod, PlantingWindows, Plant } from "../../models/Plant";
import { selectPlantingWindow } from "../plant/plantingWindow";
import { getMonthSpan } from "../date/monthSpan";

/**
 * Get the first day of a month in a given year.
 * 
 * @param monthName - Swedish month name (e.g., "feb", "april", "juni")
 * @param year - Year as number (e.g., 2026)
 * @returns Date object for the first day of the month, or null if monthName is invalid
 * 
 * @example
 * const firstDay = getFirstDayOfMonth("mars", 2026);
 * // Returns: Date object for March 1, 2026
 */
const getFirstDayOfMonth = (monthName: string, year: number): Date | null => {
  const monthIndex = getMonthIndex(monthName);
  if (monthIndex === null) {
    return null;
  }

  return normalizeToStartOfDay(new Date(year, monthIndex, 1));
};

/**
 * Calculate the optimal sow date based on desired harvest date.
 * 
 * Uses proportional distribution of the planting window based on where
 * the harvest date falls within the harvest window. Prioritizes indoor
 * sowing if available, otherwise uses outdoor sowing.
 * 
 * **Calculation formulas:**
 * 1. `plantingWindowsSpan` = days from first to last month in planting window
 * 2. `harvestTimeSpan` = days from first to last month in harvest window
 * 3. `seedConstant` = harvestTimeSpan / plantingWindowsSpan (proportional factor)
 * 4. `harvestDaySpan` = days from start of harvest window to selected harvest date
 * 5. `sowDateOffset` = harvestDaySpan / seedConstant
 * 6. `sowDate` = first day in planting window + sowDateOffset
 * 
 * **Edge cases:**
 * - If harvest date is before harvest window: returns first day of planting window
 * - If harvest date is after harvest window: returns last day of planting window
 * - If plantingWindowsSpan is 0: returns null (to avoid division by zero)
 * 
 * @param harvestDate - The date the user wants to harvest
 * @param plantingWindows - Object with planting windows for indoor and outdoor sowing
 * @param harvestTime - Harvest window from Impecta catalog, or null if data is missing
 * @param plantingMethod - Optional planting method ("indoor" or "outdoor") to determine which window to use
 * 
 * @returns The calculated sow date, or null if:
 *   - harvestTime is missing or null
 *   - No valid planting windows exist (both indoors and outdoors empty)
 *   - harvestTime.start or harvestTime.end are empty strings
 *   - plantingWindowsSpan is 0
 *   - Invalid month in any of the strings
 * 
 * @example
 * // Calculate sow date for tomatoes
 * const harvestDate = new Date(2026, 6, 15); // July 15, 2026
 * const plantingWindows = {
 *   indoors: { start: "mars", end: "april" },
 *   outdoors: { start: "", end: "" }
 * };
 * const harvestTime = { start: "juli", end: "sept" };
 * 
 * const sowDate = calculateSowDate(harvestDate, plantingWindows, harvestTime);
 * // Returns a date in March-April based on proportional distribution
 */
export const calculateSowDate = (
  harvestDate: Date,
  plantingWindows: PlantingWindows,
  harvestTime: HarvestTime | null,
  plantingMethod?: PlantingMethod
): Date | null => {
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

  // Calculate plantingWindowsSpan (from first day in plantingWindow.start to last day in plantingWindow.end)
  const plantingWindowsSpan = getMonthSpan(plantingWindow.start, plantingWindow.end);
  if (plantingWindowsSpan === null) {
    return null;
  }

  // Calculate harvestTimeSpan (from first day in harvestTime.start to last day in harvestTime.end)
  const harvestTimeSpan = getMonthSpan(harvestTime.start, harvestTime.end);
  if (harvestTimeSpan === null) {
    return null;
  }

  // Calculate seedConstant
  if (plantingWindowsSpan === 0) {
    return null; // Avoid division by zero
  }
  const seedConstant = harvestTimeSpan / plantingWindowsSpan;

  // Get the year from harvestDate (we'll use this year for all date calculations)
  const year = harvestDate.getFullYear();

  // Get first day of harvestTime.start
  const firstDayOfHarvestTime = getFirstDayOfMonth(harvestTime.start, year);
  if (!firstDayOfHarvestTime) {
    return null;
  }

  // Calculate harvestDaySpan: days from first day in harvestTime to harvestDate
  const harvestDaySpan = Math.floor(
    (harvestDate.getTime() - firstDayOfHarvestTime.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Handle dates outside harvest window:
  // - If before harvestTime.start: use 0 (will give first day of planting window)
  // - If after harvestTime.end: use harvestTimeSpan (will give last day of planting window)
  // We calculate sowDate, but getPlantSowResult will show a result message
  const clampedHarvestDaySpan = Math.max(0, Math.min(harvestDaySpan, harvestTimeSpan));

  // Calculate sowDateOffset using clamped value
  const sowDateOffset = clampedHarvestDaySpan / seedConstant;

  // Get first day of plantingWindow.start
  const firstDayOfPlanting = getFirstDayOfMonth(plantingWindow.start, year);
  if (!firstDayOfPlanting) {
    return null;
  }

  // Calculate sowDate: first day in plantingWindows + sowDateOffset
  const sowDate = addDays(firstDayOfPlanting, Math.round(sowDateOffset));

  return sowDate;
};

/**
 * Calculate the "try anyway" sow date backwards from harvest date.
 * 
 * This calculates the theoretical sow date based on the minimum growth time
 * from the first day of the planting window to the first day of the harvest window.
 * This is a gentler estimate (longer time) that allows users with controlled
 * environments to try anyway, even when the harvest date is outside the optimal window.
 * 
 * **Calculation formula:**
 * 1. `maturityDaysTryAnyway` = days from planting window start to harvest window start
 * 2. `sowDate` = harvestDate - maturityDaysTryAnyway
 * 
 * This is the same logic used in dateValidation.ts for "try anyway" scenarios
 * and is used by the calendar view to ensure consistent date calculations.
 * 
 * @param harvestDate - The date the user wants to harvest
 * @param plant - The plant object with plantingWindows, harvestTime, and plantingMethod
 * 
 * @returns The calculated sow date, or null if:
 *   - harvestTime is missing or null
 *   - No valid planting windows exist
 *   - harvestTime.start is empty or invalid
 *   - plantingWindow.start is empty or invalid
 * 
 * @example
 * // Calculate try-anyway sow date for tomatoes
 * const harvestDate = new Date(2026, 5, 8); // June 8, 2026
 * const plant = { plantingWindows: {...}, harvestTime: {...}, plantingMethod: "indoor" };
 * const sowDate = calculateTryAnywaySowDate(harvestDate, plant);
 * // Returns: Date object calculated backwards from harvest date
 */
export const calculateTryAnywaySowDate = (
  harvestDate: Date,
  plant: Plant
): Date | null => {
  if (!plant.harvestTime || !plant.harvestTime.start) {
    return null;
  }

  const plantingWindow = selectPlantingWindow(plant.plantingWindows, plant.plantingMethod);
  if (!plantingWindow || !plantingWindow.start) {
    return null;
  }

  const year = harvestDate.getFullYear();

  // Get harvest window start date (first day of harvestTime.start month)
  const harvestStartDate = getFirstDayOfMonth(plant.harvestTime.start, year);
  if (!harvestStartDate) {
    return null;
  }

  // Get planting window start date (first day of plantingWindow.start month)
  const plantingStartDate = getFirstDayOfMonth(plantingWindow.start, year);
  if (!plantingStartDate) {
    return null;
  }

  // Calculate maturityDaysTryAnyway: days from planting window start to harvest window start
  const diffDays = (later: Date, earlier: Date): number => {
    return Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
  };

  const maturityDaysTryAnyway = Math.max(0, diffDays(harvestStartDate, plantingStartDate));

  // Calculate sow date backwards: harvestDate - maturityDaysTryAnyway
  const sowDate = subtractDays(harvestDate, maturityDaysTryAnyway);
  return normalizeToStartOfDay(sowDate);
};
