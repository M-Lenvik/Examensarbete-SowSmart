/**
 * EventIcon component - displays a visual icon for different event types.
 * 
 * Data sources:
 * - Props: eventType, size
 * 
 * Results:
 * - Returns: JSX (span element with CSS classes for event icon styling)
 * 
 * Uses:
 * - helpers/calendar/events.ts (CalendarEventType, EventIconSize, CALENDAR_ICON_SIZES)
 * 
 * Used by:
 * - components/event/EventIconWithLabel/EventIconWithLabel.tsx - for displaying icon with label
 * - components/event/EventIconInteractive/EventIconInteractive.tsx - for interactive icon
 * - components/event/EventInfoModal/EventInfoModal.tsx - for modal icon
 * - components/calendar/Carousel/Carousel.tsx - for carousel icons
 */

import type { CalendarEventType, EventIconSize } from "../../../helpers/calendar/events";
import { CALENDAR_ICON_SIZES } from "../../../helpers/calendar/events";
import "./EventIcon.scss";

type EventIconProps = {
  eventType: CalendarEventType;
  size?: EventIconSize;
};

/**
 * Event icon component.
 * 
 * Displays a visual icon for different event types (sow, harden, move, harvest).
 * Uses images with fallback colors defined in CSS.
 */
export const EventIcon = ({
  eventType,
  size = CALENDAR_ICON_SIZES.small,
}: EventIconProps) => {
  return (
    <span
      className={`calendar-event-icon calendar-event-icon--${eventType} calendar-event-icon--${size}`}
      aria-hidden="true"
    />
  );
};

