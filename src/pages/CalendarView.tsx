import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { CalendarLegend } from "../components/CalendarLegend/CalendarLegend";
import { CalendarMonth } from "../components/CalendarMonth/CalendarMonth";
import { CalendarMonthNavigation } from "../components/CalendarMonthNavigation/CalendarMonthNavigation";
import { CalendarTooltip } from "../components/CalendarTooltip/CalendarTooltip";
import { Panel } from "../components/Panel/Panel";
import { PlanContext } from "../context/PlanContext";
import { recommendationsToEvents } from "../helpers/calendar/events";
import type { CalendarEvent } from "../helpers/calendar/events";
import { getPlants } from "../services/plantsService";

export const CalendarView = () => {
  const { state } = useContext(PlanContext);
  const { recommendations, harvestDateIso, selectedPlantIds } = state;
  const [plants, setPlants] = useState<Awaited<ReturnType<typeof getPlants>>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hoveredDay, setHoveredDay] = useState<{
    date: Date;
    events: CalendarEvent[];
    position: { x: number; y: number };
  } | null>(null);

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

  // Convert recommendations to events
  useEffect(() => {
    if (recommendations.length > 0 && harvestDateIso && plants.length > 0) {
      // Filter recommendations to only include selected plants
      const selectedPlantSet = new Set(selectedPlantIds);
      const filteredRecommendations = recommendations.filter((rec) => selectedPlantSet.has(rec.plantId));
      
      const calendarEvents = recommendationsToEvents(filteredRecommendations, plants, harvestDateIso);
      setEvents(calendarEvents);

      // Set current month to first month with events if available
      if (calendarEvents.length > 0) {
        const firstEventDate = new Date(calendarEvents[0].date);
        setCurrentMonth(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
      }
    } else {
      setEvents([]);
    }
  }, [recommendations, harvestDateIso, plants, selectedPlantIds]);

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
    if (dayEvents.length > 0) {
      setHoveredDay({ date, events: dayEvents, position });
    } else {
      setHoveredDay(null);
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

  if (recommendations.length === 0 || !harvestDateIso) {
    return (
      <section>
        <h1>Kalender</h1>
        <p>Ingen plan skapad än. Gå till planeraren för att skapa en plan.</p>
        <Link to="/planner">Gå till planeraren</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Kalender</h1>
      <Panel>
        <CalendarMonthNavigation
          currentMonth={currentMonth}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />
        <CalendarLegend />
        <CalendarMonth month={currentMonth} events={events} onDayHover={handleDayHover} />
      </Panel>
      {hoveredDay && (
        <CalendarTooltip
          events={hoveredDay.events}
          position={hoveredDay.position}
          isVisible={true}
        />
      )}
    </section>
  );
};


