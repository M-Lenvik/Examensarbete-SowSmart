import type { Plant } from "../models/Plant";

/**
 * Sort plants by subcategory first (A-Z), then by name (A-Z).
 * Plants with empty/missing subcategory are placed last.
 */
export const sortPlantsBySubcategoryAndName = (plants: Plant[]): Plant[] => {
  return [...plants].sort((a, b) => {
    // Handle empty/missing subcategory: place them last
    const aSubcategory = (a.subcategory || "").trim().toLowerCase();
    const bSubcategory = (b.subcategory || "").trim().toLowerCase();
    
    // If both are empty, sort by name
    if (aSubcategory.length === 0 && bSubcategory.length === 0) {
      return a.name.localeCompare(b.name, "sv");
    }
    
    // If only one is empty, empty one goes last
    if (aSubcategory.length === 0) return 1;
    if (bSubcategory.length === 0) return -1;
    
    // Both have subcategory: compare subcategory first
    const subcategoryCompare = aSubcategory.localeCompare(bSubcategory, "sv");
    if (subcategoryCompare !== 0) return subcategoryCompare;
    
    // Same subcategory: sort by name
    return a.name.localeCompare(b.name, "sv");
  });
};