import { formatDateIso, formatDateSwedish, parseDateIso } from "./date";
import { calculateSowDate, calculateTryAnywaySowDate } from "../calculation/sowDate";
import { selectPlantingWindow } from "../plant/plantingWindow";
import { getDefaultMovePlantOutdoor } from "../plant/plantDefaults";
import type { Plant, HarvestTime } from "../../models/Plant";

type ValidationResult = {
  isValid: boolean;
  error: string | null;
};

export type PlantSowResultKey =
  | "harvestDate"
  | "harvestDateInPast"
  | "harvestToClose"
  | "harvestDateBeforeHarvestWindow"
  | "harvestDateAfterHarvestWindow";

export type PlantSowResult = {
  key: PlantSowResultKey;
  message: string;
  sowDateIso: string | null;
};

const normalizeToStartOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getNowDate = (now: Date | null): Date => {
  return normalizeToStartOfDay(now ?? new Date());
};

const getMonthIndex = (monthName: string): number | null => {
  const normalized = monthName.toLowerCase().trim();
  const monthOrderMap: Record<string, number> = {
    jan: 0,
    feb: 1,
    mars: 2,
    april: 3,
    maj: 4,
    juni: 5,
    juli: 6,
    aug: 7,
    sept: 8,
    sep: 8, // Alias for "sept" (used in plants.json)
    okt: 9,
    nov: 10,
    dec: 11,
  };

  return monthOrderMap[normalized] ?? null;
};

