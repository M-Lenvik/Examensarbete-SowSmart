import { parseDateIso } from "../../helpers/date/date";
import type { CalendarEvent } from "../../helpers/calendar/events";
import "./CalendarTooltip.scss";

type CalendarTooltipProps = {
  events: CalendarEvent[];
  position: { x: number; y: number };
  isVisible: boolean;
};

/**
 * Get label for event type.
 */
const getEventTypeLabel = (eventType: CalendarEvent["type"]): string => {
  switch (eventType) {
    case "sow-outdoor":
      return "Så utomhus";
    case "sow-indoor":
      return "Så inomhus";
    case "harden-start":
      return "Starta avhärdning";
    case "move-plant-outdoor":
      return "Flytta ut";
    case "harvest":
      return "Skörd";
    default:
      return eventType;
  }
};

/**
 * Format date to Swedish format (e.g., "15 mars 2026").
 */
const formatDateSwedish = (dateIso: string): string => {
  try {
    const date = parseDateIso(dateIso);
    return date.toLocaleDateString("sv-SE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateIso;
  }
};

/**
 * Group events by type (all events are on the same date).
 * Returns an array of groups, each containing date, type, and plant names.
 */
const groupEventsByType = (events: CalendarEvent[]): Array<{
  date: string;
  type: CalendarEvent["type"];
  plantNames: string[];
}> => {
  if (events.length === 0) {
    return [];
  }

  // All events are on the same date (same day)
  const date = events[0].date;
  const groups = new Map<CalendarEvent["type"], string[]>();

  events.forEach((event) => {
    if (!groups.has(event.type)) {
      groups.set(event.type, []);
    }
    groups.get(event.type)!.push(event.plantName);
  });

  return Array.from(groups.entries()).map(([type, plantNames]) => ({
    date,
    type,
    plantNames,
  }));
};

/**
 * Calendar tooltip component.
 * 
 * Displays a tooltip with event details when hovering over a calendar day
 * that has events. Groups events by date and type, showing plant names under each group.
 */
export const CalendarTooltip = ({ events, position, isVisible }: CalendarTooltipProps) => {
  if (!isVisible || events.length === 0) {
    return null;
  }

  const groupedEvents = groupEventsByType(events);

  return (
    <div
      className="calendar-tooltip"
      role="tooltip"
      aria-live="polite"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {groupedEvents.map((group, groupIndex) => (
        <div key={`${group.date}-${group.type}-${groupIndex}`} className="calendar-tooltip__group">
          <div className="calendar-tooltip__date">{formatDateSwedish(group.date)}</div>
          <div className="calendar-tooltip__event-type">
            {getEventTypeLabel(group.type)}
            {group.plantNames.length > 1 ? " för:" : ""}
          </div>
          <ul className="calendar-tooltip__plant-list">
            {group.plantNames.map((plantName, plantIndex) => (
              <li key={`${plantName}-${plantIndex}`} className="calendar-tooltip__plant-item">
                {plantName}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

