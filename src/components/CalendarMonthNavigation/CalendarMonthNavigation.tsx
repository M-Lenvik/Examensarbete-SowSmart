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
  const months = [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ];
  
  const month = months[currentMonth.getMonth()];
  const year = currentMonth.getFullYear();

  return (
    <nav className="calendar-month-navigation" aria-label="Månadsnavigation">
      <button
        type="button"
        className="calendar-month-navigation__button calendar-month-navigation__button--previous"
        onClick={onPreviousMonth}
        aria-label="Föregående månad"
      >
      </button>
      <h2 className="calendar-month-navigation__month">
        <span className="calendar-month-navigation__month-name">{month}</span>
        <span className="calendar-month-navigation__year">{year}</span>
      </h2>
      <button
        type="button"
        className="calendar-month-navigation__button calendar-month-navigation__button--next"
        onClick={onNextMonth}
        aria-label="Nästa månad"
      >
      </button>
    </nav>
  );
};

