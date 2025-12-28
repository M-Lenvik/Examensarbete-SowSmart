import { Link } from "react-router-dom";

import { Panel } from "../Panel/Panel";
import type { Plant } from "../../models/Plant";
import "./PlannerSelectedPlants.scss";

type PlannerSelectedPlantsProps = {
  selectedPlants: Plant[];
  plantWarnings?: Map<number, string>; // Map of plantId -> warning message
  onOpenDetails?: (plant: Plant) => void; // Callback to open plant detail modal
};

export const PlannerSelectedPlants = ({
  selectedPlants,
  plantWarnings,
  onOpenDetails,
}: PlannerSelectedPlantsProps) => {
  if (selectedPlants.length === 0) {
    return null;
  }

  const handlePlantClick = (plant: Plant) => {
    if (onOpenDetails) {
      onOpenDetails(plant);
    }
  };

  return (
    <Panel title="Valda fröer">
      <div className="planner-selected-plants">
        <ul className="planner-selected-plants__list">
          {selectedPlants.map((plant) => {
            const warning = plantWarnings?.get(plant.id);
            return (
              <li key={plant.id} className="planner-selected-plants__item">
                {onOpenDetails ? (
                  <button
                    type="button"
                    className="planner-selected-plants__plant-button"
                    onClick={() => handlePlantClick(plant)}
                    aria-label={`Visa detaljer för ${plant.name}`}
                  >
                    {plant.name}
                  </button>
                ) : (
                  <span className="planner-selected-plants__plant-name">
                    {plant.name}
                  </span>
                )}
                {warning && (
                  <span className="planner-selected-plants__warning">
                    {warning}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="planner-selected-plants__actions">
          <Link to="/plants" className="planner-selected-plants__link">
            Ändra val
          </Link>
        </div>
      </div>
    </Panel>
  );
};

