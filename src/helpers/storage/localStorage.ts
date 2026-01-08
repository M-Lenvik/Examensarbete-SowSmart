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

