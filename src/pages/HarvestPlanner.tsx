import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FilterDropdown } from "../components/FilterDropdown/FilterDropdown";
import { Panel } from "../components/Panel/Panel";
import { PlannerCalculateButton } from "../components/PlannerCalculateButton/PlannerCalculateButton";
import { PlannerDateInput } from "../components/PlannerDateInput/PlannerDateInput";
import { PlannerSelectedPlants } from "../components/PlannerSelectedPlants/PlannerSelectedPlants";
import { ModalPlantDetails } from "../components/ModalPlantDetails/ModalPlantDetails";
import { ConfirmDialog } from "../components/ConfirmDialog/ConfirmDialog";
import { PlanContext } from "../context/PlanContext";
import { validateHarvestDate, getPlantSowResult, type PlantSowResult } from "../helpers/date/dateValidation";
import { generateRecommendations } from "../helpers/calculation/recommendations";
import { calculatePlantMessagesFromHarvestDates } from "../helpers/date/plantMessages";
import { formatDateSwedish } from "../helpers/date/date";
import { loadHarvestDatesByFilterFromLocalStorage, saveHarvestDatesByFilterToLocalStorage } from "../helpers/storage/localStorage";
import { sortPlantsBySubcategoryAndName } from "../helpers/utils/sorting";
import { capitalizeFirst } from "../helpers/utils/text";
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userHasInteractedWithDate, setUserHasInteractedWithDate] = useState(false);
  const previousDateValueRef = useRef<string>("");
  const currentDateValueRef = useRef<string>("");
  const dateChangeTimeoutRef = useRef<number | null>(null);
  const [harvestDatesByFilter, setHarvestDatesByFilter] = useState<Map<string, string>>(() => {
    // Load harvest dates by filter from localStorage on mount
    return loadHarvestDatesByFilterFromLocalStorage();
  });

  // Load all plants
  useEffect(() => {
    const load = async () => {
      const loadedPlants = await getPlants();
      setPlants(loadedPlants);
      setIsLoading(false);
    };

    void load();
  }, []);

  // Save harvestDatesByFilter to localStorage whenever it changes
  useEffect(() => {
    saveHarvestDatesByFilterToLocalStorage(harvestDatesByFilter);
  }, [harvestDatesByFilter]);


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

  // Auto-open confirmation dialog when both date and filters are selected
  // Use longer delay to avoid triggering when user is just navigating in date picker
  useEffect(() => {
    if (
      userHasInteractedWithDate &&
      dateInputValue && 
      !validationError && 
      selectedFilterIds.length > 0 && 
      !showConfirmDialog
    ) {
      const validation = validateHarvestDate(dateInputValue, null);
      if (validation.isValid) {
        // Longer delay to allow date picker navigation (changing months) without triggering dialog
        const timer = setTimeout(() => {
          // Double-check that date hasn't changed during the delay (user might still be navigating)
          const currentValidation = validateHarvestDate(dateInputValue, null);
          if (currentValidation.isValid && !showConfirmDialog) {
            setShowConfirmDialog(true);
          }
        }, 100); // 0.5 seconds - total ~1 second after user selects date
        return () => clearTimeout(timer);
      }
    }
  }, [userHasInteractedWithDate, dateInputValue, validationError, selectedFilterIds, showConfirmDialog]);

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


  // Handle date input change - only validate, don't save yet
  // Use short debounce to filter out month navigation
  const handleDateChange = (value: string) => {
    setDateInputValue(value);
    currentDateValueRef.current = value; // Keep ref in sync with state
    
    // Validate basic rules (required, not in past)
    const validation = validateHarvestDate(value, null);
    setValidationError(validation.error);

    // Clear any existing timeout - this is key for filtering month navigation
    // Each month navigation triggers onChange, clearing the previous timeout
    if (dateChangeTimeoutRef.current) {
      clearTimeout(dateChangeTimeoutRef.current);
    }

    // Only mark as interacted if date actually changed to a new valid value
    if (value && value !== previousDateValueRef.current && validation.isValid) {
      const stableValue = value;
      
      // If user clicks month arrows, date changes rapidly and timeout keeps resetting
      // If user selects a date, no more changes happen and timeout fires after 1000ms
      dateChangeTimeoutRef.current = setTimeout(() => {
        if (currentDateValueRef.current === stableValue) {
          const currentValidation = validateHarvestDate(stableValue, null);
          if (currentValidation.isValid) {
            setUserHasInteractedWithDate(true);
            previousDateValueRef.current = stableValue;
          }
        }
      }, 1000);
    }
  };

  // Handle date input blur - mark interaction when user clicks outside
  // This provides faster feedback than waiting for timeout
  const handleDateBlur = () => {
    // Only mark as interacted if date actually changed to a new valid value
    const currentValue = currentDateValueRef.current;
    if (currentValue && currentValue !== previousDateValueRef.current) {
      const validation = validateHarvestDate(currentValue, null);
      if (validation.isValid) {
        // Clear any pending timeout since we're handling it here
        if (dateChangeTimeoutRef.current) {
          clearTimeout(dateChangeTimeoutRef.current);
          dateChangeTimeoutRef.current = null;
        }
        // Mark interaction immediately - date picker closed after date was selected
        setUserHasInteractedWithDate(true);
        previousDateValueRef.current = currentValue;
      }
    }
  };

  // Build confirmation message based on selected filters and date
  const getConfirmationMessage = (): string => {
    if (!dateInputValue) return "";
    
    const dateFormatted = formatDateSwedish(dateInputValue);
    
    if (selectedFilterIds.length === 0) {
      return `Du har valt att skörda alla dina fröer den ${dateFormatted}. Vill du lägga till detta i din plan?`;
    }
    
    if (selectedFilterIds.includes("all")) {
      return `Du har valt att skörda alla dina fröer den ${dateFormatted}. Vill du lägga till detta i din plan?`;
    }
    
    // Get selected plants/subcategories
    const plantsBySubcategory = new Map<string, string[]>();
    const selectedSubcategories = new Set<string>();
    
    selectedFilterIds.forEach((filterId) => {
      if (filterId.startsWith("plant-")) {
        const plantId = parseInt(filterId.replace("plant-", ""));
        const plant = plants.find((currentPlant) => currentPlant.id === plantId);
        if (plant) {
          const subcategory = plant.subcategory || "Övrigt";
          if (!plantsBySubcategory.has(subcategory)) {
            plantsBySubcategory.set(subcategory, []);
          }
          plantsBySubcategory.get(subcategory)!.push(plant.name);
        }
      } else if (filterId.startsWith("subcategory-")) {
        const subcategory = filterId.replace("subcategory-", "");
        selectedSubcategories.add(subcategory);
      }
    });
    
    // Build items list: subcategories without plants first, then grouped plants
    const items: string[] = [];
    
    // Add subcategories that don't have any individual plants selected
    const subcategoriesWithoutPlants = Array.from(selectedSubcategories).filter(
      (subcategory) => !plantsBySubcategory.has(subcategory)
    );
    if (subcategoriesWithoutPlants.length > 0) {
      items.push(...subcategoriesWithoutPlants.map((subcategory) => capitalizeFirst(subcategory)));
    }
    
    // Add plants grouped by subcategory
    const sortedSubcategories = Array.from(plantsBySubcategory.keys()).sort((subcategoryA, subcategoryB) => {
      if (subcategoryA === "Övrigt") return 1;
      if (subcategoryB === "Övrigt") return -1;
      return subcategoryA.localeCompare(subcategoryB, "sv");
    });
    
    sortedSubcategories.forEach((subcategory) => {
      const plantNames = plantsBySubcategory.get(subcategory)!;
      const capitalizedSubcategory = capitalizeFirst(subcategory);
      if (plantNames.length === 1) {
        items.push(`${capitalizedSubcategory}: ${plantNames[0]}`);
      } else {
        items.push(`${capitalizedSubcategory}: ${plantNames.join(", ")}`);
      }
    });
    
    if (items.length === 0) {
      return `Du har valt att skörda den ${dateFormatted}. Vill du lägga till detta i din plan?`;
    }
    
    let itemsText = "";
    if (items.length === 1) {
      itemsText = items[0];
    } else if (items.length === 2) {
      itemsText = `${items[0]} och ${items[1]}`;
    } else {
      itemsText = `${items.slice(0, -1).join(", ")}, och ${items[items.length - 1]}`;
    }
    
    return `Du har valt att skörda ${itemsText} den ${dateFormatted}. Vill du lägga till detta i din plan?`;
  };

  // Handle confirming the date selection
  const handleConfirmDate = () => {
    // Save date for selected filter(s)
    const newHarvestDates = new Map(harvestDatesByFilter);
    
    if (selectedFilterIds.length === 0) {
      // No filter selected, update global date
      actions.setHarvestDateIso(dateInputValue);
    } else {
      // Save date for each selected filter
      selectedFilterIds.forEach((filterId) => {
        if (filterId !== "all") {
          newHarvestDates.set(filterId, dateInputValue);
        }
      });
      setHarvestDatesByFilter(newHarvestDates);
      
      // Also update global date if "all" is selected
      if (selectedFilterIds.includes("all")) {
        actions.setHarvestDateIso(dateInputValue);
      } else {
        // If no global date exists, set it as fallback for plants without filters
        if (!state.harvestDateIso) {
          actions.setHarvestDateIso(dateInputValue);
        }
      }
    }
    
    // Clear old recommendations if date changed
    if (state.recommendations.length > 0) {
      actions.setRecommendations([]);
    }

    // Clear dropdown selection after date is confirmed
    setSelectedFilterIds([]);
    setValidationError(null);
    setShowConfirmDialog(false);
    setUserHasInteractedWithDate(false); // Reset interaction flag
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

  // Handle changing harvest date for a specific plant
  const handleChangeHarvestDate = (plantId: number, dateIso: string) => {
    // Validate the date
    const validation = validateHarvestDate(dateIso, null);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // Find the plant to get its subcategory
    const plant = plants.find((currentPlant) => currentPlant.id === plantId);
    if (!plant) return;

    // Clear old recommendations first so plantMessages will recalculate from harvest dates
    if (state.recommendations.length > 0) {
      actions.setRecommendations([]);
    }

    // Save date for the specific plant filter
    const plantFilterId = `plant-${plantId}`;
    const newHarvestDates = new Map(harvestDatesByFilter);
    newHarvestDates.set(plantFilterId, dateIso);
    setHarvestDatesByFilter(newHarvestDates);

    // Clear validation error if date is valid
    setValidationError(null);
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
          onBlur={handleDateBlur}
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
        onChangeHarvestDate={handleChangeHarvestDate}
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
      <ModalPlantDetails
        plant={selectedPlantForModal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Bekräfta datum"
        message={getConfirmationMessage()}
        confirmText="Ja, lägg till"
        cancelText="Nej"
        variant="success"
        onConfirm={handleConfirmDate}
        onCancel={() => {
          setShowConfirmDialog(false);
          setUserHasInteractedWithDate(false); // Reset so dialog doesn't reopen immediately
        }}
      />
    </section>
  );
};

