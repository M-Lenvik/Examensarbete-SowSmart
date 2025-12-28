/**
 * Helper functions for calculating days outdoor to harvest.
 */

import { addDays } from "./date";

/**
 * Calculate the number of days a plant will be outdoors before harvest date.
 * 
 * Used for indoor plants that are transplanted outdoors. The function first
 * calculates when the plant is moved outdoors, then counts days until harvest.
 * 
 * **Formulas:**
 * - `moveOutdoorDate` = sowDate + daysIndoorGrowth + hardeningDays
 * - `daysOutdoorToHarvest` = harvestDate - moveOutdoorDate
 * 
 * @param sowDate - The calculated sow date (from calculateSowDate)
 * @param harvestDate - The selected harvest date
 * @param daysIndoorGrowth - Number of days the plant grows indoors (or null)
 * @param hardeningDays - Number of days for hardening process (or null)
 * 
 * @returns Number of days the plant will be outdoors before harvest, or null if:
 *   - daysIndoorGrowth is null (required for calculation)
 *   - Result is negative (harvest date is before transplant date - should not happen)
 * 
 * @example
 * // Plant sown on Feb 24, harvest on Aug 1
 * // daysIndoorGrowth = 60, hardeningDays = 7
 * // moveOutdoorDate = Feb 24 + 60 + 7 = May 2
 * // daysOutdoorToHarvest = Aug 1 - May 2 = 91 days
 * const days = calculateDaysOutdoorToHarvest(sowDate, harvestDate, 60, 7);
 * // Returns: 91
 */
export const calculateDaysOutdoorToHarvest = (
  sowDate: Date,
  harvestDate: Date,
  daysIndoorGrowth: number | null,
  hardeningDays: number | null
): number | null => {
  // Check if required values are available
  if (daysIndoorGrowth === null) {
    return null;
  }

  // Use 0 for hardeningDays if null
  const hardening = hardeningDays ?? 0;

  // Calculate when plant is moved outdoors
  // moveOutdoorDate = sowDate + daysIndoorGrowth + hardeningDays
  let moveOutdoorDate = addDays(sowDate, daysIndoorGrowth);
  moveOutdoorDate = addDays(moveOutdoorDate, hardening);
  moveOutdoorDate.setHours(0, 0, 0, 0);

  // Ensure harvestDate is also at start of day for accurate calculation
  const harvestDateNormalized = new Date(harvestDate);
  harvestDateNormalized.setHours(0, 0, 0, 0);

  // Calculate days outdoor to harvest
  // daysOutdoorToHarvest = harvestDate - moveOutdoorDate
  const daysOutdoorToHarvest = Math.floor(
    (harvestDateNormalized.getTime() - moveOutdoorDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If result is negative, the harvest date is before the plant is moved outdoors
  // This shouldn't happen in normal cases, but return null if it does
  if (daysOutdoorToHarvest < 0) {
    return null;
  }

  return daysOutdoorToHarvest;
};

