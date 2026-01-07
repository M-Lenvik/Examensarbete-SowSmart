import type { CalendarEvent } from "../../helpers/calendar/events";
import "./CalendarEventIcon.scss";

type CalendarEventIconProps = {
  eventType: CalendarEvent["type"];
  size?: "small" | "medium" | "large";
};

/**
 * Calendar event icon component.
 * 
 * Displays a visual icon for different event types (sow, harden, move, harvest).
 * Uses color-coded circles that match the legend.
 */
export const CalendarEventIcon = ({
  eventType,
  size = "medium",
}: CalendarEventIconProps) => {
  return (
    <span
      className={`calendar-event-icon calendar-event-icon--${eventType} calendar-event-icon--${size}`}
      aria-hidden="true"
    />
  );
};

