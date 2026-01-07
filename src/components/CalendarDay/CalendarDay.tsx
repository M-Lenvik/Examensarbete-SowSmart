import { CalendarEventIcon } from "../CalendarEventIcon/CalendarEventIcon";
import { formatDateIso } from "../../helpers/date/date";
import type { CalendarEvent } from "../../helpers/calendar/events";
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
  const hasEvents = events.length > 0;

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    if (hasEvents) {
      const rect = event.currentTarget.getBoundingClientRect();
      onDayHover(date, events, {
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
  };

  const handleMouseLeave = () => {
    // Tooltip will be hidden by parent component
  };

  const dateIso = formatDateIso(date);
  const dayEvents = events.filter((event) => event.date === dateIso);

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
        <div className="calendar-day__events">
          {dayEvents.map((event, index) => (
            <CalendarEventIcon key={`${event.type}-${event.plantId}-${index}`} eventType={event.type} size="small" />
          ))}
        </div>
      )}
    </div>
  );
};

