import { calculateTryAnywaySowDate } from "../calculation/sowDate";
import { formatDateIso, parseDateIso } from "./date";
import { getPlantSowResult, type PlantSowResult } from "./dateValidation";
import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";

/**
 * Calculate plant messages from recommendations harvest dates.
 * 
 * @param recommendations - Array of recommendations with harvest dates
 * @param plants - Array of all plants
 * @returns Map of plantId -> PlantSowResult
 */
export const calculatePlantMessagesFromRecommendations = (
  recommendations: Recommendation[],
  plants: Plant[]
): Map<number, PlantSowResult> => {
  if (recommendations.length === 0) {
    return new Map<number, PlantSowResult>();
  }

  const results = new Map<number, PlantSowResult>();
  const plantMap = new Map(plants.map((plant) => [plant.id, plant]));

  for (const recommendation of recommendations) {
    const plant = plantMap.get(recommendation.plantId);
    if (!plant || !recommendation.harvestDateIso) continue;

    try {
      const sowResult = getPlantSowResult(recommendation.harvestDateIso, plant);
      if (sowResult) {
        const processedResult = processPlantSowResult(sowResult, recommendation.harvestDateIso, plant);
        results.set(plant.id, processedResult);
      }
    } catch {
      // Skip invalid dates
    }
  }

  return results;
};

/**
 * Calculate plant messages from harvest dates directly (without recommendations).
 * 
 * @param harvestDatesByPlant - Map of plantId -> harvest date ISO string
 * @param plants - Array of plants to process
 * @returns Map of plantId -> PlantSowResult
 */
export const calculatePlantMessagesFromHarvestDates = (
  harvestDatesByPlant: Map<number, string>,
  plants: Plant[]
): Map<number, PlantSowResult> => {
  const results = new Map<number, PlantSowResult>();

  for (const plant of plants) {
    const harvestDate = harvestDatesByPlant.get(plant.id);
    if (!harvestDate) continue;

    try {
      const sowResult = getPlantSowResult(harvestDate, plant);
      if (sowResult) {
        const processedResult = processPlantSowResult(sowResult, harvestDate, plant);
        results.set(plant.id, processedResult);
      }
    } catch {
      // Skip invalid dates
    }
  }

  return results;
};

/**
 * Process a PlantSowResult by calculating the actual sow date if needed.
 * Handles special cases for harvestDate and harvestToClose keys.
 * 
 * @param sowResult - The initial sow result from getPlantSowResult
 * @param harvestDateIso - The harvest date ISO string
 * @param plant - The plant
 * @returns Processed PlantSowResult
 */
const processPlantSowResult = (
  sowResult: PlantSowResult,
  harvestDateIso: string,
  plant: Plant
): PlantSowResult => {
  // If sowResult.key is "harvestDate", use it as-is (perfect scenario - sowDateIso is correct)
  // If sowResult.key is "harvestToClose", use it as-is (message already contains correct nearestSowDateIso)
  if (sowResult.key === "harvestDate" || (sowResult.key === "harvestToClose" && sowResult.sowDateIso)) {
    return sowResult;
  }

  // For other scenarios (outside harvest window), calculate actual sow date and replace if needed
  const parsedHarvestDate = parseDateIso(harvestDateIso);
  const calculatedSowDate = calculateTryAnywaySowDate(parsedHarvestDate, plant);
  
  if (calculatedSowDate) {
    const calculatedSowDateIso = formatDateIso(calculatedSowDate);
    const message = sowResult.message.replace(sowResult.sowDateIso || "", calculatedSowDateIso);
    return {
      ...sowResult,
      message,
      sowDateIso: calculatedSowDateIso,
    };
  }

  return sowResult;
};

