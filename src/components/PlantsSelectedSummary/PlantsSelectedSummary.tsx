import { Button } from "../Button/Button";
import type { Plant } from "../../models/Plant";
import "./PlantsSelectedSummary.scss";

type PlantsSelectedSummaryProps = {
  selectedPlants: Plant[];
  selectedCount: number;
  onClear: () => void;
  onContinue: () => void;
  canContinue: boolean;
};

export const PlantsSelectedSummary = ({
  selectedPlants,
  selectedCount,
  onClear,
  onContinue,
  canContinue,
}: PlantsSelectedSummaryProps) => {
  return (
    <div className="plants-selected-summary">
      {selectedCount === 0 ? (
        <p>Du har inte valt några fröer än.</p>
      ) : (
        <>
          <ul className="plants-selected-summary__list">
            {selectedPlants.map((plant) => (
              <li key={plant.id}>{plant.name}</li>
            ))}
          </ul>
          <Button variant="secondary" onClick={onClear}>
            Rensa val
          </Button>
        </>
      )}

      <Button disabled={!canContinue} onClick={onContinue}>
        Till planeraren
      </Button>
    </div>
  );
};


