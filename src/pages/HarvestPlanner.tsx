/**
 * HarvestPlanner page component - allows users to set harvest dates and generate planting recommendations.
 * 
 * Data sources:
 * - plants: From plantsService (all available plants)
 * - state: From PlanContext (selected plants, harvest date, recommendations)
 * - localStorage: Filter-based harvest dates (for individual plant dates)
 * 
 * Results:
 * - Returns: JSX (harvest planner page with date input, plant list, and recommendations)
 * - Updates PlanContext with harvest date and recommendations
 * 
 * Uses:
 * - context/PlanContext.tsx (PlanContext)
 * - services/plantsService.ts (getPlants)
 * - helpers/date/dateValidation.ts (validateHarvestDate, getPlantSowResult)
 * - helpers/calculation/recommendations.ts (generateRecommendations)
 * - helpers/date/plantMessages.ts (calculatePlantMessagesFromHarvestDates, calculatePlantMessagesFromRecommendations)
 * - helpers/date/date.ts (formatDateSwedish, formatDateSwedishWithoutYear)
 * - helpers/storage/localStorage.ts (loadHarvestDatesByFilterFromLocalStorage, saveHarvestDatesByFilterToLocalStorage)
 * - helpers/utils/sorting.ts (sortPlantsBySubcategoryAndName, sortSubcategories)
 * - helpers/utils/text.ts (capitalizeFirst)
 * - components/planner/* (PlannerDateInput, PlannerSelectedPlants, PlannerCalculateButton)
 * - components/shared/* (FilterDropdown, Panel, Button, Modal, ModalPlantDetails)
 * 
 * Used by:
 * - Router.tsx - for "/planner" route
 */

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FilterDropdown } from "../components/shared/FilterDropdown/FilterDropdown";
import { Panel } from "../components/shared/Panel/Panel";
import { Button } from "../components/shared/Button/Button";
import { PlannerCalculateButton } from "../components/planner/PlannerCalculateButton/PlannerCalculateButton";
import { PlannerDateInput } from "../components/planner/PlannerDateInput/PlannerDateInput";
import { PlannerSelectedPlants } from "../components/planner/PlannerSelectedPlants/PlannerSelectedPlants";
import { ModalPlantDetails } from "../components/Modal/ModalPlantDetails/ModalPlantDetails";
import { Modal } from "../components/Modal/Modal";
import { PlanContext } from "../context/PlanContext";
import { validateHarvestDate, getPlantSowResult, type PlantSowResult } from "../helpers/date/dateValidation";
import { generateRecommendations } from "../helpers/calculation/recommendations";
import { calculatePlantMessagesFromHarvestDates, calculatePlantMessagesFromRecommendations } from "../helpers/date/plantMessages";
import { formatDateSwedish, formatDateSwedishWithoutYear } from "../helpers/date/date";
import { loadHarvestDatesByFilterFromLocalStorage, saveHarvestDatesByFilterToLocalStorage } from "../helpers/storage/localStorage";
import { sortPlantsBySubcategoryAndName, sortSubcategories } from "../helpers/utils/sorting";
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
  const [blockedDateMessage, setBlockedDateMessage] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedFilterIds, setSelectedFilterIds] = useState<string[]>([]);
  const [cancelDateIso, setCancelDateIso] = useState<string | null>(null);
  const cancelTimeoutRef = useRef<number | null>(null);
  const previousDateValueRef = useRef<string>("");
  const currentDateValueRef = useRef<string>("");
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
    previousDateValueRef.current = dateToShow;
    setCancelDateIso(null);
    
    // Validate the date if one is shown
    if (dateToShow) {
      const validation = validateHarvestDate(dateToShow, null);
      setValidationError(validation.error);
    } else {
      setValidationError(null);
    }
  }, [selectedFilterIds, harvestDatesByFilter, state.harvestDateIso]);

  const isActionButtonsVisible = Boolean(
    dateInputValue &&
    !validationError &&
    (dateInputValue !== previousDateValueRef.current || cancelDateIso !== null)
  );

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

  const getHarvestDateFromMap = (
    plant: Plant,
    harvestDatesMap: Map<string, string>,
    globalHarvestDate: string | null
  ): string | null => {
    const plantFilterId = `plant-${plant.id}`;
    const subcategory = plant.subcategory || "Övrigt";
    const subcategoryFilterId = `subcategory-${subcategory}`;

    return (
      harvestDatesMap.get(plantFilterId) ||
      harvestDatesMap.get(subcategoryFilterId) ||
      globalHarvestDate ||
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

    // If recommendations exist, calculate messages from them (keeps warnings)
    if (state.recommendations.length > 0) {
      return calculatePlantMessagesFromRecommendations(state.recommendations, selectedPlants);
    }

    // No recommendations yet - calculate messages from harvest dates
    const harvestDatesMap = new Map<number, string>();
    for (const plant of selectedPlants) {
      const harvestDate = getHarvestDate(plant);
      if (harvestDate) {
        harvestDatesMap.set(plant.id, harvestDate);
      }
    }
    return calculatePlantMessagesFromHarvestDates(harvestDatesMap, selectedPlants);
  }, [selectedPlants, state.recommendations, harvestDatesByFilter, state.harvestDateIso]);


  // Handle date input change - only validate, don't save yet
  const handleDateChange = (value: string) => {
    setDateInputValue(value);
    currentDateValueRef.current = value; // Keep ref in sync with state
    
    // Validate basic rules (required, not in past)
    const validation = validateHarvestDate(value, null);
    setValidationError(validation.error);

  };

  const applyHarvestDate = (dateIso: string): boolean => {
    const shouldBlockForTooClose = selectedPlants.some((plant) => {
      if (selectedFilterIds.length > 0 && !selectedFilterIds.includes("all")) {
        const subcategory = plant.subcategory || "Övrigt";
        const matchesFilter = selectedFilterIds.some((filterId) =>
          filterId === `plant-${plant.id}` || filterId === `subcategory-${subcategory}`
        );
        if (!matchesFilter) return false;
      }

      const sowResult = getPlantSowResult(dateIso, plant);
      return sowResult?.key === "harvestToClose";
    });

    if (shouldBlockForTooClose) {
      setValidationError("Datumet ligger för nära i tid för att hinna mogna. Välj ett senare datum.");
      return false;
    }

    // Save date for selected filter(s)
    const newHarvestDates = new Map(harvestDatesByFilter);
    let nextGlobalHarvestDate = state.harvestDateIso;
    
    if (selectedFilterIds.length === 0) {
      // No filter selected, update global date
      actions.setHarvestDateIso(dateIso);
      nextGlobalHarvestDate = dateIso;
    } else {
      // Save date for each selected filter
      selectedFilterIds.forEach((filterId) => {
        if (filterId !== "all") {
          newHarvestDates.set(filterId, dateIso);
        }
      });
      setHarvestDatesByFilter(newHarvestDates);
      
      // Also update global date if "all" is selected
      if (selectedFilterIds.includes("all")) {
        actions.setHarvestDateIso(dateIso);
        nextGlobalHarvestDate = dateIso;
      } else {
        // If no global date exists, set it as fallback for plants without filters
        if (!state.harvestDateIso) {
          actions.setHarvestDateIso(dateIso);
          nextGlobalHarvestDate = dateIso;
        }
      }
    }
    
    // Update recommendations immediately based on the new dates
    const recommendations = selectedPlants.flatMap((plant) => {
      const harvestDate = getHarvestDateFromMap(plant, newHarvestDates, nextGlobalHarvestDate || null);
      if (!harvestDate) return [];
      return generateRecommendations([plant], harvestDate);
    });
    actions.setRecommendations(recommendations);

    setValidationError(null);
    return true;
  };

  // Auto-apply the selected date when the native date picker closes.
  const handleDateBlur = () => {
    const currentValue = currentDateValueRef.current;
    if (!currentValue || validationError) return;

    if (currentValue !== previousDateValueRef.current) {
      const previousValue = previousDateValueRef.current;
      const didApply = applyHarvestDate(currentValue);
      if (!didApply) return;
      previousDateValueRef.current = currentValue;

      setCancelDateIso(previousValue);
      if (cancelTimeoutRef.current) {
        clearTimeout(cancelTimeoutRef.current);
      }
      cancelTimeoutRef.current = window.setTimeout(() => {
        setCancelDateIso(null);
        cancelTimeoutRef.current = null;
      }, 8000);
    }
  };

  // Build confirmation summary based on selected filters and date
  const getConfirmationSummary = (): string => {
    if (!dateInputValue) return "";
    
    const dateFormatted = formatDateSwedish(dateInputValue);
    
    if (selectedFilterIds.length === 0) {
      return `Du har valt att skörda alla dina fröer den ${dateFormatted}.`;
    }
    
    if (selectedFilterIds.includes("all")) {
      return `Du har valt att skörda alla dina fröer den ${dateFormatted}.`;
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
    const sortedSubcategories = sortSubcategories(Array.from(plantsBySubcategory.keys()));
    
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
      return `Du har valt att skörda den ${dateFormatted}.`;
    }
    
    let itemsText = "";
    if (items.length === 1) {
      itemsText = items[0];
    } else if (items.length === 2) {
      itemsText = `${items[0]} och ${items[1]}`;
    } else {
      itemsText = `${items.slice(0, -1).join(", ")}, och ${items[items.length - 1]}`;
    }
    
    return `Du har valt att skörda ${itemsText} den ${dateFormatted}.`;
  };

  // Show a confirmation toast for the currently selected date.
  const handleConfirmToast = () => {
    if (!dateInputValue || validationError) return;
    const didApply = applyHarvestDate(dateInputValue);
    if (!didApply) return;
    previousDateValueRef.current = dateInputValue;
    try {
      const summary = getConfirmationSummary();
      const message = summary || "Datumet är uppdaterat.";
      toast.success(message, { duration: 4000 });
    } catch {
      toast.success("Datumet är uppdaterat.", { duration: 4000 });
    }
    setCancelDateIso(null);
    if (cancelTimeoutRef.current) {
      clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = null;
    }
  };

  const handleCancelDateChange = () => {
    const undoValue = cancelDateIso ?? previousDateValueRef.current;
    if (undoValue) {
      setDateInputValue(undoValue);
      currentDateValueRef.current = undoValue;
      const validation = validateHarvestDate(undoValue, null);
      setValidationError(validation.error);
      if (!validation.error) {
        const didApply = applyHarvestDate(undoValue);
        if (didApply) {
          previousDateValueRef.current = undoValue;
        }
      }
    }
    setCancelDateIso(null);
    if (cancelTimeoutRef.current) {
      clearTimeout(cancelTimeoutRef.current);
      cancelTimeoutRef.current = null;
    }
    toast.success("Ditt tidigare valda datum ligger kvar.", { duration: 3000 });
  };

  const handleActionMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent input blur from running before click handlers
    event.preventDefault();
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

    const sowResult = getPlantSowResult(dateIso, plant);
    if (sowResult?.key === "harvestToClose") {
      setBlockedDateMessage(
        `Skördedatumet för ${plant.name} ligger för nära i tid för att hinna mogna. Välj ett senare datum.`
      );
      return;
    }

    // Save date for the specific plant filter
    const plantFilterId = `plant-${plantId}`;
    const newHarvestDates = new Map(harvestDatesByFilter);
    newHarvestDates.set(plantFilterId, dateIso);
    setHarvestDatesByFilter(newHarvestDates);

    // Show success toast when date is successfully set
    const formattedDate = formatDateSwedishWithoutYear(dateIso);
    toast.success(`Skördedatum för ${plant.name} är satt till ${formattedDate}`, { duration: 3000 });

    // Update recommendations immediately based on the new per-plant date
    const recommendations = selectedPlants.flatMap((selectedPlant) => {
      const harvestDate = getHarvestDateFromMap(
        selectedPlant,
        newHarvestDates,
        state.harvestDateIso
      );
      if (!harvestDate) return [];
      return generateRecommendations([selectedPlant], harvestDate);
    });
    actions.setRecommendations(recommendations);

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
        {isActionButtonsVisible && (
          <div className="planner-date-input__actions">
            <button
              type="button"
              className="button planner-date-input__confirm-button"
              onMouseDown={handleActionMouseDown}
              onClick={handleConfirmToast}
            >
              Bekräfta datum
            </button>
            <button
              type="button"
              className="button planner-date-input__cancel-button"
              onMouseDown={handleActionMouseDown}
              onClick={handleCancelDateChange}
            >
              Avbryt
            </button>
          </div>
        )}
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
      <Modal
        isOpen={blockedDateMessage !== null}
        title="Skördedatum kan inte sättas"
        onClose={() => setBlockedDateMessage(null)}
      >
        <p>{blockedDateMessage}</p>
        <Button onClick={() => setBlockedDateMessage(null)}>Jag förstår</Button>
      </Modal>
    </section>
  );
};