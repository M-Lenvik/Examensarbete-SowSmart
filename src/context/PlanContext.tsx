import { createContext, useMemo, useReducer } from "react";

import type React from "react";

import { initialPlanState, PLAN_ACTIONS, planReducer } from "../reducers/planReducer";
import type { PlanAction, PlanState, Recommendation } from "../reducers/planReducer";
import { clearPlanFromLocalStorage, loadPlanFromLocalStorage } from "../helpers/storage/localStorage";

type PlanContextValue = {
  state: PlanState;
  dispatch: React.Dispatch<PlanAction>;
  actions: {
    toggleSelectedPlant: (plantId: number) => void;
    clearSelection: () => void;
    setHarvestDateIso: (harvestDateIso: string | null) => void;
    setRecommendations: (recommendations: Recommendation[]) => void;
    resetPlan: () => void;
  };
};

export const PlanContext = createContext<PlanContextValue>({
  state: initialPlanState,
  dispatch: () => undefined,
  actions: {
    toggleSelectedPlant: () => undefined,
    clearSelection: () => undefined,
    setHarvestDateIso: () => undefined,
    setRecommendations: () => undefined,
    resetPlan: () => undefined,
  },
});

type PlanProviderProps = {
  children: React.ReactNode;
};

export const PlanProvider = ({ children }: PlanProviderProps) => {
  // Load saved plan from localStorage on mount
  const [state, dispatch] = useReducer(planReducer, initialPlanState, () => {
    const savedPlan = loadPlanFromLocalStorage();
    if (savedPlan) {
      return {
        selectedPlantIds: savedPlan.selectedPlantIds,
        harvestDateIso: savedPlan.harvestDateIso,
        recommendations: savedPlan.recommendations,
      };
    }
    return initialPlanState;
  });


  const actions = useMemo<PlanContextValue["actions"]>(() => {
    return {
      /**
       * Toggle a plant's selection status.
       * Dispatches TOGGLE_SELECTED_PLANT action to add/remove plant from selection.
       */
      toggleSelectedPlant: (plantId) =>
        dispatch({
          type: PLAN_ACTIONS.TOGGLE_SELECTED_PLANT,
          payload: { plantId },
        }),
      /**
       * Clear all selected plants.
       * Dispatches CLEAR_SELECTION action to reset selectedPlantIds to empty array.
       */
      clearSelection: () => dispatch({ type: PLAN_ACTIONS.CLEAR_SELECTION }),
      /**
       * Set the global harvest date.
       * Dispatches SET_HARVEST_DATE action to update harvestDateIso in state.
       */
      setHarvestDateIso: (harvestDateIso) =>
        dispatch({
          type: PLAN_ACTIONS.SET_HARVEST_DATE,
          payload: { harvestDateIso },
        }),
      /**
       * Set the calculated recommendations.
       * Dispatches SET_RECOMMENDATIONS action to replace recommendations array with new calculations.
       */
      setRecommendations: (recommendations) =>
        dispatch({
          type: PLAN_ACTIONS.SET_RECOMMENDATIONS,
          payload: { recommendations },
        }),
      /**
       * Reset the entire plan to initial state.
       * Dispatches RESET_PLAN action and clears localStorage.
       */
      resetPlan: () => {
        dispatch({ type: PLAN_ACTIONS.RESET_PLAN });
        clearPlanFromLocalStorage();
      },
    };
  }, []);

  const value = useMemo<PlanContextValue>(() => {
    return { state, dispatch, actions };
  }, [state, actions]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};


