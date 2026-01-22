import { CalendarDay } from "../CalendarDay/CalendarDay";
import { getCalendarDays, isToday } from "../../../helpers/calendar/calendar";
import { formatDateIso, formatMonthYearSwedish } from "../../../helpers/date/date";
import type { CalendarEvent } from "../../../helpers/calendar/events";
import "./CalendarMonth.scss";

type CalendarMonthProps = {
  month: Date;
  events: CalendarEvent[];
  onDayHover: (date: Date, events: CalendarEvent[], position: { x: number; y: number }) => void;
};

const weekDays = ["Mån", "Tis", "Ons", "Tors", "Fre", "Lör", "Sön"];

/**
 * Calendar month component.
 * 
 * Displays a full month grid with week day headers and all days
 * in the month (including days from previous/next month to fill weeks).
 */
export const CalendarMonth = ({ month, events, onDayHover }: CalendarMonthProps) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const calendarDays = getCalendarDays(year, monthIndex);

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateIso = formatDateIso(date);
    return events.filter((event) => event.date === dateIso);
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getFullYear() === year && date.getMonth() === monthIndex;
  };

  return (
    <div className="calendar-month" role="grid" aria-label={`Kalender för ${formatMonthYearSwedish(month)}`}>
      <div className="calendar-month__header" role="row">
        {weekDays.map((dayName) => (
          <div key={dayName} className="calendar-month__day-name" role="columnheader">
            {dayName}
          </div>
        ))}
      </div>
      <div className="calendar-month__grid">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          return (
            <CalendarDay
              key={`${formatDateIso(day)}-${index}`}
              date={day}
              events={dayEvents}
              isCurrentMonth={isCurrentMonth(day)}
              isToday={isToday(day)}
              onDayHover={onDayHover}
            />
          );
        })}
      </div>
    </div>
  );
};

