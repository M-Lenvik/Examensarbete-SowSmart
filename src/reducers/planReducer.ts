export const PLAN_ACTIONS = {
  TOGGLE_SELECTED_PLANT: "TOGGLE_SELECTED_PLANT",
  CLEAR_SELECTION: "CLEAR_SELECTION",
  SET_HARVEST_DATE: "SET_HARVEST_DATE",
  RESET_PLAN: "RESET_PLAN",
  SET_RECOMMENDATIONS: "SET_RECOMMENDATIONS",
} as const;

export type Recommendation = {
  // TODO: Replace with the real recommendation model in Milestone D/E
  plantId: number;
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

      return {
        ...state,
        selectedPlantIds: isSelected
          ? state.selectedPlantIds.filter((id) => id !== plantId)
          : [...state.selectedPlantIds, plantId],
      };
    }

    case PLAN_ACTIONS.CLEAR_SELECTION: {
      return {
        ...state,
        selectedPlantIds: [],
      };
    }

    case PLAN_ACTIONS.SET_HARVEST_DATE: {
      return {
        ...state,
        harvestDateIso: action.payload.harvestDateIso,
      };
    }

    case PLAN_ACTIONS.SET_RECOMMENDATIONS: {
      return {
        ...state,
        recommendations: action.payload.recommendations,
      };
    }

    case PLAN_ACTIONS.RESET_PLAN: {
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


