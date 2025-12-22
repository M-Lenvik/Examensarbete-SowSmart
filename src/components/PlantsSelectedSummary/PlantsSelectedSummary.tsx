import { Button } from "../Button/Button";
import type { Plant } from "../../models/Plant";
import "./PlantsSelectedSummary.scss";

type PlantsSelectedSummaryProps = {
  selectedPlants: Plant[];
  selectedCount: number;
  onClear: () => void;
  onContinue: () => void;
  onOpenDetails: (plant: Plant) => void;
  onRemove: (plantId: number) => void;
  canContinue: boolean;
};

export const PlantsSelectedSummary = ({
  selectedPlants,
  selectedCount,
  onClear,
  onContinue,
  onOpenDetails,
  onRemove,
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
              <li key={plant.id} className="plants-selected-summary__list-item">
                <button
                  type="button"
                  className="plants-selected-summary__item"
                  onClick={() => onOpenDetails(plant)}
                  aria-label={`Öppna detaljer för ${plant.name}`}
                >
                  {plant.name}
                </button>
                <button
                  type="button"
                  className="plants-selected-summary__remove"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(plant.id);
                  }}
                  aria-label={`Ta bort ${plant.name}`}
                >
                  ×
                </button>
              </li>
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


