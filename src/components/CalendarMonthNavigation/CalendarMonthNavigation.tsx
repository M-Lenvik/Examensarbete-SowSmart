import { formatMonthYear } from "../../helpers/calendar/calendar";
import "./CalendarMonthNavigation.scss";

type CalendarMonthNavigationProps = {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

/**
 * Calendar month navigation component.
 * 
 * Displays the current month and year, with buttons to navigate
 * to the previous and next month.
 */
export const CalendarMonthNavigation = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: CalendarMonthNavigationProps) => {
  const monthYear = formatMonthYear(currentMonth);

  return (
    <nav className="calendar-month-navigation" aria-label="Månadsnavigation">
      <button
        type="button"
        className="calendar-month-navigation__button calendar-month-navigation__button--previous"
        onClick={onPreviousMonth}
        aria-label="Föregående månad"
      >
        ←
      </button>
      <h2 className="calendar-month-navigation__month">{monthYear}</h2>
      <button
        type="button"
        className="calendar-month-navigation__button calendar-month-navigation__button--next"
        onClick={onNextMonth}
        aria-label="Nästa månad"
      >
        →
      </button>
    </nav>
  );
};

