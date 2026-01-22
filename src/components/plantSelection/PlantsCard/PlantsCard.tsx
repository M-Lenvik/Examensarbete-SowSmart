import { FALLBACK_PLANT_IMAGE_SRC, handleImageError } from "../../../helpers/utils/image";
import type { Plant } from "../../../models/Plant";
import { capitalizeFirst } from "../../../helpers/utils/text";
import "./PlantsCard.scss";

type PlantsCardProps = {
  plant: Plant;
  isSelected: boolean;
  onToggleSelected: () => void;
  onOpenDetails: () => void;
};

export const PlantsCard = ({
  plant,
  isSelected,
  onToggleSelected,
  onOpenDetails,
}: PlantsCardProps) => {
  const checkboxId = `plant-checkbox-${plant.id}`;


  return (
    <article className="plants-card">
      <img
        className="plants-card__image"
        src={plant.imageUrl ?? FALLBACK_PLANT_IMAGE_SRC}
        alt=""
        role="presentation"
        loading="lazy"
        onError={(event) => handleImageError(event, FALLBACK_PLANT_IMAGE_SRC)}
      />

      <button
        type="button"
        className="plants-card__content"
        onClick={onOpenDetails}
        aria-label={`Öppna detaljer för ${plant.name}`}
      >
        <span className="plants-card__title">{plant.name}</span>
        <span className="plants-card__meta">{capitalizeFirst(plant.subcategory)}</span>
        <span className="plants-card__meta">{capitalizeFirst(plant.type)}</span>
      </button>
      
      <label htmlFor={checkboxId} className="plants-card__checkbox">
        <input
          id={checkboxId}
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelected()}
          aria-label={`Välj ${plant.name}`}
        />
      </label>
    </article>
  );
};


