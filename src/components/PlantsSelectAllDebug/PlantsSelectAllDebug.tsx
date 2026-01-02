/**
 * DEBUG COMPONENT - Remove before production
 * 
 * Component for selecting/deselecting all plants in the filtered list.
 * All code is self-contained for easy removal.
 */

import { useContext, useMemo } from "react";
import { PlanContext } from "../../context/PlanContext";
import type { Plant } from "../../models/Plant";
import "./PlantsSelectAllDebug.scss";

type PlantsSelectAllDebugProps = {
  filteredPlants: Plant[];
};

export const PlantsSelectAllDebug = ({ filteredPlants }: PlantsSelectAllDebugProps) => {
  const { state, actions } = useContext(PlanContext);

  // Check if all filtered plants are selected
  const allSelected = useMemo(() => {
    if (filteredPlants.length === 0) return false;
    const selectedSet = new Set(state.selectedPlantIds);
    return filteredPlants.every((plant) => selectedSet.has(plant.id));
  }, [filteredPlants, state.selectedPlantIds]);

  // Check if some (but not all) filtered plants are selected
  const someSelected = useMemo(() => {
    if (filteredPlants.length === 0) return false;
    const selectedSet = new Set(state.selectedPlantIds);
    const selectedCount = filteredPlants.filter((plant) => selectedSet.has(plant.id)).length;
    return selectedCount > 0 && selectedCount < filteredPlants.length;
  }, [filteredPlants, state.selectedPlantIds]);

  const handleToggleAll = () => {
    if (allSelected) {
      // Deselect all filtered plants
      filteredPlants.forEach((plant) => {
        if (state.selectedPlantIds.includes(plant.id)) {
          actions.toggleSelectedPlant(plant.id);
        }
      });
    } else {
      // Select all filtered plants
      filteredPlants.forEach((plant) => {
        if (!state.selectedPlantIds.includes(plant.id)) {
          actions.toggleSelectedPlant(plant.id);
        }
      });
    }
  };

  if (filteredPlants.length === 0) {
    return null;
  }

  return (
    <div className="plants-select-all-debug">
      <label className="plants-select-all-debug__label">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleToggleAll}
          className="plants-select-all-debug__checkbox"
          aria-label="Markera alla fröer"
        />
        <span className="plants-select-all-debug__text">
          Markera alla ({filteredPlants.length} fröer)
        </span>
        {someSelected && (
          <span className="plants-select-all-debug__partial">
            ({state.selectedPlantIds.filter((id) =>
              filteredPlants.some((p) => p.id === id)
            ).length} valda)
          </span>
        )}
      </label>
    </div>
  );
};

