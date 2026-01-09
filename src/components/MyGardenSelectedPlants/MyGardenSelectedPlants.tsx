import { useState } from "react";
import { Link } from "react-router-dom";

import { SelectedPlantsList } from "../SelectedPlantsList/SelectedPlantsList";
import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";
import "./MyGardenSelectedPlants.scss";

type MyGardenSelectedPlantsProps = {
  selectedPlants: Plant[];
  onRemovePlant: (plantId: number) => void;
  onPlantClick: (plant: Plant) => void;
  recommendations?: Recommendation[];
  harvestDateIso?: string | null;
};

export const MyGardenSelectedPlants = ({
  selectedPlants,
  onRemovePlant,
  onPlantClick,
  recommendations,
  harvestDateIso,
}: MyGardenSelectedPlantsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (selectedPlants.length === 0) {
    return (
      <div className="my-garden-selected-plants">
          <p>Du har inte valt några fröer ännu.</p>
          <p>
            <Link to="/plants">Gå till fröbanken för att välja fröer.</Link>
          </p>
      </div>
    );
  }

  return (
    <div className="my-garden-selected-plants">
      <button
        type="button"
        className="my-garden-selected-plants__header-button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Dölj" : "Visa"} Mina valda fröer`}
      >
        <h2 className="my-garden-selected-plants__header">
          Mina valda fröer
          <span className="my-garden-selected-plants__count">
            {" "}({selectedPlants.length})
          </span>
        </h2>
        <span className={`my-garden-selected-plants__header-icon ${isExpanded ? "my-garden-selected-plants__header-icon--expanded" : ""}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <SelectedPlantsList
          selectedPlants={selectedPlants}
          onOpenDetails={onPlantClick}
          onRemove={onRemovePlant}
          recommendations={recommendations}
          harvestDateIso={harvestDateIso}
        />
      )}
    </div>
  );
};

