import type { RawPlant } from "./Plant";

export type PlantsMetadata = {
  version: string;
  lastUpdated: string;
  source: string;
  totalPlants: number;
};

export type PlantsFile = {
  metadata: PlantsMetadata;
  plants: RawPlant[];
};


