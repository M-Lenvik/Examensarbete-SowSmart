import { parseDateIso, subtractDays } from "../date/date";
import { getHarvestWindowDates, getPlantingWindowDates, getMovePlantOutdoorWindowDates } from "../date/dateValidation";
import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";

export type PlantWarning = {
  plantId: number;
  plantName: string;
  warningType: "outside-planting-window" | "too-early" | "too-late";
  message: string; // T.ex. "Sådatum ligger utanför optimalt fönster"
  date: string; // ISO-format för datumet som har varningen
  dateType: "outdoorSowDate" | "indoorSowDate" | "hardenStartDate" | "movePlantOutdoorDate" | "harvest";
};

/**
 * Check if a date is within a date range (inclusive).
 */
const isDateWithinRange = (date: Date, start: Date, end: Date): boolean => {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
};

/**
 * Check if a date is outside the planting window for a plant.
 * 
 * @param date - The date to check (Date object)
 * @param plant - The plant to check against
 * @param year - The year to use for window calculations
 * @returns Object with isOutside (boolean) and isTooEarly (boolean) if outside, null if within window or can't determine
 */
const isDateOutsidePlantingWindow = (
  date: Date,
  plant: Plant,
  year: number
): { isOutside: true; isTooEarly: boolean } | null => {
  const plantingWindowDates = getPlantingWindowDates(plant, year); //From dateValidation.ts
  if (!plantingWindowDates) {
    return null; // Can't determine, so no warning
  }

  const isWithinWindow = isDateWithinRange(date, plantingWindowDates.start, plantingWindowDates.end);
  if (isWithinWindow) {
    return null; // Within window, no warning
  }

  const isTooEarly = date.getTime() < plantingWindowDates.start.getTime();
  return { isOutside: true, isTooEarly };
};

/**
 * Check if a date is outside the harvest window for a plant.
 * 
 * @param date - The date to check (Date object)
 * @param plant - The plant to check against
 * @param year - The year to use for window calculations
 * @returns Object with isOutside (boolean) and isTooEarly (boolean) if outside, null if within window or can't determine
 */
const isDateOutsideHarvestWindow = (
  date: Date,
  plant: Plant,
  year: number
): { isOutside: true; isTooEarly: boolean } | null => {
  const harvestWindowDates = getHarvestWindowDates(plant.harvestTime ?? null, year); //From dateValidation.ts
  if (!harvestWindowDates) {
    return null; // Can't determine, so no warning
  }

  const isWithinWindow = isDateWithinRange(date, harvestWindowDates.start, harvestWindowDates.end);
  if (isWithinWindow) {
    return null; // Within window, no warning
  }

  const isTooEarly = date.getTime() < harvestWindowDates.start.getTime();
  return { isOutside: true, isTooEarly };
};

/**
 * Get warnings for a plant based on recommendation dates.
 * 
 * Checks if dates in the recommendation lie outside the plant's optimal windows:
 * - outdoorSowDate, indoorSowDate, hardenStartDate, movePlantOutdoorDate: checked against planting windows
 * - harvest date: checked against harvest window
 * 
 * @param recommendation - The recommendation to check
 * @param plant - The plant to validate against
 * @returns Array of warnings (can be empty)
 */
