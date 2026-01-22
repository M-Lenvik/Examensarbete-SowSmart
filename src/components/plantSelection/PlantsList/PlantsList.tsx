import type { Plant } from "../../../models/Plant";
import { PlantsCard } from "../PlantsCard/PlantsCard";
import "./PlantsList.scss";

type PlantsListProps = {
  plants: Plant[];
  selectedPlantIds: number[];
  onToggleSelected: (plantId: number) => void;
  onOpenDetails: (plant: Plant) => void;
};

export const PlantsList = ({
  plants,
  selectedPlantIds,
  onToggleSelected,
  onOpenDetails,
}: PlantsListProps) => {
  return (
    <ul className="plants-list">
      {plants.map((plant) => {
        const isSelected = selectedPlantIds.includes(plant.id);

        return (
          <li key={plant.id} className="plants-list__item">
            <PlantsCard
              plant={plant}
              isSelected={isSelected}
              onToggleSelected={() => onToggleSelected(plant.id)}
              onOpenDetails={() => onOpenDetails(plant)}
            />
          </li>
        );
      })}
    </ul>
  );
};


