/**
 * EventIconInteractive component - interactive event icon with tooltip and modal.
 * 
 * Data sources:
 * - Props: eventType, size, className
 * - Local state: isTooltipVisible, isModalOpen, tooltipPosition
 * 
 * Results:
 * - Returns: JSX (interactive button with icon, tooltip on hover, modal on click)
 * 
 * Uses:
 * - components/event/EventIcon/EventIcon.tsx (EventIcon)
 * - components/event/EventTooltip/EventTooltip.tsx (EventTooltip)
 * - components/event/EventInfoModal/EventInfoModal.tsx (EventInfoModal)
 * - helpers/calendar/events.ts (CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES, CalendarEventType, EventIconSize)
 * 
 * Used by:
 * - components/calendar/CalendarLegend/CalendarLegend.tsx - for interactive legend icons
 * - components/event/EventIconWithLabel/EventIconWithLabel.tsx - when interactive prop is true
 */

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { EventIcon } from "../EventIcon/EventIcon";
import { EventTooltip } from "../EventTooltip/EventTooltip";
import { EventInfoModal } from "../EventInfoModal/EventInfoModal";
import { CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES } from "../../../helpers/calendar/events";
import type { CalendarEventType, EventIconSize } from "../../../helpers/calendar/events";
import "./EventIconInteractive.scss";

type EventIconInteractiveProps = {
  eventType: CalendarEventType;
  size?: EventIconSize;
  className?: string;
};

const TOOLTIP_DELAY_MS = 300;

/**
 * Interactive event icon component.
 * 
 * Displays an event icon that shows a tooltip on hover and opens a modal on click.
 * Used in CalendarLegend and other places where users can interact with event icons.
 */
export const EventIconInteractive = ({
  eventType,
  size = CALENDAR_ICON_SIZES.small,
  className = "",
}: EventIconInteractiveProps) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<number | undefined>(undefined);
  
  // Only bind mouse events on devices that support hover (desktop/tablet)
  const supportsHover = typeof window !== "undefined" && 
    window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)").matches;

  const showTooltip = () => {
    if (!iconRef.current) return;

    const iconBounds = iconRef.current.getBoundingClientRect();
    setTooltipPosition({
      x: iconBounds.left + iconBounds.width / 2,
      y: iconBounds.top,
    });
    setIsTooltipVisible(true);
  };

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(showTooltip, TOOLTIP_DELAY_MS);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current !== undefined) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsTooltipVisible(false);
  };

  const handleClick = () => {
    if (hoverTimeoutRef.current !== undefined) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsTooltipVisible(false);
    setIsModalOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const eventLabel = CALENDAR_EVENT_CONFIG[eventType].label;

  return (
    <>
      <button
        ref={iconRef}
        type="button"
        className={`event-icon-interactive ${className}`}
        onMouseEnter={supportsHover ? handleMouseEnter : undefined}
        onMouseLeave={supportsHover ? handleMouseLeave : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${eventLabel} - Klicka för mer information`}
      >
        <EventIcon eventType={eventType} size={size} />
      </button>
      {isTooltipVisible &&
        createPortal(
          <EventTooltip
            eventType={eventType}
            position={tooltipPosition}
            isVisible={isTooltipVisible}
          />,
          document.body
        )
      }
      <EventInfoModal
        isOpen={isModalOpen}
        eventType={eventType}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

