import type { Plant } from "../models/Plant";
import { formatDateIso, parseDateIso, subtractDays, addDays } from "./date";
import { calculateSowDate } from "./sowDate";
import { getDaysInMonth } from "./monthToDays";
import { calculateTotalDaysFromSeed } from "./totalDaysFromSeed";

/**
 * Validates a harvest date input string.
 * Also checks if the date allows enough time for totalDaysFromSeed.
 * 
 * Performs three validation checks:
 * 1. Date is required (not null or empty)
 * 2. Date cannot be in the past
 * 3. Date must allow enough time for totalDaysFromSeed
 * 
 * @param dateString - Date string in YYYY-MM-DD format (from native date input) or null/empty
 * @param totalDaysFromSeed - Total days from seed to harvest (optional, for validation)
 * 
 * @returns Object with:
 *   - `isValid`: boolean indicating if date passes validation
 *   - `error`: Swedish error message if invalid, otherwise null
 *   - `warning`: Swedish warning message if date is too early (but still valid), otherwise null
 * 
 * @example
 * const result = validateHarvestDate("2026-08-15", 120);
 * if (!result.isValid) {
 *   console.error(result.error); // "Skördedatumet kan inte vara i det förflutna"
 * }
 * if (result.warning) {
 *   console.warn(result.warning); // "För att skörda 2026-08-15 skulle du behövt så på 2026-04-17"
 * }
 */
export const validateHarvestDate = (
  dateString: string | null,
  totalDaysFromSeed: number | null = null
): { isValid: boolean; error: string | null; warning: string | null } => {
  // Rule 1: Date is required
  if (!dateString || dateString.trim() === "") {
    return {
      isValid: false,
      error: "Välj ett skördedatum",
      warning: null,
    };
  }

  // Parse the date string (YYYY-MM-DD format from native input)
  let harvestDate: Date;
  try {
    harvestDate = parseDateIso(dateString);
  } catch {
    return {
      isValid: false,
      error: "Ogiltigt datumformat",
      warning: null,
    };
  }

  // Rule 2: Date cannot be in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  if (harvestDate < today) {
    return {
      isValid: false,
      error: "Skördedatumet kan inte vara i det förflutna",
      warning: null,
    };
  }

  // Rule 3: Check if date allows enough time for totalDaysFromSeed
  let warning: string | null = null;
  if (totalDaysFromSeed !== null && totalDaysFromSeed > 0) {
    const minSowDate = subtractDays(harvestDate, totalDaysFromSeed);
    minSowDate.setHours(0, 0, 0, 0);
    
    if (minSowDate < today) {
      const minSowDateIso = formatDateIso(minSowDate);
      warning = `För att skörda ${dateString} skulle du behövt så på ${minSowDateIso}`;
    }
  }

  // Date is valid (warning is optional and doesn't make it invalid)
  return {
    isValid: true,
    error: null,
    warning,
  };
};

/**
 * Get the first day of a month in a given year.
 * Helper function for checking if harvest date is within harvest window.
 */
const getFirstDayOfMonth = (monthName: string, year: number): Date | null => {
  const monthOrderMap: Record<string, number> = {
    "jan": 0,
    "feb": 1,
    "mars": 2,
    "april": 3,
    "maj": 4,
    "juni": 5,
    "juli": 6,
    "aug": 7,
    "sept": 8,
    "okt": 9,
    "nov": 10,
    "dec": 11,
  };

  const normalized = monthName.toLowerCase().trim();
  const monthIndex = monthOrderMap[normalized];

  if (monthIndex === undefined) {
    return null;
  }

  return new Date(year, monthIndex, 1);
};

/**
 * Get warning message for a single plant showing the calculated sow date.
 * 
 * Handles multiple scenarios:
 * 1. If harvest date is in the past: show "Skördedatumet är i det förflutna"
 * 2. If harvest date is outside harvest window: show warning + recommended sow date
 * 3. If harvest date is too close (not enough time): show warning + nearest recommended sow date
 * 4. Normal case: show "Sås på {sowDate}"
 * 
 * The function validates that the harvest date falls within the plant's harvest window
 * and that there is enough time from today to complete the full growing cycle.
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @param plant - Plant object to validate against
 * 
 * @returns Swedish warning message string, or null if:
 *   - dateString is null/empty
 *   - plant.harvestTime is null (no harvest window data)
 *   - Sow date cannot be calculated
 * 
 * @example
 * const warning = getPlantWarning("2026-12-15", tomatoPlant);
 * // Returns: "Valt datum är efter skördefönstret. Rekommenderat sådatum: 2026-08-20"
 * 
 * @example
 * const warning = getPlantWarning("2026-07-15", tomatoPlant);
 * // Returns: "Sås på 2026-03-22" (normal case)
 */
