/**
 * Helper functions for generating planting recommendations.
 */

import type { Plant } from "../models/Plant";
import type { Recommendation } from "../reducers/planReducer";
import { formatDateIso, parseDateIso, addDays } from "./date";
import { calculateSowDate } from "./sowDate";
import { DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY, DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY } from "./plantDefaults";

/**
 * Generate planting recommendations for selected plants based on harvest date.
 * 
 * Uses calculateSowDate() which calculates sow date relative to planting window
 * based on harvest date position in harvest window (seedConstant formula).
 * 
 * Calculation order for indoor plants:
 * 1. indoorSowDate = calculateSowDate() (relative calculation)
 * 2. hardenStartDate = indoorSowDate + (daysIndoorGrowth - hardeningDays)
 * 3. movePlantOutdoorDate = indoorSowDate + daysIndoorGrowth
 * 
 * @param plants - Array of selected plants
 * @param harvestDateIso - The target harvest date in ISO format (YYYY-MM-DD)
 * @returns Array of recommendations, one per plant
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

    // Calculate dates based on planting method
    switch (plant.plantingMethod) {
      case "outdoor": {
        // Outdoor path: sow directly outdoors
        const outdoorSowDate = calculateSowDate(
          harvestDate,
          plant.plantingWindows,
          plant.harvestTime ?? null
        );

        if (!outdoorSowDate) {
          warnings.push("Kunde inte beräkna sådatum (saknar plantingWindows eller harvestTime)");
        }

        return {
          plantId: plant.id,
          outdoorSowDate: outdoorSowDate ? formatDateIso(outdoorSowDate) : null,
          indoorSowDate: null,
          hardenStartDate: null,
          movePlantOutdoorDate: null,
          warnings,
        };
      }

      case "indoor": {
        // Indoor path: must start indoors
        const indoorSowDate = calculateSowDate(
          harvestDate,
          plant.plantingWindows,
          plant.harvestTime ?? null
        );

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

        // Get daysIndoorGrowth (use from plant or default)
        let daysIndoorGrowth = plant.daysIndoorGrowth;
        if (daysIndoorGrowth === null) {
          daysIndoorGrowth = DEFAULT_DAYS_INDOOR_GROWTH_BY_SUBCATEGORY[plant.subcategory] ?? null;
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
        }

        // Get hardeningDays (use from plant or default)
        let hardeningDays = plant.hardeningDays;
        if (hardeningDays === null) {
          hardeningDays = DEFAULT_HARDENING_DAYS_BY_SUBCATEGORY[plant.subcategory] ?? null;
          if (hardeningDays === null) {
            warnings.push("Saknar data för antal avhärdningsdagar");
            // Use 0 as fallback to continue calculation
            hardeningDays = 0;
          }
        }

        // Calculate hardenStartDate: indoorSowDate + (daysIndoorGrowth - hardeningDays)
        // Hardening happens during the last hardeningDays of daysIndoorGrowth
        const hardenStartDate = addDays(indoorSowDate, daysIndoorGrowth - hardeningDays);
        hardenStartDate.setHours(0, 0, 0, 0);

        // Calculate movePlantOutdoorDate: indoorSowDate + daysIndoorGrowth
        const movePlantOutdoorDate = addDays(indoorSowDate, daysIndoorGrowth);
        movePlantOutdoorDate.setHours(0, 0, 0, 0);

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

