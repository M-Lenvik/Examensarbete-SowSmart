import React from "react";
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

const formatDaysToWeeks = (days: number | null): string | null => {
  if (days === null) return null;
  const weeks = Math.round(days / 7);
  if (weeks === 0) return "mindre än en vecka";
  if (weeks === 1) return "ca en vecka";
  return `ca ${weeks} veckor`;
};

const buildPlantingGuide = (plant: Plant): { description?: string; instructions: string[] } => {
  const instructions: string[] = [];

  // Planting method
  const plantingMethodText = formatPlantingMethod(plant.plantingMethod);
  const sowingWindow = plant.plantingMethod === "indoor"
    ? formatRange(plant.plantingWindows.indoors.start, plant.plantingWindows.indoors.end)
    : formatRange(plant.plantingWindows.outdoors.start, plant.plantingWindows.outdoors.end);
  
  if (sowingWindow) {
    instructions.push(`Du sår ${plant.name} ${plantingMethodText.toLowerCase()} i ${sowingWindow}.`);
  } else {
    instructions.push(`Du sår ${plant.name} ${plantingMethodText.toLowerCase()}.`);
  }

  // Harvest window
  if (plant.harvestTime?.start && plant.harvestTime?.end) {
    const startText = toTrimmedString(plant.harvestTime.start);
    const endText = toTrimmedString(plant.harvestTime.end);
    if (startText && endText) {
      instructions.push(`I ${startText} börjar frukterna mogna och du kan skörda fram till ungefär ${endText}.`);
    } else if (startText) {
      instructions.push(`I ${startText} börjar frukterna mogna och du kan börja skörda.`);
    }
  }

  // Germination time and soil
  if (plant.germinationTime) {
    // Add empty line for new paragraph
    if (instructions.length > 0) {
      instructions.push("");
    }
    let grotidText = `${plant.name} gror efter ca ${plant.germinationTime}`;
    
    if (plant.growingTemperature) {
      grotidText += `, under grodtiden ska jorden hållas mellan ${plant.growingTemperature}`;
    }
    
    if (plant.soilMix) {
      grotidText += `. Använd ${plant.soilMix} när du sår.`;
    } else {
      grotidText += ".";
    }

    // Potting up (for indoor)
    if (plant.plantingMethod === "indoor") {
      grotidText += " När plantan fått sina karaktärsblad (det andra bladparet) är det dags att plantera upp i en större kruka.";
      instructions.push(grotidText);
      instructions.push("");
    } else {
      instructions.push(grotidText);
    }
  } else if (plant.plantingMethod === "indoor") {
    // Potting up (for indoor) - if germination text doesn't exist
    instructions.push("När plantan fått sina karaktärsblad (det andra bladparet) är det dags att plantera upp i en större kruka.");
    instructions.push("");
  }

  // Transplanting and hardening
  let utplanteringText = "";
  if (plant.daysIndoorGrowth !== null && plant.hardeningDays !== null) {
    const weeksText = formatDaysToWeeks(plant.daysIndoorGrowth);
    if (weeksText) {
      utplanteringText = `Efter ${weeksText} är det dags att plantera ut. Du börjar med att avhärda i ${plant.hardeningDays} dagar.`;
    }
  } else if (plant.hardeningDays !== null) {
    utplanteringText = `Du börjar med att avhärda i ${plant.hardeningDays} dagar innan du planterar ut.`;
  }

  // Frost warning - combine with transplanting/hardening text on same line
  if (plant.frostTolerant === false) {
    if (utplanteringText) {
      utplanteringText += ` Se upp med frosten, ${plant.name} tål inte kalla temperaturer. Du kan behöva ta in den under natten även efter avhärdning.`;
    } else {
      instructions.push(`Se upp med frosten, ${plant.name} tål inte kalla temperaturer. Du kan behöva ta in den under natten även efter avhärdning.`);
    }
  }

  if (utplanteringText) {
    instructions.push(utplanteringText);
  }

  // Growing location
  if (plant.growingLocation) {
    instructions.push(`Placera ${plant.name} i ${plant.growingLocation}.`);
    instructions.push("");
  }

  // Harvest time
  if (plant.totalDaysFromSeed !== null) {
    const weeksText = formatDaysToWeeks(plant.totalDaysFromSeed);
    if (weeksText) {
      instructions.push(`Efter ${weeksText} från sådd kan du börja skörda dina första frukter.`);
    } else {
      instructions.push(`Efter ${plant.totalDaysFromSeed} dagar från sådd kan du börja skörda dina första frukter.`);
    }
  }
    
  // Care instructions
  if (plant.careInstructions) {
    instructions.push(plant.careInstructions);
  }

  return {
    description: plant.description || undefined,
    instructions,
  };
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

  const plantingGuide = buildPlantingGuide(plant);

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
      
      {(plantingGuide.description || plantingGuide.instructions.length > 0) && (
        <div className="modal-plant-details-card__guide">
          {plantingGuide.description && (
            <p className="modal-plant-details-card__guide-description">
              {plantingGuide.description}
            </p>
          )}
          {plantingGuide.instructions.length > 0 && (
            <>
              <h3 className="modal-plant-details-card__guide-title">
                Gör såhär för att odla {plant.name}
              </h3>
              <p className="modal-plant-details-card__guide-text">
                {plantingGuide.instructions.map((instruction, index) => {
                  // Empty string means empty line (two line breaks for new paragraph)
                  if (instruction === "") {
                    return (
                      <React.Fragment key={index}>
                        <br />
                        <br />
                      </React.Fragment>
                    );
                  }
                  return (
                    <span key={index}>
                      {instruction}
                      {index < plantingGuide.instructions.length - 1 && 
                       plantingGuide.instructions[index + 1] !== "" && <br />}
                    </span>
                  );
                })}
              </p>
            </>
          )}
        </div>
      )}

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

        <div className="modal-plant-details-card__item">
          <h3 className="modal-plant-details-card__term">Avhärdning</h3>
          <dd className="modal-plant-details-card__definition">{formatDaysOrMissing(plant.hardeningDays)}</dd>
        </div>


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

