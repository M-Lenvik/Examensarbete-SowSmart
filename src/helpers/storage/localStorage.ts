/**
 * Helper functions for persisting plan data to localStorage.
 * 
 * Data sources:
 * - plan: From PlanContext (PlanState with selectedPlantIds, harvestDateIso, recommendations)
 * - harvestDatesByFilter: Map of filter ID to harvest date ISO string (for filter-based harvest dates)
 * 
 * This module handles saving and loading user plans to browser localStorage,
 * allowing users to return to their plan after closing the browser.
 * 
 * **Storage keys:**
 * - "sowsmart_plan": Main plan data (selected plants, harvest date, recommendations)
 * - "sowsmart_harvest_dates_filter": Filter-based harvest dates (for advanced filtering)
 * 
 * Results:
 * - savePlanToLocalStorage: Returns void (saves plan to localStorage)
 * - loadPlanFromLocalStorage: Returns SavedPlan | null (loaded plan or null)
 * - clearPlanFromLocalStorage: Returns void (clears plan from localStorage)
 * - saveHarvestDatesByFilterToLocalStorage: Returns void (saves filter harvest dates)
 * - loadHarvestDatesByFilterFromLocalStorage: Returns Map<string, string> (loaded filter harvest dates)
 * 
 * Uses:
 * - (none - browser localStorage API only)
 * 
 * Used by:
 * - context/PlanContext.tsx - for loading saved plan on mount
 * - reducers/planReducer.ts - for saving plan on every state change
 * - pages/HarvestPlanner.tsx - for saving/loading filter-based harvest dates
 */

import type { PlanState, Recommendation } from "../../reducers/planReducer";

const STORAGE_KEY = "sowsmart_plan";

export type SavedPlan = {
  selectedPlantIds: number[];
  harvestDateIso: string | null;
  recommendations: Recommendation[];
  savedAt: string; // ISO timestamp
};

/**
 * Saves plan to localStorage with timestamp.
 * 
 * Persists the entire plan state (selected plants, harvest date, recommendations)
 * to browser localStorage so users can return to their plan later.
 * 
 * @param plan - The plan state to save (PlanState from PlanContext)
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
 * Loads plan from localStorage.
 * 
 * Retrieves the saved plan from browser localStorage and validates its structure.
 * Returns null if no plan is saved, if the data is invalid, or if parsing fails.
 * 
 * @returns Saved plan (SavedPlan) or null if not found or invalid
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
 * Clears saved plan from localStorage.
 * 
 * Removes the saved plan from browser localStorage. Used when user wants to
 * start fresh or when plan data needs to be reset.
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
 * Saves harvest dates by filter to localStorage.
 * 
 * Persists filter-based harvest dates (used when users set different harvest dates
 * for different plant filters) to browser localStorage.
 * 
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
 * Loads harvest dates by filter from localStorage.
 * 
 * Retrieves filter-based harvest dates from browser localStorage and validates
 * the structure. Returns empty Map if no data is saved or if parsing fails.
 * 
 * @returns Map of filter ID to harvest date ISO string, or empty Map if not found or invalid
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

