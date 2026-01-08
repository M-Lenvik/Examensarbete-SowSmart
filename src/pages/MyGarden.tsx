import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { MyGardenSelectedPlants } from "../components/MyGardenSelectedPlants/MyGardenSelectedPlants";
import { MyGardenTaskList } from "../components/MyGardenTaskList/MyGardenTaskList";
import { Panel } from "../components/Panel/Panel";
import { PlantsDetailModal } from "../components/PlantsDetailModal/PlantsDetailModal";
import { PlanContext } from "../context/PlanContext";
import { recommendationsToTasks } from "../helpers/calendar/tasks";
import { getPlantWarnings } from "../helpers/validation/warnings";
import { sortPlantsBySubcategoryAndName } from "../helpers/utils/sorting";
import type { Plant } from "../models/Plant";
import { getPlants } from "../services/plantsService";

export const MyGarden = () => {
  const { state, actions } = useContext(PlanContext);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlantForModal, setSelectedPlantForModal] = useState<Plant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load all plants
  useEffect(() => {
    const load = async () => {
      const loadedPlants = await getPlants();
      setPlants(loadedPlants);
      setIsLoading(false);
    };

    void load();
  }, []);

  // Filter and sort selected plants
  const selectedPlants = useMemo(() => {
    if (state.selectedPlantIds.length === 0) return [];
    const selectedSet = new Set(state.selectedPlantIds);
    const filtered = plants.filter((plant) => selectedSet.has(plant.id));
    return sortPlantsBySubcategoryAndName(filtered);
  }, [plants, state.selectedPlantIds]);

  // Convert recommendations to tasks
  const tasks = useMemo(() => {
    if (state.recommendations.length === 0 || !state.harvestDateIso) {
      return [];
    }
    return recommendationsToTasks(state.recommendations, plants, state.harvestDateIso);
  }, [state.recommendations, state.harvestDateIso, plants]);

  // Calculate warnings for all recommendations
  const warnings = useMemo(() => {
    if (state.recommendations.length === 0) {
      return [];
    }
    const allWarnings: ReturnType<typeof getPlantWarnings> = [];
    const plantMap = new Map(plants.map((plant) => [plant.id, plant]));

    for (const recommendation of state.recommendations) {
      const plant = plantMap.get(recommendation.plantId);
      if (plant) {
        const plantWarnings = getPlantWarnings(recommendation, plant, state.harvestDateIso);
        allWarnings.push(...plantWarnings);
      }
    }

    return allWarnings;
  }, [state.recommendations, state.harvestDateIso, plants]);

  const handleOpenDetails = (plant: Plant) => {
    setSelectedPlantForModal(plant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlantForModal(null);
  };

  if (isLoading) {
    return (
      <section>
        <h1>Min Trädgård</h1>
        <p>Laddar...</p>
      </section>
    );
  }

  // Show message if no plants selected
  if (state.selectedPlantIds.length === 0) {
    return (
      <section>
        <h1>Min Trädgård</h1>
        <Panel title="Valda frön">
          <p>
            Inga frön valda än.{" "}
            <Link to="/plants">Gå till fröbanken</Link> för att välja frön.
          </p>
        </Panel>
      </section>
    );
  }

  // Show message if no harvest date
  if (!state.harvestDateIso) {
    return (
      <section>
        <h1>Min Trädgård</h1>
        <Panel title="Valda frön">
          <MyGardenSelectedPlants
            selectedPlants={selectedPlants}
            onRemovePlant={actions.toggleSelectedPlant}
            onPlantClick={handleOpenDetails}
          />
        </Panel>
        <Panel title="Händelser">
          <p>
            Ingen skördedatum valt.{" "}
            <Link to="/planner">Gå till planeraren</Link> för att välja datum och beräkna plan.
          </p>
        </Panel>
        <PlantsDetailModal
          isOpen={isModalOpen}
          plant={selectedPlantForModal}
          onClose={handleCloseModal}
        />
      </section>
    );
  }

  // Show message if no recommendations
  if (state.recommendations.length === 0) {
    return (
      <section>
        <h1>Min Trädgård</h1>
        <Panel title="Valda frön">
          <MyGardenSelectedPlants
            selectedPlants={selectedPlants}
            onRemovePlant={actions.toggleSelectedPlant}
            onPlantClick={handleOpenDetails}
          />
        </Panel>
        <Panel title="Händelser">
          <p>
            Ingen plan beräknad än.{" "}
            <Link to="/planner">Gå till planeraren</Link> för att beräkna plan.
          </p>
        </Panel>
        <PlantsDetailModal
          isOpen={isModalOpen}
          plant={selectedPlantForModal}
          onClose={handleCloseModal}
        />
      </section>
    );
  }

  return (
    <section>
      <h1>Min Trädgård</h1>
      <Panel title="Valda frön">
        <MyGardenSelectedPlants
          selectedPlants={selectedPlants}
          onRemovePlant={actions.toggleSelectedPlant}
          onPlantClick={handleOpenDetails}
        />
      </Panel>
      <Panel title="Händelser">
        <MyGardenTaskList tasks={tasks} warnings={warnings} />
      </Panel>
      <PlantsDetailModal
        isOpen={isModalOpen}
        plant={selectedPlantForModal}
        onClose={handleCloseModal}
      />
    </section>
  );
};


