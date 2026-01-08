import { parseDateIso } from "../../helpers/date/date";
import { getTaskTypeLabel } from "../../helpers/calendar/tasks";
import type { CalendarEvent } from "../../helpers/calendar/events";
import "./CalendarTooltip.scss";

type CalendarTooltipProps = {
  events: CalendarEvent[];
  position: { x: number; y: number };
  isVisible: boolean;
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

  // Calculate tooltip position to avoid going off-screen
  // Simple approach: position above by default, adjust if needed
  const tooltipOffset = 8;
  const estimatedTooltipWidth = 20 * 16; // max-width in px
  const estimatedTooltipHeight = 10 * 16; // estimated height in px
  
  let tooltipLeft = position.x;
  let tooltipTop = position.y;
  let transformX = "-50%";
  let transformY = "calc(-100% - 0.5rem)";

  const viewportWidth = window.innerWidth;

  // Adjust if tooltip would go off right edge
  if (tooltipLeft + estimatedTooltipWidth / 2 > viewportWidth - 16) {
    tooltipLeft = viewportWidth - estimatedTooltipWidth / 2 - 16;
  }

  // Adjust if tooltip would go off left edge
  if (tooltipLeft - estimatedTooltipWidth / 2 < 16) {
    tooltipLeft = estimatedTooltipWidth / 2 + 16;
  }

  // Check if tooltip would go above viewport
  if (tooltipTop - estimatedTooltipHeight - tooltipOffset < 0) {
    // Position below instead
    tooltipTop = position.y + tooltipOffset;
    transformY = "0.5rem";
  }

  const tooltipStyle = {
    left: `${tooltipLeft}px`,
    top: `${tooltipTop}px`,
    transform: `translate(${transformX}, ${transformY})`,
  };

  return (
    <div
      className="calendar-tooltip"
      role="tooltip"
      aria-live="polite"
      style={tooltipStyle}
    >
      {groupedEvents.map((group, groupIndex) => (
        <div key={`${group.date}-${group.type}-${groupIndex}`} className="calendar-tooltip__group">
          <div className="calendar-tooltip__date">{formatDateSwedish(group.date)}</div>
          <div className="calendar-tooltip__event-type">
            {getTaskTypeLabel(group.type)}
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

