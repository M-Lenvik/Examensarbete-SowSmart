import { Link } from "react-router-dom";

import { Panel } from "../Panel/Panel";
import { RemoveButton } from "../RemoveButton/RemoveButton";
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

  const handlePlantClick = (plant: Plant) => {
    if (onOpenDetails) {
      onOpenDetails(plant);
    }
  };

  return (
    <Panel title="Valda fröer">
      <section className="planner-selected-plants">
        <ul className="planner-selected-plants__list">
          {selectedPlants.map((plant) => {
            const message = plantMessages?.get(plant.id);
            return (
              <li key={plant.id} className="planner-selected-plants__item">
                <div className="planner-selected-plants__plant-info">
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
                  {message && (
                    <span className="planner-selected-plants__message">
                      {message}
                    </span>
                  )}
                </div>
                {onRemove && (
                  <RemoveButton
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(plant.id);
                    }}
                    ariaLabel={`Ta bort ${plant.name}`}
                  />
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
      </section>
    </Panel>
  );
};

