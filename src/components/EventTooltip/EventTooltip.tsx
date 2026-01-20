import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CALENDAR_EVENT_CONFIG } from "../../helpers/calendar/events";
import type { CalendarEventType } from "../../helpers/calendar/events";
import "./EventTooltip.scss";

/**
 * Tooltip positioning constants.
 * 
 * These values match the SCSS variables defined in _tooltip.scss.
 * Used for dynamic tooltip positioning calculations.
 */
export const TOOLTIP_PADDING_PX = 16; // 1rem
export const TOOLTIP_OFFSET_PX = 8; // 0.5rem

type EventTooltipProps = {
  eventType: CalendarEventType;
  position: { x: number; y: number };
  isVisible: boolean;
};

/**
 * Event tooltip component for quick explanations.
 * 
 * Displays a simple tooltip with a brief explanation when hovering over event icons.
 */
export const EventTooltip = ({ eventType, position, isVisible }: EventTooltipProps) => {
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
    const padding = TOOLTIP_PADDING_PX;
    const tooltipOffset = TOOLTIP_OFFSET_PX;

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
      left = viewportWidth - padding;
      transformX = "-100%";
    }
    
    // Check if tooltip would go off left edge
    if (left - halfWidth < padding) {
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
      // Not enough space - position where there's most space
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

  if (!isVisible) {
    return null;
  }

  const tooltipText = CALENDAR_EVENT_CONFIG[eventType].tooltip;

  return (
    <div
      ref={tooltipRef}
      className="event-tooltip"
      role="tooltip"
      aria-live="polite"
      style={tooltipStyle}
    >
      {tooltipText}
    </div>
  );
};

