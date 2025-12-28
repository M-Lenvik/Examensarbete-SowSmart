import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Panel } from "../components/Panel/Panel";
import { PlantsDetailModal } from "../components/PlantsDetailModal/PlantsDetailModal";
import { PlantsList } from "../components/PlantsList/PlantsList";
import { PlantsSearch } from "../components/PlantsSearch/PlantsSearch";
import { PlantsSelectedSummary } from "../components/PlantsSelectedSummary/PlantsSelectedSummary";
import { PlantsSubcategoryFilter } from "../components/PlantsSubcategoryFilter/PlantsSubcategoryFilter";
import { PlanContext } from "../context/PlanContext";
import type { Plant } from "../models/Plant";
import { getPlants } from "../services/plantsService";
import { sortPlantsBySubcategoryAndName } from "../helpers/utils/sorting";

export const PlantSelection = () => {
  const navigate = useNavigate();
  const { state, actions } = useContext(PlanContext);

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [selectedPlantForModal, setSelectedPlantForModal] = useState<Plant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const afterFilter = useMemo(() => {
    if (subcategoryFilter === "all") return plants;
    return plants.filter((plant) => plant.subcategory === subcategoryFilter);
  }, [plants, subcategoryFilter]);

  const filteredPlants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = afterFilter;
    
    if (query.length > 0) {
      result = afterFilter.filter(
        (plant) =>
          plant.name.toLowerCase().includes(query) ||
          plant.subcategory.toLowerCase().includes(query)
      );
    }
    
    return sortPlantsBySubcategoryAndName(result);
  }, [afterFilter, searchQuery]);

  const subcategoryOptions = useMemo(() => {
    const unique = new Set<string>();
    plants.forEach((plant) => {
      if (plant.subcategory.trim().length > 0) unique.add(plant.subcategory);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [plants]);

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

      <Panel title="Sök">
        <PlantsSubcategoryFilter
          options={subcategoryOptions}
          value={subcategoryFilter}
          onChange={setSubcategoryFilter}
        />
        <PlantsSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </Panel>

      <Panel title="Välj dina fröer">
        {isLoading ? (
          <p>Laddar fröer...</p>
        ) : filteredPlants.length === 0 ? (
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

      <Panel title={`Valda fröer (${state.selectedPlantIds.length})`}>
        <PlantsSelectedSummary
          selectedPlants={selectedPlants}
          selectedCount={state.selectedPlantIds.length}
          canContinue={state.selectedPlantIds.length > 0}
          onClear={actions.clearSelection}
          onContinue={() => navigate("/planner")}
          onOpenDetails={handleOpenDetails}
          onRemove={actions.toggleSelectedPlant}
        />
      </Panel>

      <PlantsDetailModal
        isOpen={isModalOpen}
        plant={selectedPlantForModal}
        onClose={handleCloseModal}
      />
    </section>
  );
};
