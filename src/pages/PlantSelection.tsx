import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Panel } from "../components/Panel/Panel";
import { PlantsCategoryButtons } from "../components/PlantsCategoryButtons/PlantsCategoryButtons";
import { ModalPlantDetails } from "../components/ModalPlantDetails/ModalPlantDetails";
import { PlantsList } from "../components/PlantsList/PlantsList";
import { PlantsSearch } from "../components/PlantsSearch/PlantsSearch";
import { PlantsSelectedSummary } from "../components/PlantsSelectedSummary/PlantsSelectedSummary";
import { PlanContext } from "../context/PlanContext";
import type { Plant } from "../models/Plant";
import { getPlants } from "../services/plantsService";
import { sortPlantsBySubcategoryAndName } from "../helpers/utils/sorting";
import { capitalizeFirst } from "../helpers/utils/text";
import { usePlantSelectionToasts } from "../hooks/usePlantSelectionToasts";
import "./PlantSelection.scss";

/**
 * PlantSelection component - allows users to browse and select plants.
 * 
 * Uses custom hook:
 * - usePlantSelectionToasts (src/hooks/usePlantSelectionToasts.ts)
 *   Handles toast notifications when plants are added/removed from selection.
 *   Provides skipToast() function to suppress toast when user manually removes a plant.
 */
export const PlantSelection = () => {
  const navigate = useNavigate();
  const { state, actions } = useContext(PlanContext);

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPlantForModal, setSelectedPlantForModal] = useState<Plant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { skipToast } = usePlantSelectionToasts(state.selectedPlantIds, plants);

  useEffect(() => {
    const load = async () => {
      const loadedPlants = await getPlants();
      setPlants(loadedPlants);
      setIsLoading(false);
    };

    void load();
  }, []);

  const selectedPlants = useMemo(() => {
    if (state.selectedPlantIds.length === 0) return [];
    const selectedSet = new Set(state.selectedPlantIds);
    const filtered = plants.filter((plant) => selectedSet.has(plant.id));
    return sortPlantsBySubcategoryAndName(filtered);
  }, [plants, state.selectedPlantIds]);

  const subcategoryOptions = useMemo(() => {
    const unique = new Set<string>();
    plants.forEach((plant) => {
      if (plant.subcategory.trim().length > 0) unique.add(plant.subcategory);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "sv"));
  }, [plants]);

  const typeOptions = useMemo(() => {
    if (!selectedSubcategory) return [];
    const unique = new Set<string>();
    plants
      .filter((plant) => plant.subcategory === selectedSubcategory)
      .forEach((plant) => {
        if (plant.type.trim().length > 0) unique.add(plant.type);
      });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, "sv"));
  }, [plants, selectedSubcategory]);

  const afterFilter = useMemo(() => {
    let result = plants;

    if (selectedSubcategory) {
      result = result.filter((plant) => plant.subcategory === selectedSubcategory);
    }

    if (selectedType) {
      result = result.filter((plant) => plant.type === selectedType);
    }

    return result;
  }, [plants, selectedSubcategory, selectedType]);

  const filteredPlants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = plants;
    
    if (query.length > 0) {
      // When searching, search in all plants regardless of category filter
      result = plants.filter(
        (plant) =>
          plant.name.toLowerCase().includes(query) ||
          plant.subcategory.toLowerCase().includes(query) ||
          plant.type.toLowerCase().includes(query)
      );
    } else {
      // When not searching, use category filters
      result = afterFilter;
    }
    
    // Apply type filter if selected (when not searching)
    if (selectedType && query.length === 0) {
      result = result.filter((plant) => plant.type === selectedType);
    }
    
    return sortPlantsBySubcategoryAndName(result);
  }, [plants, afterFilter, searchQuery, selectedType]);

  const handleSubcategorySelect = (subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
    setSelectedType(null); // Reset type when subcategory changes
  };

  const handleTypeSelect = (type: string | null) => {
    setSelectedType(type);
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
    setSelectedType(null);
  };

  const handleOpenDetails = (plant: Plant) => {
    setSelectedPlantForModal(plant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlantForModal(null);
  };

  return (
    <section>
      <h1>Fröbanken</h1>

      <Panel title="Välj dina fröer">
        <p>
          Börja din odlingsresa här!
          <br />
          Sök reda på vad du vill odla och lägg till det ur fröbanken.
        </p>

      <h3 className="plant-selection__subheading">
        Fröer att välja bland
      </h3>
      <PlantsSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
        <p>Annars kan du välja bland kategorierna här</p>
        {isLoading ? (
          <p>Laddar kategorier...</p>
        ) : selectedSubcategory ? (
          <PlantsCategoryButtons
            options={typeOptions}
            selectedValue={selectedType}
            onSelect={handleTypeSelect}
            showBackButton={true}
            onBack={handleBackToSubcategories}
          />
        ) : (
          <PlantsCategoryButtons
            options={subcategoryOptions}
            selectedValue={selectedSubcategory}
            onSelect={handleSubcategorySelect}
          />
        )}
      </Panel>

      {(selectedSubcategory || searchQuery.trim().length > 0) && (
        <Panel 
          title={selectedSubcategory ? `Välj bland ${capitalizeFirst(selectedSubcategory)}` : "Sökresultat"}
          titleHeadingLevel="h3"
        >
          {filteredPlants.length === 0 ? (
            <p>Inga fröer hittades.</p>
          ) : (
            <PlantsList
              plants={filteredPlants}
              selectedPlantIds={state.selectedPlantIds}
              onToggleSelected={actions.toggleSelectedPlant}
              onOpenDetails={handleOpenDetails}
            />
          )}
        </Panel>
      )}

      <Panel title={`Valda fröer (${state.selectedPlantIds.length})`}>
        <PlantsSelectedSummary
          selectedPlants={selectedPlants}
          selectedCount={state.selectedPlantIds.length}
          canContinue={state.selectedPlantIds.length > 0}
          onClear={actions.clearSelection}
          onContinue={() => navigate("/planner")}
          onOpenDetails={handleOpenDetails}
          onRemove={(plantId) => {
            skipToast();
            actions.toggleSelectedPlant(plantId);
          }}
        />
      </Panel>

      <ModalPlantDetails
        isOpen={isModalOpen}
        plant={selectedPlantForModal}
        onClose={handleCloseModal}
      />
    </section>
  );
};
