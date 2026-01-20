import { useState } from "react";
import { RemoveButton } from "../RemoveButton/RemoveButton";
import { EventIconWithLabel } from "../EventIconWithLabel/EventIconWithLabel";
import { Input } from "../Input/Input";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";
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
  onChangeHarvestDate?: (plantId: number, dateIso: string) => void; // Callback to change harvest date for a specific plant
  recommendations?: Recommendation[]; // Recommendations for date display
  harvestDateIso?: string | null; // Harvest date for date display (fallback)
  harvestDatesByPlant?: Map<number, string>; // Map of plantId -> harvest date ISO
  showWarningsInline?: boolean; // If true, show all messages inline under each plant. If false, show informative date information in expandable section (default)
};

export const SelectedPlantsList = ({
  selectedPlants,
  plantMessages,
  onOpenDetails,
  onRemove,
  onChangeHarvestDate,
  recommendations,
  harvestDateIso,
  harvestDatesByPlant,
  showWarningsInline = false,
}: SelectedPlantsListProps) => {
  const [isInformationExpanded, setIsInformationExpanded] = useState(false);
  const [editingHarvestDateFor, setEditingHarvestDateFor] = useState<number | null>(null);
  const [plantToRemove, setPlantToRemove] = useState<Plant | null>(null);

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
        date: formatDateSwedishWithoutYear(recommendation.indoorSowDate),
        eventType: "sow-indoor",
      });
    } else if (recommendation?.outdoorSowDate) {
      dateInfos.push({
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
          date: formatDateSwedishWithoutYear(sowResult.sowDateIso),
          eventType,
        });
      }
    }

    // Avhärdning: datum
    if (recommendation?.hardenStartDate) {
      dateInfos.push({
        date: formatDateSwedishWithoutYear(recommendation.hardenStartDate),
        eventType: "harden-start",
      });
    }

    // Utplantering: datum
    if (recommendation?.movePlantOutdoorDate) {
      dateInfos.push({
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
        date: formatDateSwedishWithoutYear(plantHarvestDate),
        eventType: "harvest",
      });
    }

    return dateInfos;
  };

  // Check if a message key is informative date information (should be in expandable section)
  const isInformativeDateInfo = (key: PlantSowResultKey): boolean => {
    return key === "harvestDateBeforeHarvestWindow" || key === "harvestDateAfterHarvestWindow";
  };

  // Separate messages into important (direct display) and informative date information (expandable)
  // Only collect informative date information if showWarningsInline is false (they'll be shown inline otherwise)
  const informativeDateInfo: Array<{ plant: Plant; message: PlantSowResult }> = [];
  
  if (!showWarningsInline) {
    // Collect all informative date information for expandable section
    selectedPlants.forEach((plant) => {
      const sowResult = plantMessages?.get(plant.id);
      if (sowResult && isInformativeDateInfo(sowResult.key)) {
        informativeDateInfo.push({ plant, message: sowResult });
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
                // If showWarningsInline is true, show all messages inline (including informative)
                // If showWarningsInline is false, only show important messages directly (not informative date information)
                // Also don't show message if sow date is already displayed in date list (when key is "harvestDate")
                const hasSowDateInList = dateInfos.some((info) => info.eventType === "sow-indoor" || info.eventType === "sow-outdoor");
                const shouldHideMessage = sowResult?.key === "harvestDate" && hasSowDateInList;
                const showMessage = sowResult && !shouldHideMessage && (showWarningsInline || !isInformativeDateInfo(sowResult.key));
                // Check if this plant has informative date information (should show asterisk)
                const hasInformativeDateInfo = sowResult && isInformativeDateInfo(sowResult.key);
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
                              {hasInformativeDateInfo && <span className="selected-plants-list__info-asterisk" aria-label="Information om valt datum">*</span>}
                            </button>
                          ) : (
                            <>
                              <span className="selected-plants-list__name">{plant.name}</span>
                              {hasInformativeDateInfo && <span className="selected-plants-list__info-asterisk" aria-label="Information om valt datum">*</span>}
                            </>
                          )}
                        </div>
                        {onRemove && (
                          <RemoveButton
                            onClick={(event) => {
                              event.stopPropagation();
                              setPlantToRemove(plant);
                            }}
                            ariaLabel={`Ta bort ${plant.name}`}
                          />
                        )}
                      </div>
                      {dateInfos.length > 0 && (
                        <div className="selected-plants-list__dates-grid">
                          {dateInfos.map((dateInfo, index) => (
                            <EventIconWithLabel
                              key={index}
                              eventType={dateInfo.eventType}
                              size="small"
                              showDate={true}
                              date={dateInfo.date}
                              className="selected-plants-list__date-item"
                            />
                          ))}
                        </div>
                      )}
                      {onChangeHarvestDate && (
                        <div className="selected-plants-list__harvest-date-control">
                          {(() => {
                            const plantHarvestDate = 
                              harvestDatesByPlant?.get(plant.id) || 
                              harvestDateIso;
                            const isEditing = editingHarvestDateFor === plant.id;
                            
                            if (isEditing) {
                              return (
                                <div className="selected-plants-list__harvest-date-input-wrapper">
                                  <Input
                                    id={`harvest-date-${plant.id}`}
                                    type="date"
                                    value={plantHarvestDate || ""}
                                    onChange={(event) => {
                                      const newDate = event.target.value;
                                      if (newDate) {
                                        onChangeHarvestDate(plant.id, newDate);
                                        // Close edit mode when a date is selected
                                        setEditingHarvestDateFor(null);
                                      }
                                    }}
                                    onBlur={() => {
                                      // Close edit mode when date picker closes
                                      setEditingHarvestDateFor(null);
                                    }}
                                    aria-label={`Välj skördedatum för ${plant.name}`}
                                  />
                                  <button
                                    type="button"
                                    className="selected-plants-list__harvest-date-cancel"
                                    onClick={() => setEditingHarvestDateFor(null)}
                                    aria-label="Avbryt"
                                  >
                                    Avbryt
                                  </button>
                                </div>
                              );
                            }
                            
                            return (
                              <button
                                type="button"
                                className="selected-plants-list__harvest-date-button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setEditingHarvestDateFor(plant.id);
                                }}
                                aria-label={plantHarvestDate ? `Ändra skördedatum för ${plant.name}` : `Sätt skördedatum för ${plant.name}`}
                              >
                                {plantHarvestDate ? "Ändra skördedatum" : "Sätt skördedatum"}
                              </button>
                            );
                          })()}
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
      {informativeDateInfo.length > 0 && (
        <div className="selected-plants-list__information">
          <button
            type="button"
            className="selected-plants-list__information-button"
            onClick={() => setIsInformationExpanded(!isInformationExpanded)}
            aria-expanded={isInformationExpanded}
            aria-label={`${isInformationExpanded ? "Dölj" : "Visa"} information om några av dina valda datum`}
          >
            <span className="selected-plants-list__information-title">
              <span className="selected-plants-list__info-asterisk" aria-label="Information om valt datum">*</span>
              Information om några av dina valda datum ({informativeDateInfo.length})
            </span>
            <span className={`selected-plants-list__information-icon ${isInformationExpanded ? "selected-plants-list__information-icon--expanded" : ""}`}>
              ▼
            </span>
          </button>
          {isInformationExpanded && (
            <ul className="selected-plants-list__information-list">
              {informativeDateInfo.map(({ plant, message }) => (
                <li key={plant.id} className="selected-plants-list__information-item">
                  <div className="selected-plants-list__information-plant-name">
                    {onOpenDetails ? (
                      <button
                        type="button"
                        className="selected-plants-list__information-plant-button"
                        onClick={() => handlePlantClick(plant)}
                        aria-label={`Öppna detaljer för ${plant.name}`}
                      >
                        {plant.name}
                      </button>
                    ) : (
                      <span>{plant.name}</span>
                    )}
                  </div>
                  <p className="selected-plants-list__information-message">{message.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {plantToRemove && (
        <ConfirmDialog
          isOpen={!!plantToRemove}
          title="Ta bort frösort"
          message={`Är du säker på att du vill ta bort ${plantToRemove.name}?`}
          confirmText="Ja, ta bort"
          cancelText="Nej"
          onConfirm={() => {
            if (plantToRemove && onRemove) {
              onRemove(plantToRemove.id);
            }
            setPlantToRemove(null);
          }}
          onCancel={() => setPlantToRemove(null)}
        />
      )}
    </div>
  );
};

