import { formatDateIso, parseDateIso } from "./date";
import { calculateSowDate, calculateTryAnywaySowDate } from "../calculation/sowDate";
import { selectPlantingWindow } from "../plant/plantingWindow";
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

const getHarvestWindowDates = (
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

const getPlantingWindowDates = (
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

const diffDays = (later: Date, earlier: Date): number => {
  return Math.floor((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
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

  // "Try anyway" maturity: theoretical growth time from first day of planting window to first day of harvest window.
  // This is a gentler estimate (longer time) that allows users with controlled environments to try anyway.
  const maturityDaysTryAnyway =
    plantingWindowDates !== null
      ? Math.max(0, diffDays(window.start, plantingWindowDates.start))
      : null;

  const isTooCloseTryAnyway =
    maturityDaysTryAnyway !== null && daysBetweenSowAndHarvest < maturityDaysTryAnyway;

  // Calculate the theoretical sow date for "try anyway" scenario using shared function
  const tryAnywaySowDate = calculateTryAnywaySowDate(harvestDate, plant);
  const tryAnywaySowDateIso = tryAnywaySowDate ? formatDateIso(tryAnywaySowDate) : null;

  // Rule: within harvest window and not too close (neither strict nor try-anyway)
  if (isWithinWindow && !isTooClose && !isTooCloseTryAnyway) {
    return {
      key: "harvestDate",
      message: `Sås på ${sowDateIso}`,
      sowDateIso,
    };
  }

  const messages: string[] = [];

  // If outside harvest window, always show the corresponding message
  if (isBeforeWindow) {
    messages.push(
      `Valt skördedatum är före skördefönstret. Rekommenderat första sådatum för att skörda ${plant.name} inom skördeperioden är: ${sowDateIso}`
    );
  } else if (isAfterWindow) {
    messages.push(`Valt skördedatum är efter skördefönstret. För mognad till detta datum är teoretiskt sådatum: ${tryAnywaySowDateIso}. Om du ändå vill försöka skörda då ligger det utanför skördefönstret och du kan behöva exempelvis ett tempererat växthus för att lyckas. Rekommenderat första sådatum för att skörda inom skördeperioden för ${plant.name} är: ${sowDateIso}.`);
  }

  // If too close, also show the too-close message (so user can see both when applicable)
  if (isTooClose) {
    if (isBeforeWindow) {
      messages.push(
        `Datumet ligger för nära i tid för att hinna mogna och före skördefönstret. Närmsta rekommenderade sådatum: ${sowDateIso}. Om du till ett annat år ändå vill försöka skörda till ${harvestDateIso} så är rekommenderat sådatum: ${tryAnywaySowDateIso}. Tänk dock på att du isåfall behöver exempelvis ett tempererat växthus för att lyckas.`
      );
    } else if (isAfterWindow) {
      messages.push(
        `Datumet ligger för nära i tid för att hinna mogna och efter skördefönstret. Rekommenderad såperiod för ${plant.name} är: ${plantingWindowDates?.start.toLocaleDateString()} - ${plantingWindowDates?.end.toLocaleDateString()}. Om du till ett annat år ändå vill försöka skörda till ${harvestDateIso} så är rekommenderat sådatum: ${tryAnywaySowDateIso}. Tänk dock på att du isåfall behöver exempelvis ett tempererat växthus för att lyckas.`
      );
    } else {
      messages.push(
        `Datumet ligger för nära i tid för att hinna mogna. Rekommenderad såperiod för ${plant.name} är: ${plantingWindowDates?.start.toLocaleDateString()} - ${plantingWindowDates?.end.toLocaleDateString()}. Om du ändå vill försöka skörda till ${harvestDateIso} så är rekommenderat sådatum: ${tryAnywaySowDateIso}. Tänk dock på att du isåfall behöver exempelvis ett tempererat växthus för att lyckas.`
      );
    }
  }



    // If too close by theoretical maturity (try anyway), show the theoretical sow date
  // Always show the "other year" message when isTooCloseTryAnyway is true
  if (isTooCloseTryAnyway && tryAnywaySowDateIso && tryAnywaySowDate) {
    // Show short message if sow date is in the future (theoretically possible this year)
    if (tryAnywaySowDate.getTime() >= today.getTime()) {
      messages.push(
        `Du behöver så: ${tryAnywaySowDateIso}. Tänk dock på att du isåfall behöver exempelvis ett tempererat växthus för att lyckas.`
      );
    } else {
      // Show long message if sow date is in the past (need to try another year)
      messages.push(
        `Om du till ett annat år vill försöka ändå så skulle du behövt så: ${tryAnywaySowDateIso}. Tänk dock på att du isåfall behöver exempelvis ett tempererat växthus för att lyckas.`
      );
    }
  }
  

  if (messages.length > 0) {
    return {
      key: isTooClose
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

