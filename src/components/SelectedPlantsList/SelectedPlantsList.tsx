import { useState } from "react";
import { RemoveButton } from "../RemoveButton/RemoveButton";
import { CalendarEventIcon } from "../CalendarEventIcon/CalendarEventIcon";
import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";
import type { PlantSowResult, PlantSowResultKey } from "../../helpers/date/dateValidation";
import { formatDateSwedishWithoutYear } from "../../helpers/date/date";
import "./SelectedPlantsList.scss";

type SelectedPlantsListProps = {
  selectedPlants: Plant[];
  plantMessages?: Map<number, PlantSowResult>; // Map of plantId -> sow result
  onOpenDetails?: (plant: Plant) => void; // Callback to open plant detail modal
  onRemove?: (plantId: number) => void; // Callback to remove plant from selection
  recommendations?: Recommendation[]; // Recommendations for date display
  harvestDateIso?: string | null; // Harvest date for date display (fallback)
  harvestDatesByPlant?: Map<number, string>; // Map of plantId -> harvest date ISO
  showWarningsInline?: boolean; // If true, show all warnings inline under each plant. If false, show informative warnings in expandable section (default)
};

export const SelectedPlantsList = ({
  selectedPlants,
  plantMessages,
  onOpenDetails,
  onRemove,
  recommendations,
  harvestDateIso,
  harvestDatesByPlant,
  showWarningsInline = false,
}: SelectedPlantsListProps) => {
  const [isWarningsExpanded, setIsWarningsExpanded] = useState(false);

  if (selectedPlants.length === 0) {
    return null;
  }

  // Capitalize first letter of string
  const capitalizeFirst = (str: string): string => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Group plants by subcategory
  const groupedPlants = selectedPlants.reduce((acc, plant) => {
    const subcategory = plant.subcategory || "Övrigt";
    if (!acc[subcategory]) {
      acc[subcategory] = [];
    }
    acc[subcategory].push(plant);
    return acc;
  }, {} as Record<string, typeof selectedPlants>);

  // Sort plants within each subcategory by name
  Object.keys(groupedPlants).forEach((subcategory) => {
    groupedPlants[subcategory].sort((a, b) => a.name.localeCompare(b.name, "sv"));
  });

  // Sort subcategories alphabetically
  const sortedSubcategories = Object.keys(groupedPlants).sort((a, b) => {
    if (a === "Övrigt") return 1;
    if (b === "Övrigt") return -1;
    return a.localeCompare(b, "sv");
  });

  const handlePlantClick = (plant: Plant) => {
    if (onOpenDetails) {
      onOpenDetails(plant);
    }
  };

  // Get recommendation for a plant
  const getPlantRecommendation = (plantId: number): Recommendation | undefined => {
    return recommendations?.find((rec) => rec.plantId === plantId);
  };

  // Date info type
  type DateInfo = {
    label: string;
    date: string;
    eventType: "sow-indoor" | "sow-outdoor" | "harden-start" | "move-plant-outdoor" | "harvest";
  };

  // Get date information for a plant as an array
  const getPlantDateInfo = (plant: Plant): DateInfo[] => {
    const recommendation = getPlantRecommendation(plant.id);
    const dateInfos: DateInfo[] = [];

    // Sådd: datum (indoor eller outdoor)
    // Prioritize recommendation if available, otherwise use sowDate from plantMessages if it's a valid date (harvestDate key)
    if (recommendation?.indoorSowDate) {
      dateInfos.push({
        label: "Sådd",
        date: formatDateSwedishWithoutYear(recommendation.indoorSowDate),
        eventType: "sow-indoor",
      });
    } else if (recommendation?.outdoorSowDate) {
      dateInfos.push({
        label: "Sådd",
        date: formatDateSwedishWithoutYear(recommendation.outdoorSowDate),
        eventType: "sow-outdoor",
      });
    } else {
      // No recommendation yet - try to get sow date from plantMessages if it has a sow date
      // Show sow date for harvestDate (within window), harvestDateBeforeHarvestWindow, and harvestDateAfterHarvestWindow
      const sowResult = plantMessages?.get(plant.id);
      if (sowResult?.sowDateIso && (
        sowResult.key === "harvestDate" ||
        sowResult.key === "harvestDateBeforeHarvestWindow" ||
        sowResult.key === "harvestDateAfterHarvestWindow"
      )) {
        // Use sow date from plantMessages - assume indoor if plant uses indoor method
        const eventType = plant.plantingMethod === "indoor" ? "sow-indoor" : "sow-outdoor";
        dateInfos.push({
          label: "Sådd",
          date: formatDateSwedishWithoutYear(sowResult.sowDateIso),
          eventType,
        });
      }
    }

    // Avhärdning: datum
    if (recommendation?.hardenStartDate) {
      dateInfos.push({
        label: "Avhärdning",
        date: formatDateSwedishWithoutYear(recommendation.hardenStartDate),
        eventType: "harden-start",
      });
    }

    // Utplantering: datum
    if (recommendation?.movePlantOutdoorDate) {
      dateInfos.push({
        label: "Utplantering",
        date: formatDateSwedishWithoutYear(recommendation.movePlantOutdoorDate),
        eventType: "move-plant-outdoor",
      });
    }

    // Skörd: datum - prioritize recommendation.harvestDateIso (most accurate source)
    // Then fallback to harvestDatesByPlant, then global harvestDateIso
    const plantHarvestDate = 
      recommendation?.harvestDateIso || 
      harvestDatesByPlant?.get(plant.id) || 
      harvestDateIso;
    if (plantHarvestDate) {
      dateInfos.push({
        label: "Skörd",
        date: formatDateSwedishWithoutYear(plantHarvestDate),
        eventType: "harvest",
      });
    }

    return dateInfos;
  };

  // Check if a message key is an informative warning (should be in expandable section)
  const isInformativeWarning = (key: PlantSowResultKey): boolean => {
    return key === "harvestDateBeforeHarvestWindow" || key === "harvestDateAfterHarvestWindow";
  };

  // Separate messages into important (direct display) and informative warnings (expandable)
  // Only collect informative warnings if showWarningsInline is false (they'll be shown inline otherwise)
  const informativeWarnings: Array<{ plant: Plant; message: PlantSowResult }> = [];
  
  if (!showWarningsInline) {
    // Collect all informative warnings for expandable section
    selectedPlants.forEach((plant) => {
      const sowResult = plantMessages?.get(plant.id);
      if (sowResult && isInformativeWarning(sowResult.key)) {
        informativeWarnings.push({ plant, message: sowResult });
      }
    });
  }

  return (
    <div className="selected-plants-list">
      <div className="selected-plants-list__groups">
        {sortedSubcategories.map((subcategory) => (
          <div key={subcategory} className="selected-plants-list__group">
            <h3 className="selected-plants-list__subcategory-title">
              {capitalizeFirst(subcategory)}
            </h3>
            <ul className="selected-plants-list__list">
              {groupedPlants[subcategory].map((plant) => {
                const sowResult = plantMessages?.get(plant.id);
                const dateInfos = getPlantDateInfo(plant);
                // Show messages based on showWarningsInline prop
                // If showWarningsInline is true, show all warnings inline (including informative)
                // If showWarningsInline is false, only show important messages directly (not informative warnings)
                // Also don't show message if sow date is already displayed in date list (when key is "harvestDate")
                const hasSowDateInList = dateInfos.some((info) => info.eventType === "sow-indoor" || info.eventType === "sow-outdoor");
                const shouldHideMessage = sowResult?.key === "harvestDate" && hasSowDateInList;
                const showMessage = sowResult && !shouldHideMessage && (showWarningsInline || !isInformativeWarning(sowResult.key));
                return (
                  <li key={plant.id} className="selected-plants-list__item">
                    <div className="selected-plants-list__plant-info">
                      <div className="selected-plants-list__plant-name-row">
                        <div className="selected-plants-list__plant-name-wrapper">
                          {onOpenDetails ? (
                            <button
                              type="button"
                              className="selected-plants-list__plant-button"
                              onClick={() => handlePlantClick(plant)}
                              aria-label={`Öppna detaljer för ${plant.name}`}
                            >
                              <span className="selected-plants-list__name">{plant.name}</span>
                            </button>
                          ) : (
                            <span className="selected-plants-list__name">{plant.name}</span>
                          )}
                        </div>
                        {onRemove && (
                          <RemoveButton
                            onClick={(event) => {
                              event.stopPropagation();
                              onRemove(plant.id);
                            }}
                            ariaLabel={`Ta bort ${plant.name}`}
                          />
                        )}
                      </div>
                      {dateInfos.length > 0 && (
                        <div className="selected-plants-list__dates-grid">
                          {dateInfos.map((dateInfo, index) => (
                            <div key={index} className="selected-plants-list__date-item">
                              <CalendarEventIcon eventType={dateInfo.eventType} size="small" />
                              <span className="selected-plants-list__date-text">
                                {dateInfo.label} {dateInfo.date}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {showMessage && (
                        <span className="selected-plants-list__message">
                          {sowResult.message}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {informativeWarnings.length > 0 && (
        <div className="selected-plants-list__warnings">
          <button
            type="button"
            className="selected-plants-list__warnings-button"
            onClick={() => setIsWarningsExpanded(!isWarningsExpanded)}
            aria-expanded={isWarningsExpanded}
            aria-label={`${isWarningsExpanded ? "Dölj" : "Visa"} varningar`}
          >
            <span className="selected-plants-list__warnings-title">
              Varningar ({informativeWarnings.length})
            </span>
            <span className={`selected-plants-list__warnings-icon ${isWarningsExpanded ? "selected-plants-list__warnings-icon--expanded" : ""}`}>
              ▼
            </span>
          </button>
          {isWarningsExpanded && (
            <ul className="selected-plants-list__warnings-list">
              {informativeWarnings.map(({ plant, message }) => (
                <li key={plant.id} className="selected-plants-list__warning-item">
                  <div className="selected-plants-list__warning-plant-name">
                    {onOpenDetails ? (
                      <button
                        type="button"
                        className="selected-plants-list__warning-plant-button"
                        onClick={() => handlePlantClick(plant)}
                        aria-label={`Öppna detaljer för ${plant.name}`}
                      >
                        {plant.name}
                      </button>
                    ) : (
                      <span>{plant.name}</span>
                    )}
                  </div>
                  <p className="selected-plants-list__warning-message">{message.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

