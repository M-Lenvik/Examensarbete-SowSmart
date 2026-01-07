import { Button } from "../Button/Button";
import { RemoveButton } from "../RemoveButton/RemoveButton";
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
    <section className="plants-selected-summary">
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
                <RemoveButton
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(plant.id);
                  }}
                  ariaLabel={`Ta bort ${plant.name}`}
                />
              </li>
            ))}
          </ul>
          <Button 
            variant="secondary" 
            className="plants-selected-summary__button"
            onClick={onClear}
          >
            Rensa val
          </Button>
        </>
      )}

      <Button 
        className="plants-selected-summary__button"
        disabled={!canContinue} 
        onClick={onContinue}
      >
        Till planeraren
      </Button>
    </section>
  );
};


