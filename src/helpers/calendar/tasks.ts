import { formatDateSwedish, parseDateIso } from "../date/date";
import { CALENDAR_EVENT_CONFIG } from "./events";
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
  plantSubcategory: string;
  dateFormatted: string; // Formaterat datum (t.ex. "1 februari 2026")
  taskLabel: string; // T.ex. "Så Black Cherry", "Plantera ut Paprika California Wonder"
};

/**
 * Get label for task/event type.
 * Can be used for both Task and CalendarEvent types since they share the same type values.
 * 
 * @deprecated Use CALENDAR_EVENT_CONFIG[type].label instead for consistency with calendar legend.
 * This function is kept for backward compatibility but now uses CALENDAR_EVENT_CONFIG internally.
 */
export const getTaskTypeLabel = (type: Task["type"]): string => {
  return CALENDAR_EVENT_CONFIG[type].label;
};

/**
 * Map Task type to PlantWarning dateType.
 * Used when checking if a task has a warning.
 */
export const taskTypeToDateType = (
  taskType: Task["type"]
): "outdoorSowDate" | "indoorSowDate" | "hardenStartDate" | "movePlantOutdoorDate" | "harvest" => {
  switch (taskType) {
    case "sow-outdoor":
      return "outdoorSowDate";
    case "sow-indoor":
      return "indoorSowDate";
    case "harden-start":
      return "hardenStartDate";
    case "move-plant-outdoor":
      return "movePlantOutdoorDate";
    case "harvest":
      return "harvest";
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
 * @returns Array of tasks sorted by date (earliest first)
 */
export const recommendationsToTasks = (
  recommendations: Recommendation[],
  plants: Plant[]
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
    const plantSubcategory = plant.subcategory || "";

    // Outdoor sow date
    if (recommendation.outdoorSowDate) {
      tasks.push({
        type: "sow-outdoor",
        date: recommendation.outdoorSowDate,
        plantId: recommendation.plantId,
        plantName,
        plantSubcategory,
        dateFormatted: formatDateSwedish(recommendation.outdoorSowDate),
        taskLabel: `${CALENDAR_EVENT_CONFIG["sow-outdoor"].label} ${plantName}`,
      });
    }

    // Indoor sow date
    if (recommendation.indoorSowDate) {
      tasks.push({
        type: "sow-indoor",
        date: recommendation.indoorSowDate,
        plantId: recommendation.plantId,
        plantName,
        plantSubcategory,
        dateFormatted: formatDateSwedish(recommendation.indoorSowDate),
        taskLabel: `${CALENDAR_EVENT_CONFIG["sow-indoor"].label} ${plantName}`,
      });
    }

    // Harden start date
    if (recommendation.hardenStartDate) {
      tasks.push({
        type: "harden-start",
        date: recommendation.hardenStartDate,
        plantId: recommendation.plantId,
        plantName,
        plantSubcategory,
        dateFormatted: formatDateSwedish(recommendation.hardenStartDate),
        taskLabel: `${CALENDAR_EVENT_CONFIG["harden-start"].label} ${plantName}`,
      });
    }

    // Move plant outdoor date
    if (recommendation.movePlantOutdoorDate) {
      tasks.push({
        type: "move-plant-outdoor",
        date: recommendation.movePlantOutdoorDate,
        plantId: recommendation.plantId,
        plantName,
        plantSubcategory,
        dateFormatted: formatDateSwedish(recommendation.movePlantOutdoorDate),
        taskLabel: `${CALENDAR_EVENT_CONFIG["move-plant-outdoor"].label} ${plantName}`,
      });
    }

    // Harvest date (one per plant) - use the harvest date from the recommendation itself
    if (recommendation.harvestDateIso) {
      tasks.push({
        type: "harvest",
        date: recommendation.harvestDateIso,
        plantId: recommendation.plantId,
        plantName,
        plantSubcategory,
        dateFormatted: formatDateSwedish(recommendation.harvestDateIso),
        taskLabel: `${CALENDAR_EVENT_CONFIG["harvest"].label} ${plantName}`,
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