const getFirstDayOfMonth = (monthName: string, year: number): Date | null => {
  const monthIndex = getMonthIndex(monthName);
  if (monthIndex === null) return null;

  const date = new Date(year, monthIndex, 1);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getLastDayOfMonth = (monthName: string, year: number): Date | null => {
  const monthIndex = getMonthIndex(monthName);
  if (monthIndex === null) return null;

  const date = new Date(year, monthIndex + 1, 0);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getHarvestWindowDates = (
  harvestTime: HarvestTime | null,
  year: number
): { start: Date; end: Date } | null => {
  if (!harvestTime) return null;
  if (!harvestTime.start || !harvestTime.end) return null;
  if (harvestTime.start.trim() === "" || harvestTime.end.trim() === "") return null;

  const startMonthIndex = getMonthIndex(harvestTime.start);
  const endMonthIndex = getMonthIndex(harvestTime.end);
  if (startMonthIndex === null || endMonthIndex === null) return null;

  // If end is before start (wrap-around), treat as invalid (consistent with monthSpan logic).
  if (endMonthIndex < startMonthIndex) return null;

  const start = new Date(year, startMonthIndex, 1);
  const end = new Date(year, endMonthIndex + 1, 0); // last day of end month
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return { start, end };
};

export const getPlantingWindowDates = (
  plant: Plant,
  year: number
): { start: Date; end: Date } | null => {
  const plantingWindow = selectPlantingWindow(plant.plantingWindows, plant.plantingMethod);
  if (!plantingWindow) return null;
  if (!plantingWindow.start || !plantingWindow.end) return null;
  if (plantingWindow.start.trim() === "" || plantingWindow.end.trim() === "") return null;

  const start = getFirstDayOfMonth(plantingWindow.start, year);
  const end = getLastDayOfMonth(plantingWindow.end, year);
  if (!start || !end) return null;
  if (end.getTime() < start.getTime()) return null;

  return { start, end };
};

/**
 * Get move plant outdoor window dates for a plant.
 * 
 * Uses plant.movePlantOutdoor if available, otherwise falls back to defaults
 * based on frost tolerance and subcategory.
 * 
 * For frost-sensitive plants: May-June
 * For frost-tolerant plants: April-May
 * 
 * @param plant - The plant to check
 * @param year - The year to use for calculations
 * @returns Object with start and end dates for move plant outdoor window, or null if can't determine
 */
export const getMovePlantOutdoorWindowDates = (
  plant: Plant,
  year: number
): { start: Date; end: Date } | null => {
  // Only check for indoor plants (they need to be moved outdoors)
  if (plant.plantingMethod !== "indoor") {
    return null;
  }

  // Get movePlantOutdoor from plant or defaults
  let movePlantOutdoor = plant.movePlantOutdoor;
  
  // If null or if start/end are null, try to get default based on subcategory and frost tolerance
  if (!movePlantOutdoor || !movePlantOutdoor.start || !movePlantOutdoor.end) {
    movePlantOutdoor = getDefaultMovePlantOutdoor(plant.subcategory, plant.frostTolerant);
  }
  
  if (!movePlantOutdoor || !movePlantOutdoor.start || !movePlantOutdoor.end) {
    return null;
  }

  const startMonthIndex = getMonthIndex(movePlantOutdoor.start);
  const endMonthIndex = getMonthIndex(movePlantOutdoor.end);
  if (startMonthIndex === null || endMonthIndex === null) return null;

  const start = new Date(year, startMonthIndex, 1);
  const end = new Date(year, endMonthIndex + 1, 0); // last day of end month
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return { start, end };
};

const diffDays = (later: Date, earlier: Date): number => {
  return Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate the nearest recommended sow date for a plant based on current date and planting window.
 * Used when the calculated sow date is in the past and we need to recommend the next available opportunity.
 */
const calculateNearestSowDateIso = (
  plant: Plant,
  today: Date
): string => {
  const currentYear = today.getFullYear();
  const currentYearPlantingWindow = getPlantingWindowDates(plant, currentYear);
  
  if (!currentYearPlantingWindow) {
    return formatDateIso(today);
  }

  if (today.getTime() < currentYearPlantingWindow.start.getTime()) {
    return formatDateIso(currentYearPlantingWindow.start);
  }

  if (today.getTime() >= currentYearPlantingWindow.start.getTime() && 
      today.getTime() <= currentYearPlantingWindow.end.getTime()) {
    return formatDateIso(today);
  }

  // Today is after planting window - too late for this year
  const nextYearPlantingWindow = getPlantingWindowDates(plant, currentYear + 1);
  if (nextYearPlantingWindow) {
    return formatDateIso(nextYearPlantingWindow.start);
  }

  return formatDateIso(currentYearPlantingWindow.start);
};

/**
 * Validate the harvest date input (basic rules only).
 *
 * Notes:
 * - Returns { isValid: false, error: null } for empty input to avoid showing an error
 *   while the user hasn't picked a date yet.
 */
export const validateHarvestDate = (
  harvestDateIso: string,
  now: Date | null
): ValidationResult => {
  if (!harvestDateIso || harvestDateIso.trim() === "") {
    return { isValid: false, error: null };
  }

  let harvestDate: Date;
  try {
    harvestDate = normalizeToStartOfDay(parseDateIso(harvestDateIso));
  } catch {
    return { isValid: false, error: "Ogiltigt skördedatum" };
  }

  const today = getNowDate(now);
  if (harvestDate.getTime() <= today.getTime()) {
    return {
      isValid: false,
      error: "Skördedatum kan ej vara i det förflutna. Välj ett giltigt datum",
    };
  }

  return { isValid: true, error: null };
};

/**
 * Calculate per-plant sow result message based on desired harvest date.
 *
 * - Detects harvest date outside harvest window (before/after)
 * - Detects if the computed sow date is too close (i.e., would need to have been sown before today)
 * - Detects if time is too short based on theoretical maturity (try anyway)
 * - Returns message with computed sow date (ISO) when possible
 */
export const getPlantSowResult = (
  harvestDateIso: string,
  plant: Plant,
  now: Date | null = null
): PlantSowResult | null => {
  if (!harvestDateIso || harvestDateIso.trim() === "") return null;

  let harvestDate: Date;
  try {
    harvestDate = normalizeToStartOfDay(parseDateIso(harvestDateIso));
  } catch {
    return null;
  }

  const today = getNowDate(now);

  // Rule: harvest date is today or in the past
  if (harvestDate.getTime() <= today.getTime()) {
    return {
      key: "harvestDateInPast",
      message: "Skördedatum kan ej vara i det förflutna. Välj ett giltigt datum",
      sowDateIso: null,
    };
  }

  const sowDate = calculateSowDate(
    harvestDate,
    plant.plantingWindows,
    plant.harvestTime ?? null,
    plant.plantingMethod
  );

  if (!sowDate) {
    return null;
  }

  sowDate.setHours(0, 0, 0, 0);
  const sowDateIso = formatDateIso(sowDate);

  const window = getHarvestWindowDates(plant.harvestTime ?? null, harvestDate.getFullYear());
  if (!window) {
    // If we can't determine harvest window, still provide a generic message based on closeness.
    if (sowDate.getTime() >= today.getTime()) {
      return {
        key: "harvestDate",
        message: `Sås på ${sowDateIso}`,
        sowDateIso,
      };
    }

    return {
      key: "harvestToClose",
      message: `Datumet ligger för nära i tid för att hinna mogna. Närmsta rekommenderade sådatum: ${sowDateIso}`,
      sowDateIso,
    };
  }

  const isBeforeWindow = harvestDate.getTime() < window.start.getTime();
  const isAfterWindow = harvestDate.getTime() > window.end.getTime();
  const isWithinWindow = !isBeforeWindow && !isAfterWindow;

  // "Too close" should be based on time to maturity, not "today", otherwise future dates won't trigger.
  // Days estimated to harvest from the dataset windows:
  // - plantingWindowEnd -> harvestWindowStart
  // This creates a plant-specific minimal growth time based on available data.
  const plantingWindowDates = getPlantingWindowDates(plant, harvestDate.getFullYear());
  const estimatedDaysToHarvest =
    plantingWindowDates !== null
      ? Math.max(0, diffDays(window.start, plantingWindowDates.end))
      : null;

  const daysBetweenSowAndHarvest = diffDays(harvestDate, sowDate);
  const isTooCloseByMaturity =
    estimatedDaysToHarvest !== null && daysBetweenSowAndHarvest < estimatedDaysToHarvest;

  const isTooClose = sowDate.getTime() < today.getTime() || isTooCloseByMaturity;

  // Check if sowDate is within planting window
  const isSowDateWithinWindow =
    plantingWindowDates !== null &&
    sowDate.getTime() >= plantingWindowDates.start.getTime() &&
    sowDate.getTime() <= plantingWindowDates.end.getTime();

  // "Try anyway" maturity: theoretical growth time from first day of planting window to first day of harvest window.
  // This is a gentler estimate (longer time) that allows users with controlled environments to try anyway.
  const maturityDaysTryAnyway =
    plantingWindowDates !== null
      ? Math.max(0, diffDays(window.start, plantingWindowDates.start))
      : null;

  // Only consider "try anyway" as a problem if:
  // 1. Harvest date is outside harvest window, OR
  // 2. Sow date is outside planting window, OR
  // 3. Sow date is in the past
  // AND the time between sow and harvest is less than the theoretical minimum
  // Otherwise, if both dates are within their windows, it's a valid scenario (even if time is short)
  const isTooCloseTryAnyway =
    maturityDaysTryAnyway !== null &&
    daysBetweenSowAndHarvest < maturityDaysTryAnyway &&
    (!isWithinWindow || !isSowDateWithinWindow || sowDate.getTime() < today.getTime());

  // Calculate the theoretical sow date for "try anyway" scenario using shared function
  const tryAnywaySowDate = calculateTryAnywaySowDate(harvestDate, plant);
  const tryAnywaySowDateIso = tryAnywaySowDate ? formatDateIso(tryAnywaySowDate) : null;

  // Perfect scenario: within window and not too close
  if (isWithinWindow && !isTooClose && !isTooCloseTryAnyway) {
    return {
      key: "harvestDate",
      message: `Sådatum: ${sowDateIso}`,
      sowDateIso,
    };
  }

  const messages: string[] = [];

  // Check if "too late to sow this year" message will be shown
  const willShowTooLateMessage = 
    isTooCloseTryAnyway && 
    tryAnywaySowDateIso && 
    tryAnywaySowDate && 
    tryAnywaySowDate.getTime() < today.getTime();

  // Check if outside harvest window - show warning if harvest date is outside window
  // But skip if "too late to sow this year" message will be shown (to avoid duplicates)
  if (!willShowTooLateMessage) {
    if (isBeforeWindow) {
      messages.push(
        `Valt skördedatum är före skördefönstret. Vi rekommenderar att du byter ditt skördedatum mot ett senare. Ditt uträknade sådatum (${tryAnywaySowDateIso}) är bara baserat på den tid som ${plant.name} behöver för att mogna. Om du ändå vill försöka skörda då så rekommenderar vi att du odlar i ett tempererat växthus och har koll på väderleken.`
      );
    } else if (isAfterWindow) {
      // Both indoor and outdoor plants should get recommendation
      messages.push(
        `Valt skördedatum är efter skördefönstret. Ditt uträknade sådatum (${tryAnywaySowDateIso}) är bara baserat på den tid som ${plant.name} behöver för att mogna. Om du ändå vill försöka skörda då behöver du beakta väderförhållandena och kanske även använda ett tempererat växthus för att lyckas.`
      );
    }
  }

  // Check if too close - show warning if time is too short
  if (isTooCloseTryAnyway && tryAnywaySowDateIso && tryAnywaySowDate) {
    const warningText = plant.plantingMethod === "indoor"
      ? "Tänk dock på att hålla koll på om det beräknas bli frost eller använd ett tempererat växthus för att lyckas."
      : "Tänk dock på att hålla koll på om det beräknas bli frost eller använd ett växthus.";
    
    if (tryAnywaySowDate.getTime() < today.getTime()) {
      // Sow date is in the past - need to try another year
      const nearestSowDateIso = calculateNearestSowDateIso(plant, today);

      // Calculate date for next year (+1 year from tryAnywaySowDate)
      const nextYearSowDate = new Date(tryAnywaySowDate);
      nextYearSowDate.setFullYear(nextYearSowDate.getFullYear() + 1);
      const nextYearSowDateIso = formatDateIso(nextYearSowDate);

      const harvestDateFormatted = formatDateSwedish(harvestDateIso);
      messages.push(
        `Datumet du valt (${harvestDateFormatted}) ligger för nära i tid för att hinna mogna. Närmsta rekommenderade sådatum för skörd i år är ${nearestSowDateIso}.\nOm du till nästa år ändå vill försöka skörda till ditt valda datum behöver du så: ${nextYearSowDateIso}. ${warningText}`
      );
      
      // Return nearestSowDateIso as sowDateIso so HarvestPlanner doesn't replace it with wrong date
      return {
        key: "harvestToClose",
        message: messages.join("\n"),
        sowDateIso: nearestSowDateIso,
      };
    }
  } else if (isTooClose) {
    // Too close but not in try-anyway scenario
    const warningText = plant.plantingMethod === "indoor"
      ? "Tänk dock på att du isåfall behöver exempelvis ett tempererat växthus för att lyckas."
      : "Tänk dock på att hålla koll på om det beräknas bli frost eller använd ett växthus.";
    const harvestDateFormatted = formatDateSwedish(harvestDateIso);
    messages.push(
      `Datumet du valt (${harvestDateFormatted}) ligger för nära i tid för att hinna mogna. Närmsta rekommenderade sådatum: ${sowDateIso}. ${warningText}`
    );
  }

  if (messages.length > 0) {
    // Determine the key based on priority:
    // 1. If too close in time (harvestToClose) - this is the most critical
    // 2. If outside harvest window but has time to mature (harvestDateBeforeHarvestWindow / harvestDateAfterHarvestWindow)
    // Note: When outside harvest window, we use tryAnywaySowDate to determine if there's enough time.
    // If tryAnywaySowDate is in the past, it's too close (already handled by early return above).
    // If tryAnywaySowDate is in the future, there's time to mature even if outside window.
    // Only consider it "too close" if:
    // - We're within the harvest window AND isTooClose is true, OR
    // - tryAnywaySowDate is in the past (but this is already handled by early return)
    const isActuallyTooClose = isTooClose && isWithinWindow;
    
    return {
      key: isActuallyTooClose
        ? "harvestToClose"
        : isBeforeWindow
          ? "harvestDateBeforeHarvestWindow"
          : "harvestDateAfterHarvestWindow",
      message: messages.join("\n"),
      sowDateIso,
    };
  }

  return null;
};


