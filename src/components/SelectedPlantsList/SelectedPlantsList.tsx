import { RemoveButton } from "../RemoveButton/RemoveButton";
import { CalendarEventIcon } from "../CalendarEventIcon/CalendarEventIcon";
import type { Plant } from "../../models/Plant";
import type { Recommendation } from "../../reducers/planReducer";
import { formatDateSwedishWithoutYear } from "../../helpers/date/date";
import "./SelectedPlantsList.scss";

type SelectedPlantsListProps = {
  selectedPlants: Plant[];
  plantMessages?: Map<number, string>; // Map of plantId -> sow result message
  onOpenDetails?: (plant: Plant) => void; // Callback to open plant detail modal
  onRemove?: (plantId: number) => void; // Callback to remove plant from selection
  recommendations?: Recommendation[]; // Recommendations for date display
  harvestDateIso?: string | null; // Harvest date for date display
};

export const SelectedPlantsList = ({
  selectedPlants,
  plantMessages,
  onOpenDetails,
  onRemove,
  recommendations,
  harvestDateIso,
}: SelectedPlantsListProps) => {
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

    // Skörd: datum
    if (harvestDateIso) {
      dateInfos.push({
        label: "Skörd",
        date: formatDateSwedishWithoutYear(harvestDateIso),
        eventType: "harvest",
      });
    }

    return dateInfos;
  };

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
                const message = plantMessages?.get(plant.id);
                const dateInfos = getPlantDateInfo(plant);
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
                      {message && (
                        <span className="selected-plants-list__message">
                          {message}
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
    </div>
  );
};

