/**
 * EventIconWithLabel component - displays event icon with its label.
 * 
 * Data sources:
 * - Props: eventType, size, showDate, date, className, interactive
 * - CALENDAR_EVENT_CONFIG: Event labels from helpers
 * 
 * Results:
 * - Returns: JSX (event icon with label, optionally with date)
 * 
 * Uses:
 * - components/event/EventIcon/EventIcon.tsx (EventIcon)
 * - components/event/EventIconInteractive/EventIconInteractive.tsx (EventIconInteractive) - when interactive is true
 * - helpers/calendar/events.ts (CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES, CalendarEventType, EventIconSize)
 * 
 * Used by:
 * - components/shared/SelectedPlantsList/SelectedPlantsList.tsx - for displaying event icons with labels
 */

import { EventIcon } from "../EventIcon/EventIcon";
import { EventIconInteractive } from "../EventIconInteractive/EventIconInteractive";
import { CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES } from "../../../helpers/calendar/events";
import type { CalendarEventType, EventIconSize } from "../../../helpers/calendar/events";
import "./EventIconWithLabel.scss";

type EventIconWithLabelProps = {
  eventType: CalendarEventType;
  size?: EventIconSize;
  showDate?: boolean;
  date?: string;
  className?: string;
  interactive?: boolean; // If true, icon is interactive (tooltip + modal)
};

/**
 * Event icon with label component.
 * 
 * Combines EventIcon with its label from CALENDAR_EVENT_CONFIG.
 * This ensures consistent labeling across the application, matching
 * the calendar legend.
 * 
 * @example
 * <EventIconWithLabel eventType="sow-indoor" size="small" />
 * <EventIconWithLabel eventType="sow-outdoor" size="small" date="15 mars" />
 * <EventIconWithLabel eventType="harvest" size="small" interactive />
 */
export const EventIconWithLabel = ({
  eventType,
  size = CALENDAR_ICON_SIZES.small,
  showDate = false,
  date,
  className = "",
  interactive = false,
}: EventIconWithLabelProps) => {
  const label = CALENDAR_EVENT_CONFIG[eventType].label;

  return (
    <div className={`event-icon-with-label ${className}`}>
      {interactive ? (
        <EventIconInteractive eventType={eventType} size={size} />
      ) : (
        <EventIcon eventType={eventType} size={size} />
      )}
      <span className="event-icon-with-label__text">
        <span className="event-icon-with-label__label">{label}</span>
        {showDate && date && (
          <span className="event-icon-with-label__date">{date}</span>
        )}
      </span>
    </div>
  );
};

