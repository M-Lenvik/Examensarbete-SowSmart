import type { Plant } from "../../models/Plant";
import { FALLBACK_PLANT_IMAGE_SRC, handleImageError } from "../../helpers/utils/image";
import "./ModalPlantDetailsCard.scss";

type ModalPlantDetailsCardProps = {
  plant: Plant;
};

const toTrimmedString = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value).trim();
  return "";
};

const formatRange = (start: unknown, end: unknown) => {
  const startText = toTrimmedString(start);
  const endText = toTrimmedString(end);
  if (startText.length === 0 && endText.length === 0) return ""; //advice on move plant outdoor is missing
  if (startText.length > 0 && endText.length === 0) return startText;
  if (startText.length === 0 && endText.length > 0) return endText;
  return `${startText}–${endText}`;
};

const hasRange = (start: unknown, end: unknown) => {
  return toTrimmedString(start).length > 0 || toTrimmedString(end).length > 0;
};

const formatDaysOrMissing = (value: number | null) => {
  if (value === null) return "Saknas";
  return `${value} dagar`;
};

const formatPlantingMethod = (method: Plant["plantingMethod"]) => {
  switch (method) {
    case "indoor":
      return "Inomhus";
    case "outdoor":
      return "Utomhus";
  }
};

export const ModalPlantDetailsCard = ({ plant }: ModalPlantDetailsCardProps) => {
  const hasIndoorsWindow = hasRange(
    plant.plantingWindows.indoors.start,
    plant.plantingWindows.indoors.end
  );
  const hasOutdoorsWindow = hasRange(
    plant.plantingWindows.outdoors.start,
    plant.plantingWindows.outdoors.end
  );
  const hasMovePlantOutdoorRange = plant.movePlantOutdoor
    ? hasRange(plant.movePlantOutdoor.start, plant.movePlantOutdoor.end)
    : false;
  const hasMovePlantOutdoorDescription = plant.movePlantOutdoor
    ? plant.movePlantOutdoor.description.trim().length > 0
    : false;

  return (
    <article className="modal-plant-details-card">
      {plant.imageUrl ? (
        <img
          className="modal-plant-details-card__image"
          src={plant.imageUrl}
          alt={`Bild på ${plant.name}`}
          loading="lazy"
          onError={(event) => handleImageError(event, FALLBACK_PLANT_IMAGE_SRC)}
        />
      ) : null}
      <dl className="modal-plant-details-card__definition-list">

        <div className="modal-plant-details-card__item">
          <h3 className="modal-plant-details-card__term">Såmetod</h3>
          <dd className="modal-plant-details-card__definition">{formatPlantingMethod(plant.plantingMethod)}</dd>
        </div>

        {hasIndoorsWindow ? (
          <div className="modal-plant-details-card__item">
            <h3 className="modal-plant-details-card__term">Såfönster (inne)</h3>
            <dd className="modal-plant-details-card__definition">
              {formatRange(plant.plantingWindows.indoors.start, plant.plantingWindows.indoors.end)}
            </dd>
          </div>
        ) : null}

        {hasOutdoorsWindow ? (
          <div className="modal-plant-details-card__item">
            <h3 className="modal-plant-details-card__term">Såfönster (ute)</h3>
            <dd className="modal-plant-details-card__definition">
              {formatRange(plant.plantingWindows.outdoors.start, plant.plantingWindows.outdoors.end)}
            </dd>
          </div>
        ) : null}

        {hasRange(plant.harvestTime?.start, plant.harvestTime?.end) ? (
          <div className="modal-plant-details-card__item">
            <h3 className="modal-plant-details-card__term">Skördefönster</h3>
            <dd className="modal-plant-details-card__definition">
              {formatRange(plant.harvestTime?.start, plant.harvestTime?.end)}
            </dd>
          </div>
        ) : null}

        <div className="modal-plant-details-card__item">
          <h3 className="modal-plant-details-card__term">Totalt antal dagar från sådd till skörd</h3>
          <dd className="modal-plant-details-card__definition">{formatDaysOrMissing(plant.totalDaysFromSeed)}</dd>
        </div>

        <div className="modal-plant-details-card__item">
          <h3 className="modal-plant-details-card__term">Dagar inomhus (till utplantering)</h3>
          <dd className="modal-plant-details-card__definition">{formatDaysOrMissing(plant.daysIndoorGrowth)}</dd>
        </div>

        <div className="modal-plant-details-card__item">
          <h3 className="modal-plant-details-card__term">Avhärdning</h3>
          <dd className="modal-plant-details-card__definition">{formatDaysOrMissing(plant.hardeningDays)}</dd>
        </div>

        {plant.movePlantOutdoor &&
        (hasMovePlantOutdoorRange || hasMovePlantOutdoorDescription) ? (
          <div className="modal-plant-details-card__item">
            <h3 className="modal-plant-details-card__term">Utplantering</h3>
            <dd className="modal-plant-details-card__definition">
              {hasMovePlantOutdoorRange ? (
                <>{formatRange(plant.movePlantOutdoor.start, plant.movePlantOutdoor.end)}</>
              ) : null}

              {hasMovePlantOutdoorDescription ? (
                <>
                  {hasMovePlantOutdoorRange ? <br /> : null}
                  <span className="modal-plant-details-card__description">
                    {plant.movePlantOutdoor.description}
                  </span>
                </>
              ) : null}
            </dd>
          </div>
        ) : null}

        {plant.url ? (
          <div className="modal-plant-details-card__item">
            <h3 className="modal-plant-details-card__term">Källa</h3>
            <dd className="modal-plant-details-card__definition">
              <a
                href={plant.url}
                target="_blank"
                rel="noreferrer"
                className="modal-plant-details-card__link"
              >
                Öppna på Impecta
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
};

