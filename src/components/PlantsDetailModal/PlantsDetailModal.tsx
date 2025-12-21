import { Modal } from "../Modal/Modal";
import type { Plant } from "../../models/Plant";
import { PlantsDetailCard } from "../PlantsDetailCard/PlantsDetailCard";

type PlantsDetailModalProps = {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
};

export const PlantsDetailModal = ({
  plant,
  isOpen,
  onClose,
}: PlantsDetailModalProps) => {
  if (!isOpen || plant === null) return null;

  return (
    // Modal with title of plant name and content of PlantsDetailCard
    <Modal isOpen={isOpen} title={plant.type + " " + plant.name} onClose={onClose}>
      <PlantsDetailCard plant={plant} />
    </Modal>
  );
};