export const getPlantWarning = (
  dateString: string | null,
  plant: Plant
): string | null => {
  if (!dateString || !plant.harvestTime) {
    return null;
  }

  let harvestDate: Date;
  try {
    harvestDate = parseDateIso(dateString);
  } catch {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Case 1: If harvest date is in the past
  if (harvestDate < today) {
    return "Skördedatumet är i det förflutna";
  }

  // Check if harvest date is outside harvest window
  const year = harvestDate.getFullYear();
  const firstDayOfHarvestTime = getFirstDayOfMonth(plant.harvestTime.start, year);
  const lastDayOfHarvestTime = getFirstDayOfMonth(plant.harvestTime.end, year);
  
  if (!firstDayOfHarvestTime || !lastDayOfHarvestTime) {
    return null;
  }

  // Get last day of harvest month
  const daysInLastMonth = getDaysInMonth(plant.harvestTime.end);
  if (daysInLastMonth === null) {
    return null;
  }
  lastDayOfHarvestTime.setDate(daysInLastMonth);
  lastDayOfHarvestTime.setHours(23, 59, 59, 999);

  const isBeforeHarvestWindow = harvestDate < firstDayOfHarvestTime;
  const isAfterHarvestWindow = harvestDate > lastDayOfHarvestTime;

  // Determine which planting window to use
  let plantingStart: string | null = null;
  let plantingEnd: string | null = null;

  if (
    plant.plantingWindows.indoors.start &&
    plant.plantingWindows.indoors.end &&
    plant.plantingWindows.indoors.start.trim() !== "" &&
    plant.plantingWindows.indoors.end.trim() !== ""
  ) {
    plantingStart = plant.plantingWindows.indoors.start;
    plantingEnd = plant.plantingWindows.indoors.end;
  } else if (
    plant.plantingWindows.outdoors.start &&
    plant.plantingWindows.outdoors.end &&
    plant.plantingWindows.outdoors.start.trim() !== "" &&
    plant.plantingWindows.outdoors.end.trim() !== ""
  ) {
    plantingStart = plant.plantingWindows.outdoors.start;
    plantingEnd = plant.plantingWindows.outdoors.end;
  }

  if (!plantingStart || !plantingEnd) {
    return null;
  }

  // Get first and last day of planting window
  const firstDayOfPlanting = getFirstDayOfMonth(plantingStart, year);
  const lastDayOfPlanting = getFirstDayOfMonth(plantingEnd, year);
  
  if (!firstDayOfPlanting || !lastDayOfPlanting) {
    return null;
  }

  const daysInLastPlantingMonth = getDaysInMonth(plantingEnd);
  if (daysInLastPlantingMonth === null) {
    return null;
  }
  lastDayOfPlanting.setDate(daysInLastPlantingMonth);
  lastDayOfPlanting.setHours(23, 59, 59, 999);

  // Calculate sow date using the seedConstant formula (we need this for all cases)
  const sowDate = calculateSowDate(harvestDate, plant.plantingWindows, plant.harvestTime);
  
  if (!sowDate) {
    return null;
  }

  sowDate.setHours(0, 0, 0, 0);
  const sowDateIso = formatDateIso(sowDate);

  // Case 2: If harvest date is outside harvest window
  if (isBeforeHarvestWindow || isAfterHarvestWindow) {
    let recommendedSowDate: Date;
    
    if (isBeforeHarvestWindow) {
      // Calculate days before harvest window
      const daysBefore = Math.floor(
        (firstDayOfHarvestTime.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Recommended sow date: first day of planting window - days before
      recommendedSowDate = subtractDays(firstDayOfPlanting, daysBefore);
    } else {
      // Calculate days after harvest window
      const daysAfter = Math.floor(
        (harvestDate.getTime() - lastDayOfHarvestTime.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Recommended sow date: last day of planting window + days after
      recommendedSowDate = addDays(lastDayOfPlanting, daysAfter);
    }

    recommendedSowDate.setHours(0, 0, 0, 0);
    const recommendedSowDateIso = formatDateIso(recommendedSowDate);

    if (isBeforeHarvestWindow) {
      return `Valt datum är före skördefönstret. Rekommenderat sådatum: ${recommendedSowDateIso}`;
    } else {
      return `Valt datum är efter skördefönstret. Rekommenderat sådatum: ${recommendedSowDateIso}`;
    }
  }

  // Case 3: Check if sow date is in the past (harvest date is too close)
  // Only check this if harvest date is WITHIN harvest window
  if (sowDate < today) {
    // Calculate the minimum harvest date needed (today + totalDaysFromSeed)
    const totalDaysFromSeed = calculateTotalDaysFromSeed(plant.plantingWindows, plant.harvestTime);
    
    if (totalDaysFromSeed !== null && totalDaysFromSeed > 0) {
      const minHarvestDate = addDays(today, totalDaysFromSeed);
      minHarvestDate.setHours(0, 0, 0, 0);

      // Calculate the recommended sow date based on the minimum harvest date
      const recommendedSowDate = calculateSowDate(minHarvestDate, plant.plantingWindows, plant.harvestTime);
      
      if (recommendedSowDate) {
        recommendedSowDate.setHours(0, 0, 0, 0);
        const nearestSowDateIso = formatDateIso(recommendedSowDate);
        return `Datumet ligger för nära i tid för att hinna mogna. Närmsta rekommenderade sådatum: ${nearestSowDateIso}`;
      }
    }

    // Fallback: show that sow date was in the past
    return `Behövde sås på ${sowDateIso}`;
  }

  // Normal case: show sow date
  return `Sås på ${sowDateIso}`;
};


