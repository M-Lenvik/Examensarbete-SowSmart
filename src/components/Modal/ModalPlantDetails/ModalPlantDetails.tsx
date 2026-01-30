/**
 * ModalPlantDetails component - modal wrapper for plant detail information.
 * 
 * Data sources:
 * - Props: plant, isOpen, onClose
 * 
 * Results:
 * - Returns: JSX (modal with plant name as title and plant details card)
 * 
 * Uses:
 * - components/Modal/Modal.tsx (Modal)
 * - components/Modal/ModalPlantDetailsCard/ModalPlantDetailsCard.tsx (ModalPlantDetailsCard)
 * 
 * Used by:
 * - pages/PlantSelection.tsx - for displaying plant details modal
 * - pages/HarvestPlanner.tsx - for displaying plant details modal
 * - pages/MyGarden.tsx - for displaying plant details modal
 */

import { Modal } from "../Modal";
import type { Plant } from "../../../models/Plant";
import { ModalPlantDetailsCard } from "../ModalPlantDetailsCard/ModalPlantDetailsCard";

type ModalPlantDetailsProps = {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalPlantDetails = ({
  plant,
  isOpen,
  onClose,
}: ModalPlantDetailsProps) => {
  if (!isOpen || plant === null) return null;

  return (
    // Modal with title of plant name and content of ModalPlantDetailsCard
    <Modal isOpen={isOpen} title={plant.type + " " + plant.name} onClose={onClose}>
      <ModalPlantDetailsCard plant={plant} />
    </Modal>
  );
};