export const getPlantWarnings = (
  recommendation: Recommendation,
  plant: Plant
): PlantWarning[] => {
  const warnings: PlantWarning[] = [];
  const currentYear = recommendation.harvestDateIso ? parseDateIso(recommendation.harvestDateIso).getFullYear() : new Date().getFullYear();

  // Check outdoor sow date
  if (recommendation.outdoorSowDate) {
    try {
      const sowDate = parseDateIso(recommendation.outdoorSowDate);
      const result = isDateOutsidePlantingWindow(sowDate, plant, currentYear);
      if (result) {
        warnings.push({
          plantId: recommendation.plantId,
          plantName: plant.name,
          warningType: result.isTooEarly ? "too-early" : "too-late",
          message: `${plant.name} bör sås utomhus tidigast ${recommendation.outdoorSowDate}`,
          date: recommendation.outdoorSowDate,
          dateType: "outdoorSowDate",
        });
      }
    } catch {
      // Invalid date, skip
    }
  }

  // Check indoor sow date
  if (recommendation.indoorSowDate) {
    try {
      const sowDate = parseDateIso(recommendation.indoorSowDate);
      const result = isDateOutsidePlantingWindow(sowDate, plant, currentYear);
      if (result) {
        warnings.push({
          plantId: recommendation.plantId,
          plantName: plant.name,
          warningType: result.isTooEarly ? "too-early" : "too-late",
          message: `${plant.name} bör försås inomhus tidigast ${recommendation.indoorSowDate}`,
          date: recommendation.indoorSowDate,
          dateType: "indoorSowDate",
        });
      }
    } catch {
      // Invalid date, skip
    }
  }

  // Check harden start date
  if (recommendation.hardenStartDate) {
    try {
      const hardenDate = parseDateIso(recommendation.hardenStartDate);
      
      // For indoor plants with movePlantOutdoor window, check against hardening window
      // Hardening window = movePlantOutdoor window - hardeningDays
      const moveOutdoorWindow = getMovePlantOutdoorWindowDates(plant, currentYear);
      
      if (moveOutdoorWindow && plant.plantingMethod === "indoor") {
        // Get hardeningDays
        const hardeningDays = plant.hardeningDays ?? 7;
        
        // Hardening window: from (moveOutdoorWindow.start - hardeningDays) to moveOutdoorWindow.end
        // This allows hardening to start before the move outdoor window
        const hardenWindowStart = subtractDays(moveOutdoorWindow.start, hardeningDays);
        hardenWindowStart.setHours(0, 0, 0, 0);
        const hardenWindowEnd = new Date(moveOutdoorWindow.end);
        hardenWindowEnd.setHours(0, 0, 0, 0);
        
        // Check if hardenStartDate is outside the hardening window
        const isWithinWindow = isDateWithinRange(
          hardenDate,
          hardenWindowStart,
          hardenWindowEnd
        );
        
        if (!isWithinWindow) {
          const isTooEarly = hardenDate.getTime() < hardenWindowStart.getTime();
          warnings.push({
            plantId: recommendation.plantId,
            plantName: plant.name,
            warningType: isTooEarly ? "too-early" : "too-late",
            message: `Avhärdningsstartdatum (${recommendation.hardenStartDate}) ligger utanför optimalt fönster för ${plant.name}`,
            date: recommendation.hardenStartDate,
            dateType: "hardenStartDate",
          });
        }
      } else {
        // Fallback to planting window check for other cases
        const result = isDateOutsidePlantingWindow(hardenDate, plant, currentYear);
        if (result) {
          warnings.push({
            plantId: recommendation.plantId,
            plantName: plant.name,
            warningType: result.isTooEarly ? "too-early" : "too-late",
            message: `Avhärdningsstartdatum (${recommendation.hardenStartDate}) ligger utanför optimalt fönster för ${plant.name}`,
            date: recommendation.hardenStartDate,
            dateType: "hardenStartDate",
          });
        }
      }
    } catch {
      // Invalid date, skip
    }
  }

  // Check move plant outdoor date
  if (recommendation.movePlantOutdoorDate) {
    try {
      const moveDate = parseDateIso(recommendation.movePlantOutdoorDate);
      
      // For indoor plants, check against move outdoor window
      const moveOutdoorWindow = getMovePlantOutdoorWindowDates(plant, currentYear);
      
      if (moveOutdoorWindow && plant.plantingMethod === "indoor") {
        const isWithinWindow = isDateWithinRange(
          moveDate,
          moveOutdoorWindow.start,
          moveOutdoorWindow.end
        );
        
        if (!isWithinWindow) {
          const isTooEarly = moveDate.getTime() < moveOutdoorWindow.start.getTime();
          warnings.push({
            plantId: recommendation.plantId,
            plantName: plant.name,
            warningType: isTooEarly ? "too-early" : "too-late",
            message: `Utplanteringsdatum (${recommendation.movePlantOutdoorDate}) ligger utanför optimalt fönster för ${plant.name}`,
            date: recommendation.movePlantOutdoorDate,
            dateType: "movePlantOutdoorDate",
          });
        }
      } else {
        // Fallback to planting window check
        const result = isDateOutsidePlantingWindow(moveDate, plant, currentYear);
        if (result) {
          warnings.push({
            plantId: recommendation.plantId,
            plantName: plant.name,
            warningType: result.isTooEarly ? "too-early" : "too-late",
            message: `Utplanteringsdatum (${recommendation.movePlantOutdoorDate}) ligger utanför optimalt fönster för ${plant.name}`,
            date: recommendation.movePlantOutdoorDate,
            dateType: "movePlantOutdoorDate",
          });
        }
      }
    } catch {
      // Invalid date, skip
    }
  }

  // Check harvest date
  if (recommendation.harvestDateIso) {
    try {
      const harvestDate = parseDateIso(recommendation.harvestDateIso);
      const result = isDateOutsideHarvestWindow(harvestDate, plant, harvestDate.getFullYear());
      if (result) {
        warnings.push({
          plantId: recommendation.plantId,
          plantName: plant.name,
          warningType: result.isTooEarly ? "too-early" : "too-late",
          message: `Skördedatum (${recommendation.harvestDateIso}) ligger utanför optimalt skördefönster för ${plant.name}`,
          date: recommendation.harvestDateIso,
          dateType: "harvest",
        });
      }
    } catch {
      // Invalid date, skip
    }
  }

  return warnings;
};

