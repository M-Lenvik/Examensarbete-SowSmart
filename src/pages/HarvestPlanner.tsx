import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FilterDropdown } from "../components/FilterDropdown/FilterDropdown";
import { Panel } from "../components/Panel/Panel";
import { PlannerCalculateButton } from "../components/PlannerCalculateButton/PlannerCalculateButton";
import { PlannerDateInput } from "../components/PlannerDateInput/PlannerDateInput";
import { PlannerSelectedPlants } from "../components/PlannerSelectedPlants/PlannerSelectedPlants";
import { PlantsDetailModal } from "../components/PlantsDetailModal/PlantsDetailModal";
import { PlanContext } from "../context/PlanContext";
import { validateHarvestDate, getPlantSowResult, type PlantSowResult } from "../helpers/date/dateValidation";
import { generateRecommendations } from "../helpers/calculation/recommendations";
import { calculatePlantMessagesFromHarvestDates } from "../helpers/date/plantMessages";
import { sortPlantsBySubcategoryAndName } from "../helpers/utils/sorting";
import type { Plant } from "../models/Plant";
import { getPlants } from "../services/plantsService";

export const HarvestPlanner = () => {
  const navigate = useNavigate();
  const { state, actions } = useContext(PlanContext);

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateInputValue, setDateInputValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedPlantForModal, setSelectedPlantForModal] = useState<Plant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedFilterIds, setSelectedFilterIds] = useState<string[]>([]);
  const [harvestDatesByFilter, setHarvestDatesByFilter] = useState<Map<string, string>>(new Map());

  // Load all plants
  useEffect(() => {
    const load = async () => {
      const loadedPlants = await getPlants();
      setPlants(loadedPlants);
      setIsLoading(false);
    };

    void load();
  }, []);


  // Update date input when filter selection changes
  useEffect(() => {
    let dateToShow = "";

    if (selectedFilterIds.length === 0 || selectedFilterIds.includes("all")) {
      // No filter or "all" selected - show global date
      dateToShow = state.harvestDateIso || "";
    } else if (selectedFilterIds.length === 1) {
      // Single filter selected - show its saved date
      const filterId = selectedFilterIds[0];
      dateToShow = harvestDatesByFilter.get(filterId) || "";
    } else {
      // Multiple filters selected - show date only if all have the same date
      const dates = selectedFilterIds
        .map((id) => harvestDatesByFilter.get(id))
        .filter((date): date is string => Boolean(date));
      
      if (dates.length > 0 && dates.every((date) => date === dates[0])) {
        dateToShow = dates[0];
      }
    }

    setDateInputValue(dateToShow);
    
    // Validate the date if one is shown
    if (dateToShow) {
      const validation = validateHarvestDate(dateToShow, null);
      setValidationError(validation.error);
    } else {
      setValidationError(null);
    }
  }, [selectedFilterIds, harvestDatesByFilter, state.harvestDateIso]);

  // Filter and sort selected plants
  const selectedPlants = useMemo(() => {
    if (state.selectedPlantIds.length === 0) return [];
    const selectedSet = new Set(state.selectedPlantIds);
    const filtered = plants.filter((plant) => selectedSet.has(plant.id));
    return sortPlantsBySubcategoryAndName(filtered);
  }, [plants, state.selectedPlantIds]);

  // Get harvest date for a plant
  // Priority: individual plant filter → subcategory filter → global date
  const getHarvestDate = (plant: Plant): string | null => {
    const plantFilterId = `plant-${plant.id}`;
    const subcategory = plant.subcategory || "Övrigt";
    const subcategoryFilterId = `subcategory-${subcategory}`;
    
    return (
      harvestDatesByFilter.get(plantFilterId) ||
      harvestDatesByFilter.get(subcategoryFilterId) ||
      state.harvestDateIso ||
      null
    );
  };

  // Create map showing harvest date for each plant
  // Use dates from recommendations if available (most accurate), otherwise use saved filter dates
  const harvestDatesByPlant = useMemo(() => {
    const datesMap = new Map<number, string>();

    // If recommendations exist, use their harvest dates (most accurate)
    if (state.recommendations.length > 0) {
      for (const recommendation of state.recommendations) {
        if (recommendation.harvestDateIso) {
          datesMap.set(recommendation.plantId, recommendation.harvestDateIso);
        }
      }
    } else {
      // No recommendations yet - get dates from filters or global date
      for (const plant of selectedPlants) {
        const harvestDate = getHarvestDate(plant);
        if (harvestDate) {
          datesMap.set(plant.id, harvestDate);
        }
      }
    }

    return datesMap;
  }, [selectedPlants, harvestDatesByFilter, state.harvestDateIso, state.recommendations]);

  // Calculate sow date messages for each plant
  // Use recommendations if available, otherwise calculate from harvest dates
  const plantMessages = useMemo(() => {
    if (selectedPlants.length === 0) {
      return new Map<number, PlantSowResult>();
    }

    const results = new Map<number, PlantSowResult>();

    // If recommendations exist, show sow dates from them (giltigt datum)
    if (state.recommendations.length > 0) {
      const recommendationMap = new Map(state.recommendations.map((rec) => [rec.plantId, rec]));
      
      for (const plant of selectedPlants) {
        const recommendation = recommendationMap.get(plant.id);
        if (recommendation) {
          const sowDate = recommendation.indoorSowDate || recommendation.outdoorSowDate;
          if (sowDate) {
            results.set(plant.id, {
              key: "harvestDate",
              message: `Sås på ${sowDate}`,
              sowDateIso: sowDate,
            });
          }
        }
      }
    } else {
      // No recommendations yet - calculate messages from harvest dates
      const harvestDatesMap = new Map<number, string>();
      for (const plant of selectedPlants) {
        const harvestDate = getHarvestDate(plant);
        if (harvestDate) {
          harvestDatesMap.set(plant.id, harvestDate);
        }
      }
      return calculatePlantMessagesFromHarvestDates(harvestDatesMap, selectedPlants);
    }

    return results;
  }, [selectedPlants, state.recommendations, harvestDatesByFilter, state.harvestDateIso]);


  // Handle date input change and validate
  const handleDateChange = (value: string) => {
    setDateInputValue(value);
    
    // Validate basic rules (required, not in past)
    const validation = validateHarvestDate(value, null);
    setValidationError(validation.error);
    
    // Save date for selected filter(s)
    if (validation.isValid) {
      const newHarvestDates = new Map(harvestDatesByFilter);
      
      if (selectedFilterIds.length === 0) {
        // No filter selected, update global date
        actions.setHarvestDateIso(value);
      } else {
        // Save date for each selected filter
        selectedFilterIds.forEach((filterId) => {
          if (filterId !== "all") {
            newHarvestDates.set(filterId, value);
          }
        });
        setHarvestDatesByFilter(newHarvestDates);
        
        // Also update global date if "all" is selected
        if (selectedFilterIds.includes("all")) {
          actions.setHarvestDateIso(value);
        } else {
          // If no global date exists, set it as fallback for plants without filters
          if (!state.harvestDateIso) {
            actions.setHarvestDateIso(value);
          }
        }
      }
      
      // Clear old recommendations if date changed
      if (state.recommendations.length > 0) {
        actions.setRecommendations([]);
      }
    } else {
      // Clear dates for selected filters if invalid
      if (selectedFilterIds.length > 0) {
        const newHarvestDates = new Map(harvestDatesByFilter);
        selectedFilterIds.forEach((filterId) => {
          if (filterId !== "all") {
            newHarvestDates.delete(filterId);
          }
        });
        setHarvestDatesByFilter(newHarvestDates);
      }
      
      // Don't clear global date if invalid - keep it for plants without filters
      // Only clear if no filters are selected
      if (selectedFilterIds.length === 0) {
        actions.setHarvestDateIso(null);
      }
      if (state.recommendations.length > 0) {
        actions.setRecommendations([]);
      }
    }
  };

  // Get reason why calculate button is disabled (returns null if enabled)
  const getDisabledReason = useMemo((): string | null => {
    if (state.selectedPlantIds.length === 0) {
      return "Du har inte valt några fröer ännu.";
    }

    // Check for missing harvest dates
    const plantsWithoutDate: string[] = [];
    const plantsTooClose: string[] = [];

    for (const plant of selectedPlants) {
      const harvestDate = getHarvestDate(plant);
      if (!harvestDate) {
        plantsWithoutDate.push(plant.name);
        continue;
      }

      // Check if harvest date is too close in time (harvestToClose)
      try {
        const sowResult = getPlantSowResult(harvestDate, plant);
        if (sowResult?.key === "harvestToClose") {
          plantsTooClose.push(plant.name);
        }
      } catch {
        // If validation fails, allow button to be enabled (will show error on click)
      }
    }

    if (plantsTooClose.length > 0) {
      if (plantsTooClose.length === 1) {
        return `Skördedatumet för ${plantsTooClose[0]} ligger för nära i tid. Välj ett senare datum.`;
      }
      return `Skördedatum för ${plantsTooClose.length} fröer ligger för nära i tid. Välj senare datum.`;
    }

    if (plantsWithoutDate.length > 0) {
      if (plantsWithoutDate.length === 1) {
        return `Välj skördedatum för ${plantsWithoutDate[0]}.`;
      }
      return `Välj skördedatum för ${plantsWithoutDate.length} fröer.`;
    }

    return null;
  }, [state.selectedPlantIds.length, selectedPlants, harvestDatesByFilter, state.harvestDateIso]);

  // Check if calculate button should be disabled
  const isCalculateDisabled = useMemo(() => {
    return getDisabledReason !== null;
  }, [getDisabledReason]);

  // Handle opening plant detail modal
  const handleOpenDetails = (plant: Plant) => {
    setSelectedPlantForModal(plant);
    setIsModalOpen(true);
  };

  // Handle closing plant detail modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlantForModal(null);
  };


  // Handle calculate button click
  const handleCalculate = () => {
    // Validate that all selected plants have harvest dates
    const missingDates: string[] = [];

    for (const plant of selectedPlants) {
      const harvestDate = getHarvestDate(plant);
      if (!harvestDate) {
        missingDates.push(plant.name);
      }
    }

    if (missingDates.length > 0) {
      setValidationError(`Välj skördedatum för: ${missingDates.join(", ")}`);
      return;
    }

    setIsCalculating(true);

    try {
      // Generate recommendations for each plant with its specific harvest date
      const recommendations = selectedPlants.flatMap((plant) => {
        const harvestDate = getHarvestDate(plant);
        if (!harvestDate) return [];
        return generateRecommendations([plant], harvestDate);
      });

      // Save recommendations to context
      // Also save first date as global date (for backward compatibility)
      if (selectedPlants.length > 0) {
        const firstDate = getHarvestDate(selectedPlants[0]) || dateInputValue;
        if (firstDate) {
          actions.setHarvestDateIso(firstDate);
        }
      }

      actions.setRecommendations(recommendations);
      navigate("/calendar");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setValidationError("Ett fel uppstod vid beräkning av rekommendationer");
    } finally {
      setIsCalculating(false);
    }
  };

  // Show message if no plants selected
  if (isLoading) {
    return (
      <section>
        <h1>Planeraren</h1>
        <p>Laddar...</p>
      </section>
    );
  }

  if (state.selectedPlantIds.length === 0) {
    return (
      <section>
        <h1>Planeraren</h1>
        <Panel>
          <p>Du har inte valt några fröer ännu.</p>
          <p>
            <Link to="/plants">Gå till fröbanken för att välja fröer</Link>
          </p>
        </Panel>
      </section>
    );
  }

  return (
    <section>
      <h1>Planeraren</h1>
      <Panel title="Välj skördedatum">
        <p>Här väljer du ditt önskade skördedatum och beräknar din personliga odlingsplan. Om du vill kan du välja olika datum för olika fröer, eller välja samma datum för samtliga. Förvalt är samma datum för samtliga fröer.</p>
        <FilterDropdown
          selectedPlantIds={state.selectedPlantIds}
          plants={plants}
          selectedFilterIds={selectedFilterIds}
          onFilterChange={setSelectedFilterIds}
        />
        <PlannerDateInput
          value={dateInputValue}
          onChange={handleDateChange}
          error={validationError}
          warning={null}
          required={true}
        />
      </Panel>
      <PlannerSelectedPlants
        selectedPlants={selectedPlants}
        plantMessages={plantMessages}
        onOpenDetails={handleOpenDetails}
        onRemove={actions.toggleSelectedPlant}
        harvestDatesByPlant={harvestDatesByPlant}
        recommendations={state.recommendations}
        harvestDateIso={state.harvestDateIso}
      />
      <PlannerCalculateButton
        onCalculate={handleCalculate}
        disabled={isCalculateDisabled}
        isLoading={isCalculating}
        hasHarvestDate={!!dateInputValue && validationError === null}
        disabledReason={getDisabledReason}
      />
      <PlantsDetailModal
        plant={selectedPlantForModal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

