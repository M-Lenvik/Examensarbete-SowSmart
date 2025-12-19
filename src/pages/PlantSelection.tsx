import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button/Button";
import { Panel } from "../components/Panel/Panel";
import { PlanContext } from "../context/PlanContext";
import type { Plant } from "../models/Plant";
import { getPlants } from "../services/plantsService";

export const PlantSelection = () => {
  const navigate = useNavigate();
  const { state, actions } = useContext(PlanContext);

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <section>
      <h1>Fröbanken</h1>

      <Panel title="Välj dina fröer">
        {isLoading ? (
          <p>Laddar fröer...</p>
        ) : plants.length === 0 ? (
          <p>Inga fröer hittades.</p>
        ) : (
          <ul>
            {plants.map((plant) => {
              const isSelected = state.selectedPlantIds.includes(plant.id);

              return (
                <li key={plant.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => actions.toggleSelectedPlant(plant.id)}
                    />
                    {plant.name}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel title={`Valda fröer (${state.selectedPlantIds.length})`}>
        {state.selectedPlantIds.length === 0 ? (
          <p>Du har inte valt några fröer än.</p>
        ) : (
          <>
            <ul>
              {selectedPlants.map((plant) => (
                <li key={plant.id}>{plant.name}</li>
              ))}
            </ul>
            <Button variant="secondary" onClick={actions.clearSelection}>
              Rensa val
            </Button>
          </>
        )}

        <Button
          disabled={state.selectedPlantIds.length === 0}
          onClick={() => navigate("/planner")}
        >
          Till planeraren
        </Button>
      </Panel>
    </section>
  );
};
