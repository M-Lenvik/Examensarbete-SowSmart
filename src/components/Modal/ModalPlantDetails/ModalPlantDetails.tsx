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

