import { Link } from "react-router-dom";

import { Panel } from "../Panel/Panel";
import { SelectedPlantsList } from "../SelectedPlantsList/SelectedPlantsList";
import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";
import type { PlantSowResult } from "../../helpers/date/dateValidation";
import "./PlannerSelectedPlants.scss";

type PlannerSelectedPlantsProps = {
  selectedPlants: Plant[];
  plantMessages?: Map<number, PlantSowResult>; // Map of plantId -> sow result
  onOpenDetails?: (plant: Plant) => void; // Callback to open plant detail modal
  onRemove?: (plantId: number) => void; // Callback to remove plant from selection
  harvestDatesByPlant?: Map<number, string>; // Map of plantId -> harvest date ISO
  recommendations?: Recommendation[]; // Recommendations for date display
  harvestDateIso?: string | null; // Global harvest date (fallback)
};

export const PlannerSelectedPlants = ({
  selectedPlants,
  plantMessages,
  onOpenDetails,
  onRemove,
  harvestDatesByPlant,
  recommendations,
  harvestDateIso,
}: PlannerSelectedPlantsProps) => {
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
          harvestDatesByPlant={harvestDatesByPlant}
          recommendations={recommendations}
          harvestDateIso={harvestDateIso}
        />
        <div className="planner-selected-plants__actions">
          <Link to="/plants" className="button button--secondary">
            Ändra val
          </Link>
        </div>
      </section>
    </Panel>
  );
};

