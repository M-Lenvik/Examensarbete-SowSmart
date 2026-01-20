import { EventIcon } from "../EventIcon/EventIcon";
import { CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES } from "../../helpers/calendar/events";
import type { CalendarEventType, EventIconSize } from "../../helpers/calendar/events";
import "./EventIconWithLabel.scss";

type EventIconWithLabelProps = {
  eventType: CalendarEventType;
  size?: EventIconSize;
  showDate?: boolean;
  date?: string;
  className?: string;
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
 */
export const EventIconWithLabel = ({
  eventType,
  size = CALENDAR_ICON_SIZES.small,
  showDate = false,
  date,
  className = "",
}: EventIconWithLabelProps) => {
  const label = CALENDAR_EVENT_CONFIG[eventType].label;

  return (
    <div className={`event-icon-with-label ${className}`}>
      <EventIcon eventType={eventType} size={size} />
      <span className="event-icon-with-label__text">
        {label}
        {showDate && date && ` ${date}`}
      </span>
    </div>
  );
};

