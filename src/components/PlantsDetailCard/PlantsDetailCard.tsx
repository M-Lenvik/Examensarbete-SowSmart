import type { Plant } from "../../models/Plant";
import { FALLBACK_PLANT_IMAGE_SRC, handleImageError } from "../../helpers/image";
import "./PlantsDetailCard.scss";

type PlantsDetailCardProps = {
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
    case "both":
      return "Både och";
  }
};

export const PlantsDetailCard = ({ plant }: PlantsDetailCardProps) => {
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
    <article className="plants-detail-card">
      {plant.imageUrl ? (
        <img
          className="plants-detail-card__image"
          src={plant.imageUrl}
          alt={`Bild på ${plant.name}`}
          loading="lazy"
          onError={(event) => handleImageError(event, FALLBACK_PLANT_IMAGE_SRC)}
        />
      ) : null}
      <dl className="plants-detail-card__definition-list">

        <dt>Såmetod</dt>
        <dd>{formatPlantingMethod(plant.plantingMethod)}</dd>

        {hasIndoorsWindow ? (
          <>
            <dt>Såfönster (inne)</dt>
            <dd>
              {formatRange(plant.plantingWindows.indoors.start, plant.plantingWindows.indoors.end)}
            </dd>
          </>
        ) : null}

        {hasOutdoorsWindow ? (
          <>
            <dt>Såfönster (ute)</dt>
            <dd>
              {formatRange(plant.plantingWindows.outdoors.start, plant.plantingWindows.outdoors.end)}
            </dd>
          </>
        ) : null}

        <dt>Dagar ute till skörd</dt>
        <dd>{formatDaysOrMissing(plant.daysOutdoorToHarvest)}</dd>

        <dt>Dagar inomhus (till utplantering)</dt>
        <dd>{formatDaysOrMissing(plant.daysIndoorGrowth)}</dd>

        <dt>Avhärdning</dt>
        <dd>{formatDaysOrMissing(plant.hardeningDays)}</dd>

        {plant.movePlantOutdoor &&
        (hasMovePlantOutdoorRange || hasMovePlantOutdoorDescription) ? (
          <>
            <dt>Utplantering</dt>
            <dd>
              {hasMovePlantOutdoorRange ? (
                <>{formatRange(plant.movePlantOutdoor.start, plant.movePlantOutdoor.end)}</>
              ) : null}

              {hasMovePlantOutdoorDescription ? (
                <>
                  {hasMovePlantOutdoorRange ? <br /> : null}
                  <span className="plants-detail-card__description">
                    {plant.movePlantOutdoor.description}
                  </span>
                </>
              ) : null}
            </dd>
          </>
        ) : null}

        {plant.url ? (
          <>
            <dt>Källa</dt>
            <dd>
              <a
                href={plant.url}
                target="_blank"
                rel="noreferrer"
                className="plants-detail-card__link"
              >
                Öppna på Impecta
              </a>
            </dd>
          </>
        ) : null}
      </dl>
    </article>
  );
};


