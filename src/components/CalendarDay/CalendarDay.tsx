import { formatDateIso } from "../../helpers/date/date";
import type { CalendarEvent, CalendarEventType } from "../../helpers/calendar/events";
import { Carousel } from "../Carousel/Carousel";
import "./CalendarDay.scss";

type CalendarDayProps = {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onDayHover: (date: Date, events: CalendarEvent[], position: { x: number; y: number }) => void;
};

/**
 * Calendar day component.
 * 
 * Displays a single day in the calendar grid with its date number
 * and any events that occur on that day.
 */
export const CalendarDay = ({
  date,
  events,
  isCurrentMonth,
  isToday,
  onDayHover,
}: CalendarDayProps) => {
  const dayNumber = date.getDate();
  const dateIso = formatDateIso(date);
  const dayEvents = events.filter((event) => event.date === dateIso);
  const hasEvents = dayEvents.length > 0;

  // Group events by type and count them
  const eventsByType = dayEvents.reduce((eventsByTypeMap, event) => {
    if (!eventsByTypeMap.has(event.type)) {
      eventsByTypeMap.set(event.type, []);
    }
    eventsByTypeMap.get(event.type)!.push(event);
    return eventsByTypeMap;
  }, new Map<CalendarEventType, CalendarEvent[]>());

  // Convert to array of { type, count } for display
  const eventTypesToShow = Array.from(eventsByType.entries()).map(([type, eventsOfType]) => ({
    type,
    count: eventsOfType.length,
  }));

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (hasEvents) {
      const rect = event.currentTarget.getBoundingClientRect();
      onDayHover(date, dayEvents, {
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    // Call onDayHover with empty events to hide tooltip
    onDayHover(date, [], { x: 0, y: 0 });
  };

  return (
    <div
      className={`calendar-day ${isCurrentMonth ? "calendar-day--current-month" : "calendar-day--other-month"} 
      ${isToday ? "calendar-day--today" : ""} 
      ${hasEvents ? "calendar-day--has-events" : ""}`}
      role="gridcell"
      aria-label={`${dayNumber}${isCurrentMonth ? "" : " från annan månad"}${hasEvents ? `, ${dayEvents.length} aktivitet${dayEvents.length > 1 ? "er" : ""}` : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="calendar-day__number">{dayNumber}</span>
      {hasEvents && (
        <Carousel
          eventTypes={eventTypesToShow.map(({ type }) => type)}
          resetKey={dateIso}
        />
      )}
      {hasEvents && dayEvents.length > eventTypesToShow.length && (
        <span className="calendar-day__event-count" aria-label={`${dayEvents.length - eventTypesToShow.length} fler aktiviteter`}>
          +{dayEvents.length - eventTypesToShow.length}
        </span>
      )}
    </div>
  );
};

