/**
 * Helper functions for text manipulation.
 * 
 * Data sources:
 * - Input strings come from user input or plant data (names, descriptions, etc.)
 * 
 * These are pure utility functions for text formatting and manipulation.
 * 
 * Results:
 * - capitalizeFirst: Returns string (string with first letter capitalized)
 * 
 * Uses:
 * - (none - pure string manipulation)
 * 
 * Used by:
 * - components/plantSelection/PlantsCard/PlantsCard.tsx - for capitalizing plant names
 * - components/plantSelection/PlantsCategoryButtons/PlantsCategoryButtons.tsx - for capitalizing category names
 * - components/shared/FilterDropdown/FilterDropdown.tsx - for capitalizing subcategory names
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx - for capitalizing subcategory names
 * - components/calendar/CalendarTooltip/CalendarTooltip.tsx - for capitalizing plant names
 * - components/myGarden/MyGardenTaskList/MyGardenTaskList.tsx - for capitalizing subcategory names
 * - pages/PlantSelection.tsx - for capitalizing category names
 * - pages/HarvestPlanner.tsx - for capitalizing subcategory names
 */

/**
 * Capitalizes the first letter of a string.
 * 
 * Converts the first character to uppercase and leaves the rest unchanged.
 * Handles empty strings gracefully (returns empty string).
 * 
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized, or empty string if input is empty
 * 
 * @example
 * capitalizeFirst("hello") // Returns "Hello"
 * capitalizeFirst("HELLO") // Returns "HELLO" (only first letter matters)
 * capitalizeFirst("") // Returns ""
 */
export const capitalizeFirst = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

