/**
 * PlantsSelectedSummary component - displays summary of selected plants with actions.
 * 
 * Data sources:
 * - Props: selectedPlants, selectedCount, recommendations, harvestDateIso
 * 
 * Results:
 * - Returns: JSX (summary section with selected plants list and action buttons)
 * 
 * Uses:
 * - components/shared/Button/Button.tsx (Button)
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx (SelectedPlantsList)
 * - react-router-dom (Link)
 * 
 * Used by:
 * - pages/PlantSelection.tsx - for displaying selected plants summary
 */

import { Button } from "../../shared/Button/Button";
import { SelectedPlantsList } from "../../shared/SelectedPlantsList/SelectedPlantsList";
import type { Plant } from "../../../models/Plant";
import type { Recommendation } from "../../../reducers/planReducer";
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
  recommendations?: Recommendation[];
  harvestDateIso?: string | null;
};

export const PlantsSelectedSummary = ({
  selectedPlants,
  selectedCount,
  onClear,
  onContinue,
  onOpenDetails,
  onRemove,
  canContinue,
  recommendations,
  harvestDateIso,
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
            recommendations={recommendations}
            harvestDateIso={harvestDateIso}
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


