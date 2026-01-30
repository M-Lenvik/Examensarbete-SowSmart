/**
 * PlannerSelectedPlants component - displays selected plants in planner with actions.
 * 
 * Data sources:
 * - Props: selectedPlants, plantMessages, recommendations, harvestDateIso, harvestDatesByPlant
 * 
 * Results:
 * - Returns: JSX (panel with selected plants list and navigation button)
 * 
 * Uses:
 * - components/shared/Panel/Panel.tsx (Panel)
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx (SelectedPlantsList)
 * - react-router-dom (useNavigate)
 * 
 * Used by:
 * - pages/HarvestPlanner.tsx - for displaying selected plants in planner
 */

import { useNavigate } from "react-router-dom";

import { Panel } from "../../shared/Panel/Panel";
import { SelectedPlantsList } from "../../shared/SelectedPlantsList/SelectedPlantsList";
import type { Plant } from "../../../models/Plant";
import type { Recommendation } from "../../../reducers/planReducer";
import type { PlantSowResult } from "../../../helpers/date/dateValidation";
import "./PlannerSelectedPlants.scss";

type PlannerSelectedPlantsProps = {
  selectedPlants: Plant[];
  plantMessages?: Map<number, PlantSowResult>; // Map of plantId -> sow result
  onOpenDetails?: (plant: Plant) => void; // Callback to open plant detail modal
  onRemove?: (plantId: number) => void; // Callback to remove plant from selection
  onChangeHarvestDate?: (plantId: number, dateIso: string) => void; // Callback to change harvest date for a specific plant
  harvestDatesByPlant?: Map<number, string>; // Map of plantId -> harvest date ISO
  recommendations?: Recommendation[]; // Recommendations for date display
  harvestDateIso?: string | null; // Global harvest date (fallback)
};

export const PlannerSelectedPlants = ({
  selectedPlants,
  plantMessages,
  onOpenDetails,
  onRemove,
  onChangeHarvestDate,
  harvestDatesByPlant,
  recommendations,
  harvestDateIso,
}: PlannerSelectedPlantsProps) => {
  const navigate = useNavigate();

  if (selectedPlants.length === 0) {
    return null;
  }

  return (
    <Panel title={`Mina valda fröer (${selectedPlants.length})`}>
      <section className="planner-selected-plants">
        <SelectedPlantsList
          selectedPlants={selectedPlants}
          plantMessages={plantMessages}
          onOpenDetails={onOpenDetails}
          onRemove={onRemove}
          onChangeHarvestDate={onChangeHarvestDate}
          harvestDatesByPlant={harvestDatesByPlant}
          recommendations={recommendations}
          harvestDateIso={harvestDateIso}
          interactiveIcons={true}
        />
        <div className="planner-selected-plants__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={() => navigate("/plants")}
          >
            Ändra dina fröval
          </button>
        </div>
      </section>
    </Panel>
  );
};

