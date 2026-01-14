// base code from https://www.geeksforgeeks.org/javascript/create-an-autoplay-carousel-using-html-css-and-javascript/

import { useState, useEffect, useRef } from "react";
import { EventIcon } from "../EventIcon/EventIcon";
import type { CalendarEventType } from "../../helpers/calendar/events";
import { CALENDAR_ICON_SIZES } from "../../helpers/calendar/events";
import "./Carousel.scss";

type CarouselProps = {
  eventTypes: CalendarEventType[];
  resetKey?: string; // Key to reset carousel when date changes
};

/**
 * Carousel component.
 * 
 * Displays event icons in an auto-rotating carousel.
 * When multiple event types are provided, they rotate automatically
 * (2 seconds per icon with 0.8s smooth transition).
 * 
 * Based on slide-in animation from right (left: 100% -> left: 0).
 */
export const Carousel = ({
  eventTypes,
  resetKey,
}: CarouselProps) => {
  const hasMultipleIcons = eventTypes.length > 1;

  // Carousel state - track which icons are active (can have one active at a time)
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set([0]));
  const timeoutRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  // Auto-rotate carousel when multiple icons (matching script.js logic)
  useEffect(() => {
    if (!hasMultipleIcons) {
      // If only one icon, keep it active
      setActiveIndices(new Set([0]));
      return;
    }

    const interval = setInterval(() => {
      setActiveIndices((prevActive) => {
        // Find current active index
        const currentActive = Array.from(prevActive)[0] ?? 0;
        let nextActive: number;

        // Determine next active index (loop back to 0 if at end)
        if (currentActive + 1 === eventTypes.length) {
          nextActive = 0;
        } else {
          nextActive = currentActive + 1;
        }

        // Remove active from current after transition (800ms, matching transition duration)
        const removeTimeout = setTimeout(() => {
          setActiveIndices((prev) => {
            const newSet = new Set(prev);
            newSet.delete(currentActive);
            return newSet;
          });
          timeoutRefs.current.delete(currentActive);
        }, 800); // Match transition duration

        timeoutRefs.current.set(currentActive, removeTimeout);

        // Add active to next immediately
        return new Set([nextActive]);
      });
     }, 2000); // 2 seconds per icon

    return () => {
      clearInterval(interval);
      // Clean up any pending timeouts
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, [hasMultipleIcons, eventTypes.length]);

  // Reset to first icon when resetKey changes (e.g., when date changes)
  useEffect(() => {
    setActiveIndices(new Set([0]));
    // Clean up timeouts when reset
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
    timeoutRefs.current.clear();
  }, [resetKey]);

  return (
    <div className="carousel">
      {eventTypes.map((type, index) => (
        <div
          key={`${type}-${index}`}
          className={`carousel__item ${
            activeIndices.has(index) ? "carousel__item--active" : ""
          }`}
        >
          <EventIcon eventType={type} size={CALENDAR_ICON_SIZES.medium} />
        </div>
      ))}
    </div>
  );
};

