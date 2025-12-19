import plantsJsonRaw from "../data/plants.json?raw";
import { normalizePlant } from "../helpers/validation";
import type { Plant, RawPlant } from "../models/Plant";
import type { PlantsFile } from "../models/PlantsFile";

let cachedPlants: Plant[] | null = null;

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isPlantsFile = (value: unknown): value is PlantsFile => {
  if (!isObject(value)) return false;
  if (!isObject(value.metadata)) return false;
  if (!Array.isArray(value.plants)) return false;
  return true;
};

const isRawPlant = (value: unknown): value is RawPlant => {
  if (!isObject(value)) return false;
  if (typeof value.id !== "number") return false;
  if (typeof value.name !== "string") return false;
  if (typeof value.type !== "string") return false;
  if (typeof value.category !== "string") return false;
  if (typeof value.subcategory !== "string") return false;

  if (!isObject(value.plantingWindows)) return false;
  if (!isObject(value.plantingWindows.indoors)) return false;
  if (!isObject(value.plantingWindows.outdoors)) return false;

  return true;
};

/**
 * Load plants from local JSON, normalize into `Plant` objects, and cache in memory.
 * Returns safe defaults (empty array) on error.
 */
export const getPlants = async (): Promise<Plant[]> => {
  if (cachedPlants) return cachedPlants;

  try {
    const parsed = JSON.parse(plantsJsonRaw) as unknown;
    if (!isPlantsFile(parsed)) return [];

    const normalized = parsed.plants
      .filter(isRawPlant)
      .map((raw) => normalizePlant(raw));

    cachedPlants = normalized;
    return normalized;
  } catch (error) {
    console.error("Failed to load plants.json", error);
    return [];
  }
};


