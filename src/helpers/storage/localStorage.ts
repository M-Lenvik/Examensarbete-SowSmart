import type { PlanState, Recommendation } from "../../reducers/planReducer";

const STORAGE_KEY = "sowsmart_plan";

export type SavedPlan = {
  selectedPlantIds: number[];
  harvestDateIso: string | null;
  recommendations: Recommendation[];
  savedAt: string; // ISO timestamp
};

/**
 * Saves plan to localStorage with timestamp
 * @param plan - The plan state to save
 */
export const savePlanToLocalStorage = (plan: PlanState): void => {
  try {
    const savedPlan: SavedPlan = {
      ...plan,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlan));
  } catch (error) {
    console.error("Failed to save plan to localStorage:", error);
  }
};

/**
 * Loads plan from localStorage
 * @returns Saved plan or null if not found or invalid
 */
export const loadPlanFromLocalStorage = (): SavedPlan | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as SavedPlan;

    // Validate structure
    if (
      !parsed ||
      !Array.isArray(parsed.selectedPlantIds) ||
      (parsed.harvestDateIso !== null && typeof parsed.harvestDateIso !== "string") ||
      !Array.isArray(parsed.recommendations) ||
      typeof parsed.savedAt !== "string"
    ) {
      console.error("Invalid plan data in localStorage");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load plan from localStorage:", error);
    return null;
  }
};

/**
 * Clears saved plan from localStorage
 */
export const clearPlanFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear plan from localStorage:", error);
  }
};

const HARVEST_DATES_FILTER_STORAGE_KEY = "sowsmart_harvest_dates_filter";

/**
 * Saves harvest dates by filter to localStorage
 * @param harvestDatesByFilter - Map of filter ID to harvest date ISO string
 */
export const saveHarvestDatesByFilterToLocalStorage = (harvestDatesByFilter: Map<string, string>): void => {
  try {
    // Convert Map to object for JSON serialization
    const obj = Object.fromEntries(harvestDatesByFilter);
    localStorage.setItem(HARVEST_DATES_FILTER_STORAGE_KEY, JSON.stringify(obj));
  } catch (error) {
    console.error("Failed to save harvest dates by filter to localStorage:", error);
  }
};

/**
 * Loads harvest dates by filter from localStorage
 * @returns Map of filter ID to harvest date ISO string, or empty Map if not found
 */
export const loadHarvestDatesByFilterFromLocalStorage = (): Map<string, string> => {
  try {
    const stored = localStorage.getItem(HARVEST_DATES_FILTER_STORAGE_KEY);
    if (!stored) {
      return new Map();
    }

    const parsed = JSON.parse(stored) as Record<string, string>;
    
    // Validate structure
    if (!parsed || typeof parsed !== "object") {
      console.error("Invalid harvest dates by filter data in localStorage");
      return new Map();
    }

    // Convert object back to Map
    return new Map(Object.entries(parsed));
  } catch (error) {
    console.error("Failed to load harvest dates by filter from localStorage:", error);
    return new Map();
  }
};

