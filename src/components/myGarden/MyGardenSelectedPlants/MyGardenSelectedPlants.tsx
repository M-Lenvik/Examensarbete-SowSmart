/**
 * MyGardenSelectedPlants component - displays selected plants in My Garden page.
 * 
 * Data sources:
 * - Props: selectedPlants, recommendations, harvestDateIso, plantMessages
 * 
 * Results:
 * - Returns: JSX (collapsible section with selected plants list)
 * 
 * Uses:
 * - components/shared/CollapsibleSection/CollapsibleSection.tsx (CollapsibleSection)
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx (SelectedPlantsList)
 * - react-router-dom (Link)
 * 
 * Used by:
 * - pages/MyGarden.tsx - for displaying selected plants
 */

import { Link } from "react-router-dom";

import { CollapsibleSection } from "../../shared/CollapsibleSection/CollapsibleSection";
import { SelectedPlantsList } from "../../shared/SelectedPlantsList/SelectedPlantsList";
import type { Plant } from "../../../models/Plant";
import type { Recommendation } from "../../../reducers/planReducer";
import type { PlantSowResult } from "../../../helpers/date/dateValidation";
import "./MyGardenSelectedPlants.scss";

type MyGardenSelectedPlantsProps = {
  selectedPlants: Plant[];
  onRemovePlant: (plantId: number) => void;
  onPlantClick: (plant: Plant) => void;
  recommendations?: Recommendation[];
  harvestDateIso?: string | null;
  plantMessages?: Map<number, PlantSowResult>;
};

export const MyGardenSelectedPlants = ({
  selectedPlants,
  onRemovePlant,
  onPlantClick,
  recommendations,
  harvestDateIso,
  plantMessages,
}: MyGardenSelectedPlantsProps) => {
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
      <CollapsibleSection
        title={`Mina valda fröer (${selectedPlants.length})`}
        defaultExpanded={false}
        ariaLabel={`Visa Mina valda fröer`}
      >
        <SelectedPlantsList
          selectedPlants={selectedPlants}
          onOpenDetails={onPlantClick}
          onRemove={onRemovePlant}
          recommendations={recommendations}
          harvestDateIso={harvestDateIso}
          plantMessages={plantMessages}
          showWarningsInline={true}
          interactiveIcons={true}
        />
      </CollapsibleSection>
    </div>
  );
};

