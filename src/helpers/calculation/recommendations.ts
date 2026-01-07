/**
 * Helper functions for generating planting recommendations.
 * 
 * Data sources:
 * - plants: From plants.json (selected plants from user)
 * - harvestDateIso: User input (selected harvest date in ISO format)
 * - Plant data: daysOutdoor, daysIndoorGrowth, hardeningDays, plantingMethod from plants.json
 * - Defaults: From plantDefaults.ts when plant-specific data is missing
 * 
 * All dates are calculated backwards from the harvest date to ensure
 * the user's selected harvest date is always respected.
 */

import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";
import { formatDateIso, parseDateIso, subtractDays, addDays } from "../date/date";
import { calculateTryAnywaySowDate } from "./sowDate";
import { DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY, DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY } from "../plant/plantDefaults";


/**
 * Get daysIndoorGrowth from plant or subcategory default.
 * Returns null if neither is available.
 */
const getDaysIndoorGrowthWithDefault = (plant: Plant): number | null => {
  if (plant.daysIndoorGrowth !== null) {
    return plant.daysIndoorGrowth;
  }
  return DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY[plant.subcategory] ?? null;
};

/**
 * Get hardeningDays from plant or subcategory default.
 * Adds warning if default is missing and uses 0 as fallback.
 */
const getHardeningDaysWithDefault = (plant: Plant, warnings: string[]): number => {
  if (plant.hardeningDays !== null) {
    return plant.hardeningDays;
  }
  
  const defaultDays = DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY[plant.subcategory] ?? null;
  if (defaultDays === null) {
    warnings.push("Saknar data för antal avhärdningsdagar");
    return 0; // Use 0 as fallback to continue calculation
  }
  
  return defaultDays;
};

/**
 * Generate complete planting recommendations for selected plants based on harvest date.
 * 
 * All dates are calculated backwards from the harvest date:
 * - Uses totalDaysFromSeed or daysOutdoorToHarvest to calculate backwards
 * - All calculations start from the user's selected harvest date
 * - Handles indoor and outdoor planting methods
 * - Falls back to defaults when plant-specific data is missing
 * 
 * **Calculation order for outdoor plants:**
 * 1. `outdoorSowDate` = harvestDate - daysOutdoorToHarvest
 * 
 * **Calculation order for indoor plants:**
 * 1. `movePlantOutdoorDate` = harvestDate - daysOutdoorToHarvest
 * 2. `indoorSowDate` = movePlantOutdoorDate - daysIndoorGrowth (or harvestDate - totalDaysFromSeed)
 * 3. `hardenStartDate` = movePlantOutdoorDate - hardeningDays
 * 
 * @param plants - Array of selected plants to generate recommendations
 * @param harvestDateIso - The target harvest date in ISO format (YYYY-MM-DD)
 * 
 * @returns Array of recommendations, one per plant. Each recommendation includes:
 *   - `plantId`: ID of the plant
 *   - `outdoorSowDate`: Calculated outdoor sow date (ISO string) or null
 *   - `indoorSowDate`: Calculated indoor sow date (ISO string) or null
 *   - `hardenStartDate`: When to start hardening (ISO string) or null
 *   - `movePlantOutdoorDate`: When to transplant outdoors (ISO string) or null
 *   - `warnings`: Array of Swedish warning messages if data is missing
 * 
 * @example
 * const plants = [tomatoPlant, cucumberPlant];
 * const harvestDate = "2026-07-15";
 * const recommendations = generateRecommendations(plants, harvestDate);
 * // Returns array with complete planting schedule for each plant
 */
