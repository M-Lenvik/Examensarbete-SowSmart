import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Panel } from "../components/Panel/Panel";
import { PlannerCalculateButton } from "../components/PlannerCalculateButton/PlannerCalculateButton";
import { PlannerDateInput } from "../components/PlannerDateInput/PlannerDateInput";
import { PlannerSelectedPlants } from "../components/PlannerSelectedPlants/PlannerSelectedPlants";
import { PlantsDetailModal } from "../components/PlantsDetailModal/PlantsDetailModal";
import { PlanContext } from "../context/PlanContext";
import { getPlantSowResult, validateHarvestDate } from "../helpers/date/dateValidation";
import { generateRecommendations } from "../helpers/calculation/recommendations";
import { calculateTryAnywaySowDate } from "../helpers/calculation/sowDate";
import { formatDateIso, parseDateIso } from "../helpers/date/date";
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

  // Load all plants
  useEffect(() => {
    const load = async () => {
      const loadedPlants = await getPlants();
      setPlants(loadedPlants);
      setIsLoading(false);
    };

    void load();
  }, []);

  // Load saved harvest date from context
  useEffect(() => {

    if (state.harvestDateIso) {
      setDateInputValue(state.harvestDateIso);
    }
  }, [state.harvestDateIso]);

  // Filter and sort selected plants
  const selectedPlants = useMemo(() => {
    if (state.selectedPlantIds.length === 0) return [];
    const selectedSet = new Set(state.selectedPlantIds);
    const filtered = plants.filter((plant) => selectedSet.has(plant.id));
    return sortPlantsBySubcategoryAndName(filtered);
  }, [plants, state.selectedPlantIds]);

  // Calculate sow result messages per plant
  // Use recommendations if available, otherwise calculate from date input
  const plantMessages = useMemo(() => {
    if (selectedPlants.length === 0) {
      return new Map<number, string>();
    }

    const results = new Map<number, string>();

    // If we have recommendations, use those dates
    if (state.recommendations.length > 0 && dateInputValue) {
      const recommendationMap = new Map(state.recommendations.map((rec) => [rec.plantId, rec]));
      
      for (const plant of selectedPlants) {
        const recommendation = recommendationMap.get(plant.id);
        if (recommendation) {
          // Show the actual sow date from recommendations
          const sowDate = recommendation.indoorSowDate || recommendation.outdoorSowDate;
          if (sowDate) {
            results.set(plant.id, `Sås på ${sowDate}`);
          }
        }
      }
    } else if (dateInputValue) {
      // Use getPlantSowResult for detailed messages with warnings/comments
      // But replace the sow date with calculateTryAnywaySowDate to match calendar
      try {
        const harvestDate = parseDateIso(dateInputValue);
        for (const plant of selectedPlants) {
          const sowResult = getPlantSowResult(dateInputValue, plant);
          if (sowResult) {
            // Get the correct sow date using same method as calendar
            const correctSowDate = calculateTryAnywaySowDate(harvestDate, plant);
            if (correctSowDate) {
              const correctSowDateIso = formatDateIso(correctSowDate);
              // Replace the sow date in the message with the correct one
              // This keeps all the warnings/comments but ensures date matches calendar
              let message = sowResult.message;
              if (sowResult.sowDateIso) {
                // Replace all occurrences of the old sow date with the correct one
                message = message.split(sowResult.sowDateIso).join(correctSowDateIso);
              }
              results.set(plant.id, message);
            } else {
              // Fallback to original message if we can't calculate correct date
              results.set(plant.id, sowResult.message);
            }
          }
        }
      } catch {
        // Invalid date, skip calculation
      }
    }

    return results;
  }, [dateInputValue, selectedPlants, state.recommendations]);


  // Handle date input change and validate
  const handleDateChange = (value: string) => {
    setDateInputValue(value);
    
    // Validate basic rules (required, not in past)
    const validation = validateHarvestDate(value, null);
    setValidationError(validation.error);
    
    // Update harvestDateIso in context immediately if valid
    if (validation.isValid) {
      // Clear old recommendations if date changed (they're based on old date)
      if (state.harvestDateIso !== value && state.recommendations.length > 0) {
        actions.setRecommendations([]);
      }
      actions.setHarvestDateIso(value);
    } else {
      // Clear harvestDateIso and recommendations if invalid
      actions.setHarvestDateIso(null);
      if (state.recommendations.length > 0) {
        actions.setRecommendations([]);
      }
    }
    
    // Note: Per-plant sow result messages are calculated in useMemo (plantMessages)
    // and shown in the selected plants list
  };

  // Check if calculate button should be disabled
  const isCalculateDisabled = useMemo(() => {
    return (
      state.selectedPlantIds.length === 0 ||
      !dateInputValue ||
      validationError !== null
    );
  }, [state.selectedPlantIds.length, dateInputValue, validationError]);

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
    // Validate date again (basic rules)
    const validation = validateHarvestDate(dateInputValue, null);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    // Set calculating state
    setIsCalculating(true);

    try {
      // Generate recommendations for selected plants
      const recommendations = generateRecommendations(selectedPlants, dateInputValue);

      // Save to context
      actions.setHarvestDateIso(dateInputValue);
      actions.setRecommendations(recommendations);

      // Navigate to calendar
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
      <p>Här väljer du ditt önskade skördedatum och beräknar din personliga odlingsplan.</p>
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
      />
      <PlannerCalculateButton
        onCalculate={handleCalculate}
        disabled={isCalculateDisabled}
        isLoading={isCalculating}
        hasHarvestDate={!!dateInputValue && validationError === null}
      />
      <PlantsDetailModal
        plant={selectedPlantForModal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

