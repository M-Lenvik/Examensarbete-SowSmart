/**
 * MyGarden page component - displays full plan overview with tasks and warnings.
 * 
 * Data sources:
 * - plants: From plantsService (all available plants)
 * - state: From PlanContext (selected plants, recommendations)
 * 
 * Results:
 * - Returns: JSX (garden overview page with selected plants and task list)
 * 
 * Uses:
 * - context/PlanContext.tsx (PlanContext)
 * - services/plantsService.ts (getPlants)
 * - helpers/calendar/tasks.ts (recommendationsToTasks)
 * - helpers/validation/warnings.ts (getPlantWarnings)
 * - helpers/date/plantMessages.ts (calculatePlantMessagesFromRecommendations)
 * - helpers/utils/sorting.ts (sortPlantsBySubcategoryAndName)
 * - components/myGarden/* (MyGardenSelectedPlants, MyGardenTaskList)
 * - components/shared/* (Panel, ModalPlantDetails)
 * 
 * Used by:
 * - Router.tsx - for "/my-garden" route
 */

import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { MyGardenSelectedPlants } from "../components/myGarden/MyGardenSelectedPlants/MyGardenSelectedPlants";
import { MyGardenTaskList } from "../components/myGarden/MyGardenTaskList/MyGardenTaskList";
import { Panel } from "../components/shared/Panel/Panel";
import { ModalPlantDetails } from "../components/Modal/ModalPlantDetails/ModalPlantDetails";
import { PlanContext } from "../context/PlanContext";
import { recommendationsToTasks } from "../helpers/calendar/tasks";
import { getPlantWarnings } from "../helpers/validation/warnings";
import { calculatePlantMessagesFromRecommendations } from "../helpers/date/plantMessages";
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
    if (state.recommendations.length === 0) {
      return [];
    }
    return recommendationsToTasks(state.recommendations, plants);
  }, [state.recommendations, plants]);

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
        const plantWarnings = getPlantWarnings(recommendation, plant);
        allWarnings.push(...plantWarnings);
      }
    }

    return allWarnings;
  }, [state.recommendations, plants]);

  // Calculate plantMessages from recommendations harvest dates
  const plantMessages = useMemo(() => {
    return calculatePlantMessagesFromRecommendations(state.recommendations, plants);
  }, [state.recommendations, plants]);

  const handleOpenDetails = (plant: Plant) => {
    setSelectedPlantForModal(plant);
    setIsModalOpen(true);
  };

  const handleOpenDetailsById = (plantId: number) => {
    const plant = plants.find((p) => p.id === plantId);
    if (plant) {
      handleOpenDetails(plant);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlantForModal(null);
  };

  if (isLoading) {
    return (
      <section>
        <h1>Min frösida</h1>
        <p>Laddar...</p>
      </section>
    );
  }

  // Show message if no plants selected
  if (state.selectedPlantIds.length === 0) {
    return (
      <section>
        <h1>Min frösida</h1>
        <Panel title="Valda frön">
        <p>Du har inte valt några fröer ännu.</p>
          <p>
            <Link to="/plants">Gå till fröbanken för att välja fröer.</Link>
          </p>
        </Panel>
      </section>
    );
  }

  // Show message if no recommendations
  if (state.recommendations.length === 0) {
    return (
      <section>
        <h1>Min frösida</h1>
        <Panel title="Valda frön">
          <MyGardenSelectedPlants
            selectedPlants={selectedPlants}
            onRemovePlant={actions.toggleSelectedPlant}
            onPlantClick={handleOpenDetails}
            recommendations={state.recommendations}
            harvestDateIso={null}
            plantMessages={plantMessages}
          />
        </Panel>
        <Panel title="Min odlingsplan">
          <p>
            Du har inte valt skördedatum ännu. </p>
          <p>
            <Link to="/planner">Gå till planeraren</Link> för att välja skördedatum och beräkna plan.
          </p>
        </Panel>
        <ModalPlantDetails
          isOpen={isModalOpen}
          plant={selectedPlantForModal}
          onClose={handleCloseModal}
        />
      </section>
    );
  }

  return (
    <section>
      <h1>Min frösida</h1>
      <Panel>
        <MyGardenSelectedPlants
          selectedPlants={selectedPlants}
          onRemovePlant={actions.toggleSelectedPlant}
          onPlantClick={handleOpenDetails}
          recommendations={state.recommendations}
          harvestDateIso={state.harvestDateIso}
          plantMessages={plantMessages}
        />
      </Panel>
      <Panel title="Min odlingsplan" collapsible defaultExpanded={true}>
        <MyGardenTaskList tasks={tasks} warnings={warnings} onPlantClick={handleOpenDetailsById} />
      </Panel>
      <ModalPlantDetails
        isOpen={isModalOpen}
        plant={selectedPlantForModal}
        onClose={handleCloseModal}
      />
    </section>
  );
};


