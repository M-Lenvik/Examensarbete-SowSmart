import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/shared/Button/Button";
import { CalendarLegend } from "../components/calendar/CalendarLegend/CalendarLegend";
import { CalendarMonth } from "../components/calendar/CalendarMonth/CalendarMonth";
import { CalendarMonthNavigation } from "../components/calendar/CalendarMonthNavigation/CalendarMonthNavigation";
import { CalendarTooltip } from "../components/calendar/CalendarTooltip/CalendarTooltip";
import { Panel } from "../components/shared/Panel/Panel";
import { FilterDropdown } from "../components/shared/FilterDropdown/FilterDropdown";
import { PlanContext } from "../context/PlanContext";
import { recommendationsToEvents } from "../helpers/calendar/events";
import type { CalendarEvent } from "../helpers/calendar/events";
import type { Plant } from "../models/Plant";
import { getPlants } from "../services/plantsService";
import "./CalendarView.scss";

export const CalendarView = () => {
  const navigate = useNavigate();
  const { state } = useContext(PlanContext);
  const { recommendations, selectedPlantIds } = state;
  const [plants, setPlants] = useState<Awaited<ReturnType<typeof getPlants>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    events: CalendarEvent[];
    position: { x: number; y: number };
  } | null>(null);
  const [selectedFilterIds, setSelectedFilterIds] = useState<string[]>([]);
  const tooltipHideTimeoutRef = useRef<number | null>(null);

  // Load plants
  useEffect(() => {
    const loadPlants = async () => {
      try {
        const loadedPlants = await getPlants();
        setPlants(loadedPlants);
      } catch (error) {
        console.error("Failed to load plants:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlants();
  }, []);

  // Convert filterIds to plantIds that should be shown
  const getFilteredPlantIds = useMemo(() => {
    // If no filters selected, show all selected plants
    if (selectedFilterIds.length === 0) {
      return selectedPlantIds;
    }

    // If "all" is selected, show all selected plants
    if (selectedFilterIds.includes("all")) {
      return selectedPlantIds;
    }

    const filteredPlantIds = new Set<number>();

    // Get selected plants for building filter options
    const selectedSet = new Set(selectedPlantIds);
    const selectedPlants = plants.filter((plant) => selectedSet.has(plant.id));

    // Group by subcategory
    const subcategoryMap = new Map<string, Plant[]>();
    selectedPlants.forEach((plant) => {
      const subcategory = plant.subcategory || "Övrigt";
      if (!subcategoryMap.has(subcategory)) {
        subcategoryMap.set(subcategory, []);
      }
      subcategoryMap.get(subcategory)!.push(plant);
    });

    // Process each selected filter
    selectedFilterIds.forEach((filterId) => {
      if (filterId.startsWith("subcategory-")) {
        // Add all plants in this subcategory
        const subcategory = filterId.replace("subcategory-", "");
        const plantsInSubcategory = subcategoryMap.get(subcategory) || [];
        plantsInSubcategory.forEach((plant) => {
          filteredPlantIds.add(plant.id);
        });
      } else if (filterId.startsWith("plant-")) {
        // Add this specific plant
        const plantId = parseInt(filterId.replace("plant-", ""), 10);
        if (!isNaN(plantId)) {
          filteredPlantIds.add(plantId);
        }
      }
    });

    return Array.from(filteredPlantIds);
  }, [selectedFilterIds, selectedPlantIds, plants]);

  // Convert recommendations to events
  useEffect(() => {
    if (recommendations.length > 0 && plants.length > 0) {
      // Filter recommendations to only include selected plants (from filter)
      const filteredPlantSet = new Set(getFilteredPlantIds);
      const filteredRecommendations = recommendations.filter((rec) => filteredPlantSet.has(rec.plantId));
      
      const calendarEvents = recommendationsToEvents(filteredRecommendations, plants);
      setEvents(calendarEvents);

      // Set current month to first month with events if available
      if (calendarEvents.length > 0) {
        const firstEventDate = new Date(calendarEvents[0].date);
        setCurrentMonth(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
      }
    } else {
      setEvents([]);
    }
  }, [recommendations, plants, getFilteredPlantIds]);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const handleDayHover = (
    date: Date,
    dayEvents: CalendarEvent[],
    position: { x: number; y: number }
  ) => {
    if (tooltipHideTimeoutRef.current) {
      clearTimeout(tooltipHideTimeoutRef.current);
    }

    if (dayEvents.length > 0) {
      setHoveredDay({ date, events: dayEvents, position });
    } else {
      tooltipHideTimeoutRef.current = setTimeout(() => {
        setHoveredDay(null);
      }, 200);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (tooltipHideTimeoutRef.current) {
      clearTimeout(tooltipHideTimeoutRef.current);
    }
  };

  if (isLoading) {
    return (
      <section>
        <h1>Kalender</h1>
        <p>Laddar...</p>
      </section>
    );
  }

  if (recommendations.length === 0) {
    const hasPlants = selectedPlantIds.length > 0;
    
    return (
      <section>
        <h1>Kalender</h1>
        <Panel>
          <p>{hasPlants ? "Du har inte valt skördedatum ännu." : "Du har inte valt några fröer ännu. "}</p>
          <p>
            <Link to={hasPlants ? "/planner" : "/plants"}>
              {hasPlants ? "Gå till planeraren för att välja skördedatum och beräkna plan." : "Gå till fröbanken för att välja fröer."}
            </Link>
          </p>
        </Panel>
      </section>
    );
  }

  return (
    <section className="calendar-view">
      <h1>Kalender</h1>
      <Panel>
        <Panel title="" variant="nested">
          <FilterDropdown
            selectedPlantIds={selectedPlantIds}
            plants={plants}
            selectedFilterIds={selectedFilterIds}
            onFilterChange={setSelectedFilterIds}
          />
        </Panel>
        <CalendarMonthNavigation
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarMonth month={currentMonth} events={events} onDayHover={handleDayHover} />
        <CalendarLegend />
      </Panel>
      <Panel>
        <Button onClick={() => navigate("/my-garden")}>
          Till min frösida
        </Button>
      </Panel>
      {hoveredDay && (
        <CalendarTooltip
          events={hoveredDay.events}
          position={hoveredDay.position}
          isVisible={true}
          onMouseEnter={handleTooltipMouseEnter}
        />
      )}
    </section>
  );
};


