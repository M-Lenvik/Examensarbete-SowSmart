import { savePlanToLocalStorage, clearPlanFromLocalStorage } from "../helpers/storage/localStorage";

export const PLAN_ACTIONS = {
  TOGGLE_SELECTED_PLANT: "TOGGLE_SELECTED_PLANT",
  CLEAR_SELECTION: "CLEAR_SELECTION",
  SET_HARVEST_DATE: "SET_HARVEST_DATE",
  RESET_PLAN: "RESET_PLAN",
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

export const planReducer = (state: PlanState, action: PlanAction): PlanState => {
  switch (action.type) {
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

    case PLAN_ACTIONS.CLEAR_SELECTION: {
      const newState = {
        ...state,
        selectedPlantIds: [],
      };
      savePlanToLocalStorage(newState);
      return newState;
    }

    case PLAN_ACTIONS.SET_HARVEST_DATE: {
      const newState = {
        ...state,
        harvestDateIso: action.payload.harvestDateIso,
      };
      savePlanToLocalStorage(newState);
      return newState;
    }

    case PLAN_ACTIONS.SET_RECOMMENDATIONS: {
      const newState = {
        ...state,
        recommendations: action.payload.recommendations,
      };
      savePlanToLocalStorage(newState);
      return newState;
    }

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


