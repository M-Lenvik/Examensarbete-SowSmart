import { Link } from "react-router-dom";

import { Panel } from "../Panel/Panel";
import { SelectedPlantsList } from "../SelectedPlantsList/SelectedPlantsList";
import type { Plant } from "../../models/Plant";
import "./PlannerSelectedPlants.scss";

type PlannerSelectedPlantsProps = {
  selectedPlants: Plant[];
  plantMessages?: Map<number, string>; // Map of plantId -> sow result message
  onOpenDetails?: (plant: Plant) => void; // Callback to open plant detail modal
  onRemove?: (plantId: number) => void; // Callback to remove plant from selection
};

export const PlannerSelectedPlants = ({
  selectedPlants,
  plantMessages,
  onOpenDetails,
  onRemove,
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
        />
        <div className="planner-selected-plants__actions">
          <Link to="/plants" className="planner-selected-plants__link">
            Ändra val
          </Link>
        </div>
      </section>
    </Panel>
  );
};

