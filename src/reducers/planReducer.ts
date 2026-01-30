/**
 * Reducer for managing plan state (selected plants, harvest date, recommendations).
 * 
 * Data sources:
 * - Actions dispatched from PlanContext or pages
 * - State updates trigger localStorage persistence
 * 
 * Results:
 * - planReducer: Reducer function that handles all plan actions
 * - PLAN_ACTIONS: Action type constants
 * - PlanState: Type definition for plan state
 * - Recommendation: Type definition for plant recommendations
 * - PlanAction: Union type for all plan actions
 * - initialPlanState: Default initial state
 * 
 * Uses:
 * - helpers/storage/localStorage.ts (savePlanToLocalStorage, clearPlanFromLocalStorage)
 * 
 * Used by:
 * - context/PlanContext.tsx - for managing global plan state
 */

import { savePlanToLocalStorage, clearPlanFromLocalStorage } from "../helpers/storage/localStorage";

/**
 * Action types for the plan reducer.
 * 
 * These constants define all possible actions that can be dispatched to modify
 * the plan state (selected plants, harvest date, recommendations).
 */
export const PLAN_ACTIONS = {
  /** Toggle a plant's selection status (add if not selected, remove if selected) */
  TOGGLE_SELECTED_PLANT: "TOGGLE_SELECTED_PLANT",
  /** Clear all selected plants from the plan */
  CLEAR_SELECTION: "CLEAR_SELECTION",
  /** Set the global harvest date for all selected plants */
  SET_HARVEST_DATE: "SET_HARVEST_DATE",
  /** Reset the entire plan to initial state (clears selection, date, and recommendations) */
  RESET_PLAN: "RESET_PLAN",
  /** Set the calculated recommendations (sow dates, etc.) for all selected plants */
  SET_RECOMMENDATIONS: "SET_RECOMMENDATIONS",
} as const;

export type Recommendation = {
  plantId: number;
  // Outdoor path (if applicable)
  outdoorSowDate: string | null; // ISO-format
  // Indoor path (if applicable)
  indoorSowDate: string | null; // ISO-format
  hardenStartDate: string | null; // ISO-format
  movePlantOutdoorDate: string | null; // ISO-format
  harvestDateIso: string; // ISO-format - the harvest date used for this recommendation
  warnings: string[]; // Varningar om saknad data
};

export type PlanState = {
  selectedPlantIds: number[];
  harvestDateIso: string | null;
  recommendations: Recommendation[];
};

type ToggleSelectedPlantAction = {
  type: typeof PLAN_ACTIONS.TOGGLE_SELECTED_PLANT;
  payload: { plantId: number };
};

type ClearSelectionAction = {
  type: typeof PLAN_ACTIONS.CLEAR_SELECTION;
};

type SetHarvestDateAction = {
  type: typeof PLAN_ACTIONS.SET_HARVEST_DATE;
  payload: { harvestDateIso: string | null };
};

type ResetPlanAction = {
  type: typeof PLAN_ACTIONS.RESET_PLAN;
};

type SetRecommendationsAction = {
  type: typeof PLAN_ACTIONS.SET_RECOMMENDATIONS;
  payload: { recommendations: Recommendation[] };
};

export type PlanAction =
  | ToggleSelectedPlantAction
  | ClearSelectionAction
  | SetHarvestDateAction
  | ResetPlanAction
  | SetRecommendationsAction;

export const initialPlanState: PlanState = {
  selectedPlantIds: [],
  harvestDateIso: null,
  recommendations: [],
};

/**
 * Reducer function that handles all plan state updates.
 * 
 * Each action case:
 * 1. Creates a new state object (immutable update)
 * 2. Saves to localStorage (except RESET_PLAN which clears it)
 * 3. Returns the new state
 * 
 * @param state - Current plan state
 * @param action - Action to perform
 * @returns New plan state
 */
export const planReducer = (state: PlanState, action: PlanAction): PlanState => {
  switch (action.type) {
    /**
     * Toggle a plant's selection status.
     * 
     * **State changes:**
     * - If plant is selected: removes it from `selectedPlantIds`
     * - If plant is not selected: adds it to `selectedPlantIds`
     * 
     * **When used:** When user clicks to select/deselect a plant in PlantSelection page
     */
    case PLAN_ACTIONS.TOGGLE_SELECTED_PLANT: {
      const { plantId } = action.payload;
      const isSelected = state.selectedPlantIds.includes(plantId);

      const newState = {
        ...state,
        selectedPlantIds: isSelected
          ? state.selectedPlantIds.filter((id) => id !== plantId)
          : [...state.selectedPlantIds, plantId],
      };
      savePlanToLocalStorage(newState);
      return newState;
    }

    /**
     * Clear all selected plants.
     * 
     * **State changes:**
     * - Sets `selectedPlantIds` to empty array `[]`
     * 
     * **When used:** When user clicks "Rensa val" button in PlantSelection page
     */
    case PLAN_ACTIONS.CLEAR_SELECTION: {
      const newState = {
        ...state,
        selectedPlantIds: [],
      };
      savePlanToLocalStorage(newState);
      return newState;
    }

    /**
     * Set the global harvest date.
     * 
     * **State changes:**
     * - Updates `harvestDateIso` to the provided date (ISO format string) or `null`
     * 
     * **When used:** When user selects a harvest date in HarvestPlanner page
     */
    case PLAN_ACTIONS.SET_HARVEST_DATE: {
      const newState = {
        ...state,
        harvestDateIso: action.payload.harvestDateIso,
      };
      savePlanToLocalStorage(newState);
      return newState;
    }

    /**
     * Set the calculated recommendations.
     * 
     * **State changes:**
     * - Replaces entire `recommendations` array with new recommendations
     * - Each recommendation contains sow dates, harden dates, etc. for a specific plant
     * 
     * **When used:** After user clicks "Beräkna plan" in HarvestPlanner and calculations complete
     */
    case PLAN_ACTIONS.SET_RECOMMENDATIONS: {
      const newState = {
        ...state,
        recommendations: action.payload.recommendations,
      };
      savePlanToLocalStorage(newState);
      return newState;
    }

    /**
     * Reset the entire plan to initial state.
     * 
     * **State changes:**
     * - Sets `selectedPlantIds` to `[]`
     * - Sets `harvestDateIso` to `null`
     * - Sets `recommendations` to `[]`
     * - Clears localStorage
     * 
     * **When used:** When user wants to start over with a completely new plan
     */
    case PLAN_ACTIONS.RESET_PLAN: {
      clearPlanFromLocalStorage();
      return initialPlanState;
    }

    default: {
      // Exhaustiveness check
      const _never: never = action;
      void _never;
      return state;
    }
  }
};