export const generateRecommendations = (
  plants: Plant[],
  harvestDateIso: string
): Recommendation[] => {
  // Parse harvest date
  let harvestDate: Date;
  try {
    harvestDate = parseDateIso(harvestDateIso);
    harvestDate.setHours(0, 0, 0, 0);
  } catch {
    // If invalid date, return empty recommendations with warnings
    return plants.map((plant) => ({
      plantId: plant.id,
      outdoorSowDate: null,
      indoorSowDate: null,
      hardenStartDate: null,
      movePlantOutdoorDate: null,
      warnings: ["Ogiltigt skördedatum"],
    }));
  }

  return plants.map((plant) => {
    const warnings: string[] = [];

    // Calculate dates based on planting method (all backwards from harvest date)
    // Uses the same logic as tryAnywaySowDate in dateValidation.ts
    switch (plant.plantingMethod) {
      case "outdoor": {
        // Outdoor path: sow directly outdoors
        // Calculate backwards using tryAnywaySowDate logic (shared with planner)
        const outdoorSowDate = calculateTryAnywaySowDate(harvestDate, plant);

        if (!outdoorSowDate) {
          warnings.push("Kunde inte beräkna sådatum (saknar plantingWindows eller harvestTime)");
          return {
            plantId: plant.id,
            outdoorSowDate: null,
            indoorSowDate: null,
            hardenStartDate: null,
            movePlantOutdoorDate: null,
            warnings,
          };
        }

        return {
          plantId: plant.id,
          outdoorSowDate: formatDateIso(outdoorSowDate),
          indoorSowDate: null,
          hardenStartDate: null,
          movePlantOutdoorDate: null,
          warnings,
        };
      }

      case "indoor": {
        // Indoor path: must start indoors
        // Calculate ALL dates backwards from harvest date:
        // 1. indoorSowDate = calculateTryAnywaySowDate (shared function - same as planner)
        // 2. movePlantOutdoorDate = indoorSowDate + daysIndoorGrowth (forward from sow date)
        // 3. hardenStartDate = movePlantOutdoorDate - hardeningDays (backwards from move outdoor)

        // Calculate indoorSowDate using tryAnywaySowDate logic (shared with planner)
        const indoorSowDate = calculateTryAnywaySowDate(harvestDate, plant);

        if (!indoorSowDate) {
          warnings.push("Kunde inte beräkna sådatum (saknar plantingWindows eller harvestTime)");
          return {
            plantId: plant.id,
            outdoorSowDate: null,
            indoorSowDate: null,
            hardenStartDate: null,
            movePlantOutdoorDate: null,
            warnings,
          };
        }

        // Get daysIndoorGrowth (required for calculating movePlantOutdoorDate)
        const daysIndoorGrowth = getDaysIndoorGrowthWithDefault(plant);
        if (daysIndoorGrowth === null) {
          warnings.push("Saknar data för antal dagar inomhusväxt");
          return {
            plantId: plant.id,
            outdoorSowDate: null,
            indoorSowDate: formatDateIso(indoorSowDate),
            hardenStartDate: null,
            movePlantOutdoorDate: null,
            warnings,
          };
        }

        // Get hardeningDays (use from plant or default)
        const hardeningDays = getHardeningDaysWithDefault(plant, warnings);

        // Calculate movePlantOutdoorDate forward from indoorSowDate
        // movePlantOutdoorDate = indoorSowDate + daysIndoorGrowth
        const movePlantOutdoorDate = addDays(indoorSowDate, daysIndoorGrowth);
        movePlantOutdoorDate.setHours(0, 0, 0, 0);

        // Calculate hardenStartDate backwards from movePlantOutdoorDate
        // Hardening happens during the last hardeningDays before moving outdoors
        const hardenStartDate = subtractDays(movePlantOutdoorDate, hardeningDays);
        hardenStartDate.setHours(0, 0, 0, 0);

        return {
          plantId: plant.id,
          outdoorSowDate: null,
          indoorSowDate: formatDateIso(indoorSowDate),
          hardenStartDate: formatDateIso(hardenStartDate),
          movePlantOutdoorDate: formatDateIso(movePlantOutdoorDate),
          warnings,
        };
      }

      default: {
        // This should never happen due to TypeScript, but handle it gracefully
        warnings.push(`Okänd planting method: ${plant.plantingMethod}`);
        return {
          plantId: plant.id,
          outdoorSowDate: null,
          indoorSowDate: null,
          hardenStartDate: null,
          movePlantOutdoorDate: null,
          warnings,
        };
      }
    }
  });
};

