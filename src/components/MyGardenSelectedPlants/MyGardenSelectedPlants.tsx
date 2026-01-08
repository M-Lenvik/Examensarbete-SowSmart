import { useState } from "react";
import { Link } from "react-router-dom";

import { RemoveButton } from "../RemoveButton/RemoveButton";
import type { Plant } from "../../models/Plant";
import "./MyGardenSelectedPlants.scss";

type MyGardenSelectedPlantsProps = {
  selectedPlants: Plant[];
  onRemovePlant: (plantId: number) => void;
  onPlantClick: (plant: Plant) => void;
};

export const MyGardenSelectedPlants = ({
  selectedPlants,
  onRemovePlant,
  onPlantClick,
}: MyGardenSelectedPlantsProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (selectedPlants.length === 0) {
    return (
      <div className="my-garden-selected-plants">
        <p>
          Inga frön valda än.{" "}
          <Link to="/plants" className="my-garden-selected-plants__link">
            Gå till fröbanken för att välja frön.
          </Link>
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
        <ul className="my-garden-selected-plants__list">
          {selectedPlants.map((plant) => (
            <li key={plant.id} className="my-garden-selected-plants__list-item">
              <button
                type="button"
                className="my-garden-selected-plants__item"
                onClick={() => onPlantClick(plant)}
                aria-label={`Öppna detaljer för ${plant.name}`}
              >
                <span className="my-garden-selected-plants__name">{plant.name}</span>
                <span className="my-garden-selected-plants__subcategory">{plant.subcategory}</span>
              </button>
              <RemoveButton
                onClick={(event) => {
                  event.stopPropagation();
                  onRemovePlant(plant.id);
                }}
                ariaLabel={`Ta bort ${plant.name}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

