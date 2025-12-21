import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Panel } from "../components/Panel/Panel";
import { PlantsList } from "../components/PlantsList/PlantsList";
import { PlantsSearch } from "../components/PlantsSearch/PlantsSearch";
import { PlantsSelectedSummary } from "../components/PlantsSelectedSummary/PlantsSelectedSummary";
import { PlanContext } from "../context/PlanContext";
import type { Plant } from "../models/Plant";
import { getPlants } from "../services/plantsService";

export const PlantSelection = () => {
  const navigate = useNavigate();
  const { state, actions } = useContext(PlanContext);

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
    return plants.filter((plant) => selectedSet.has(plant.id));
  }, [plants, state.selectedPlantIds]);

  const filteredPlants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) return plants;
    return plants.filter((plant) => plant.name.toLowerCase().includes(query));
  }, [plants, searchQuery]);

  return (
    <section>
      <h1>Fröbanken</h1>

      <Panel title="Sök">
        <PlantsSearch searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
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
        />
      </Panel>
    </section>
  );
};
