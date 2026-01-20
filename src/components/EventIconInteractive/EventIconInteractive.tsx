import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { EventIcon } from "../EventIcon/EventIcon";
import { EventTooltip } from "../EventTooltip/EventTooltip";
import { EventInfoModal } from "../EventInfoModal/EventInfoModal";
import { CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES } from "../../helpers/calendar/events";
import type { CalendarEventType, EventIconSize } from "../../helpers/calendar/events";
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
  const iconRef = useRef<HTMLSpanElement>(null);
  const hoverTimeoutRef = useRef<number | undefined>(undefined);

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
    setIsModalOpen(true);
    setIsTooltipVisible(false);
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
      <span
        ref={iconRef}
        className={`event-icon-interactive ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${eventLabel} - Klicka för mer information`}
      >
        <EventIcon eventType={eventType} size={size} />
      </span>
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

