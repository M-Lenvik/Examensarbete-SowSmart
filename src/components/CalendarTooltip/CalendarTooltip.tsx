import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { formatDateSwedish } from "../../helpers/date/date";
import { getTaskTypeLabel } from "../../helpers/calendar/tasks";
import type { CalendarEvent, CalendarEventType } from "../../helpers/calendar/events";
import "./CalendarTooltip.scss";

type CalendarTooltipProps = {
  events: CalendarEvent[];
  position: { x: number; y: number };
  isVisible: boolean;
  onMouseEnter?: () => void;
};

/**
 * Capitalize first letter of string.
 */
const capitalizeFirst = (str: string): string => {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Group events by type (all events are on the same date).
 * Returns an array of groups, each containing date, type, and plant names.
 */
const groupEventsByType = (events: CalendarEvent[]): Array<{
  date: string;
  type: CalendarEventType;
  plantNames: string[];
}> => {
  if (events.length === 0) {
    return [];
  }

  // All events are on the same date (same day)
  const date = events[0].date;
  const groups = new Map<CalendarEventType, string[]>();

  events.forEach((event) => {
    if (!groups.has(event.type)) {
      groups.set(event.type, []);
    }
    // Format: "Subcategory - plantname" with capitalized subcategory
    const displayName = event.plantSubcategory 
      ? `${capitalizeFirst(event.plantSubcategory)} - ${event.plantName}`
      : event.plantName;
    groups.get(event.type)!.push(displayName);
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
export const CalendarTooltip = ({ events, position, isVisible, onMouseEnter }: CalendarTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>({
    left: `${position.x}px`,
    top: `${position.y}px`,
  });

  useEffect(() => {
    if (!tooltipRef.current || !isVisible) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;
    const tooltipOffset = 8;

    let left = position.x;
    let top = position.y;
    let transformX = "-50%";
    let transformY = "calc(-100% - 0.5rem)";

    // Calculate actual tooltip dimensions
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    // Horizontal positioning - prefer center alignment
    const halfWidth = tooltipWidth / 2;
    
    // Check if tooltip would go off right edge
    if (left + halfWidth > viewportWidth - padding) {
      // Align to right edge
      left = viewportWidth - padding;
      transformX = "-100%";
    }
    
    // Check if tooltip would go off left edge
    if (left - halfWidth < padding) {
      // Align to left edge
      left = padding;
      transformX = "0%";
    }

    // Vertical positioning - prefer above, fallback to below
    const spaceAbove = position.y;
    const spaceBelow = viewportHeight - position.y;
    
    if (spaceAbove >= tooltipHeight + tooltipOffset + padding) {
      // Position above
      top = position.y;
      transformY = "calc(-100% - 0.5rem)";
    } else if (spaceBelow >= tooltipHeight + tooltipOffset + padding) {
      // Position below
      top = position.y;
      transformY = "0.5rem";
    } else {
      // Not enough space above or below - position where there's most space
      if (spaceAbove > spaceBelow) {
        top = padding;
        transformY = "0%";
      } else {
        top = viewportHeight - tooltipHeight - padding;
        transformY = "0%";
      }
    }

    setTooltipStyle({
      left: `${left}px`,
      top: `${top}px`,
      transform: `translate(${transformX}, ${transformY})`,
    });
  }, [position, isVisible]);

  if (!isVisible || events.length === 0) {
    return null;
  }

  const groupedEvents = groupEventsByType(events);

  return (
    <div
      ref={tooltipRef}
      className="calendar-tooltip"
      role="tooltip"
      aria-live="polite"
      style={tooltipStyle}
      onMouseEnter={onMouseEnter}
    >
      {groupedEvents.map((group, groupIndex) => (
        <div key={`${group.date}-${group.type}-${groupIndex}`} className="calendar-tooltip__group">
          <div className="calendar-tooltip__date">{formatDateSwedish(group.date)}</div>
          <div className="calendar-tooltip__event-type">
            {getTaskTypeLabel(group.type)}
            {group.plantNames.length > 1 ? ":" : ""}
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

