import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import type { Plant } from "../models/Plant";

/**
 * Custom hook that shows toast notifications when plants are added or removed.
 * 
 * @param selectedPlantIds - Current array of selected plant IDs
 * @param plants - Array of all available plants
 * @returns Object with skipToast function to skip next toast notification
 */
export const usePlantSelectionToasts = (
  selectedPlantIds: number[],
  plants: Plant[]
) => {
  const previousSelectedPlantIdsRef = useRef<number[]>([]);
  const skipToastRef = useRef<boolean>(false);

  // Initialize ref on mount
  useEffect(() => {
    previousSelectedPlantIdsRef.current = selectedPlantIds;
  }, []);

  // Show toast when a plant is added or removed
  useEffect(() => {
    const previousIds = previousSelectedPlantIdsRef.current;
    const currentIds = selectedPlantIds;

    // Skip toast if it was triggered by "Ta bort" button
    if (skipToastRef.current) {
      skipToastRef.current = false;
      previousSelectedPlantIdsRef.current = currentIds;
      return;
    }

    // Check if a new plant was added (current has more items than previous)
    if (currentIds.length > previousIds.length) {
      const addedPlantId = currentIds.find((id) => !previousIds.includes(id));
      if (addedPlantId) {
        const addedPlant = plants.find((plant) => plant.id === addedPlantId);
        if (addedPlant) {
          toast.success(`${addedPlant.name} tillagd till dina valda fröer`);
        }
      }
    }
    // Check if a plant was removed (current has fewer items than previous)
    else if (currentIds.length < previousIds.length) {
      const removedPlantId = previousIds.find((id) => !currentIds.includes(id));
      if (removedPlantId) {
        const removedPlant = plants.find((plant) => plant.id === removedPlantId);
        if (removedPlant) {
          toast.error(`${removedPlant.name} borttagen från dina valda fröer`);
        }
      }
    }

    // Update ref for next comparison
    previousSelectedPlantIdsRef.current = currentIds;
  }, [selectedPlantIds, plants]);

  return {
    skipToast: () => {
      skipToastRef.current = true;
    },
  };
};

