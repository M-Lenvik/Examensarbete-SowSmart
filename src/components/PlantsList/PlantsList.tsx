import type { Plant } from "../../models/Plant";
import "./PlantsList.scss";

type PlantsListProps = {
  plants: Plant[];
  selectedPlantIds: number[];
  onToggleSelected: (plantId: number) => void;
};

export const PlantsList = ({
  plants,
  selectedPlantIds,
  onToggleSelected,
}: PlantsListProps) => {
  return (
    <ul className="plants-list">
      {plants.map((plant) => {
        const isSelected = selectedPlantIds.includes(plant.id);
        const inputId = `plant-select-${plant.id}`;

        return (
          <li key={plant.id} className="plants-list__item">
            <label className="plants-list__label" htmlFor={inputId}>
              <input
                id={inputId}
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelected(plant.id)}
              />
              <span className="plants-list__name">{plant.name}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};


