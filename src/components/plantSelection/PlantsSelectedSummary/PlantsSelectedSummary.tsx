import { Button } from "../../shared/Button/Button";
import { SelectedPlantsList } from "../../shared/SelectedPlantsList/SelectedPlantsList";
import type { Plant } from "../../../models/Plant";
import "./PlantsSelectedSummary.scss";
import { Link } from "react-router-dom";

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
        <>
        <p>Du har inte valt några fröer ännu.</p>
        <p>
          <Link to="/plants" onClick={() => window.scrollTo(0, 0)}>
            Välj fröer </Link> här i fröbanken.
        </p>
        </>
      ) : (
        <>
          <SelectedPlantsList
            selectedPlants={selectedPlants}
            onOpenDetails={onOpenDetails}
            onRemove={onRemove}
            interactiveIcons={true}
          />
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


