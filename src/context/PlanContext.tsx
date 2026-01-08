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
      toggleSelectedPlant: (plantId) =>
        dispatch({
          type: PLAN_ACTIONS.TOGGLE_SELECTED_PLANT,
          payload: { plantId },
        }),
      clearSelection: () => dispatch({ type: PLAN_ACTIONS.CLEAR_SELECTION }),
      setHarvestDateIso: (harvestDateIso) =>
        dispatch({
          type: PLAN_ACTIONS.SET_HARVEST_DATE,
          payload: { harvestDateIso },
        }),
      setRecommendations: (recommendations) =>
        dispatch({
          type: PLAN_ACTIONS.SET_RECOMMENDATIONS,
          payload: { recommendations },
        }),
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


