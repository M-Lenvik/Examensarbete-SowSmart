import { formatDateIso, parseDateIso } from "../date/date";
import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";

/**
 * Task type representing a single calendar event/task.
 */
export type Task = {
  type: "sow-outdoor" | "sow-indoor" | "harden-start" | "move-plant-outdoor" | "harvest";
  date: string; // ISO-format (YYYY-MM-DD)
  plantId: number;
  plantName: string;
  dateFormatted: string; // Formaterat datum (t.ex. "1 februari 2026")
  taskLabel: string; // T.ex. "Så Black Cherry", "Plantera ut Paprika California Wonder"
};

/**
 * Get label for task type.
 */
const getTaskTypeLabel = (type: Task["type"]): string => {
  switch (type) {
    case "sow-outdoor":
      return "Så utomhus";
    case "sow-indoor":
      return "Så inomhus";
    case "harden-start":
      return "Starta avhärdning";
    case "move-plant-outdoor":
      return "Flytta ut";
    case "harvest":
      return "Skörd";
    default:
      return type;
  }
};

/**
 * Format date to Swedish format (e.g., "1 februari 2026").
 */
const formatDateSwedish = (dateIso: string): string => {
  try {
    const date = parseDateIso(dateIso);
    return date.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateIso;
  }
};

/**
 * Convert recommendations to tasks.
 * 
 * Converts all dates in recommendations to tasks, sorted chronologically.
 * Each recommendation can generate multiple tasks (outdoorSowDate, indoorSowDate, etc.).
 * 
 * @param recommendations - Array of recommendations from PlanContext
 * @param plants - Array of all plants (to get plant names)
 * @param harvestDateIso - Harvest date (used for harvest tasks)
 * @returns Array of tasks sorted by date (earliest first)
 */
export const recommendationsToTasks = (
  recommendations: Recommendation[],
  plants: Plant[],
  harvestDateIso: string | null
): Task[] => {
  const tasks: Task[] = [];
  const plantMap = new Map(plants.map((plant) => [plant.id, plant]));

  // Convert each recommendation to tasks
  for (const recommendation of recommendations) {
    const plant = plantMap.get(recommendation.plantId);
    if (!plant) {
      continue; // Skip if plant not found
    }

    const plantName = plant.name;

    // Outdoor sow date
    if (recommendation.outdoorSowDate) {
      tasks.push({
        type: "sow-outdoor",
        date: recommendation.outdoorSowDate,
        plantId: recommendation.plantId,
        plantName,
        dateFormatted: formatDateSwedish(recommendation.outdoorSowDate),
        taskLabel: `${getTaskTypeLabel("sow-outdoor")} ${plantName}`,
      });
    }

    // Indoor sow date
    if (recommendation.indoorSowDate) {
      tasks.push({
        type: "sow-indoor",
        date: recommendation.indoorSowDate,
        plantId: recommendation.plantId,
        plantName,
        dateFormatted: formatDateSwedish(recommendation.indoorSowDate),
        taskLabel: `${getTaskTypeLabel("sow-indoor")} ${plantName}`,
      });
    }

    // Harden start date
    if (recommendation.hardenStartDate) {
      tasks.push({
        type: "harden-start",
        date: recommendation.hardenStartDate,
        plantId: recommendation.plantId,
        plantName,
        dateFormatted: formatDateSwedish(recommendation.hardenStartDate),
        taskLabel: `${getTaskTypeLabel("harden-start")} ${plantName}`,
      });
    }

    // Move plant outdoor date
    if (recommendation.movePlantOutdoorDate) {
      tasks.push({
        type: "move-plant-outdoor",
        date: recommendation.movePlantOutdoorDate,
        plantId: recommendation.plantId,
        plantName,
        dateFormatted: formatDateSwedish(recommendation.movePlantOutdoorDate),
        taskLabel: `${getTaskTypeLabel("move-plant-outdoor")} ${plantName}`,
      });
    }

    // Harvest date (one per plant)
    if (harvestDateIso) {
      tasks.push({
        type: "harvest",
        date: harvestDateIso,
        plantId: recommendation.plantId,
        plantName,
        dateFormatted: formatDateSwedish(harvestDateIso),
        taskLabel: `${getTaskTypeLabel("harvest")} ${plantName}`,
      });
    }
  }

  // Sort tasks by date (earliest first)
  return tasks.sort((a, b) => {
    const dateA = parseDateIso(a.date);
    const dateB = parseDateIso(b.date);
    return dateA.getTime() - dateB.getTime();
  });
};

