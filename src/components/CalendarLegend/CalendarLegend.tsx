import { EventIcon } from "../EventIcon/EventIcon";
import { ALL_CALENDAR_EVENT_TYPES, CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES } from "../../helpers/calendar/events";
import "./CalendarLegend.scss";

/**
 * Calendar legend component that explains event types.
 * 
 * Displays all event types with their visual representation and labels.
 * This is a static component with no props - it always shows all event types.
 */
export const CalendarLegend = () => {
  return (
    <div className="calendar-legend" role="group" aria-label="Förklaring av event-typer">
      <h3 className="calendar-legend__title">Förklaring</h3>
      <ul className="calendar-legend__list">
        {ALL_CALENDAR_EVENT_TYPES.map((eventType) => (
          <li key={eventType} className="calendar-legend__item">
            <EventIcon eventType={eventType} size={CALENDAR_ICON_SIZES.small} />
            <span className="calendar-legend__label">{CALENDAR_EVENT_CONFIG[eventType].label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

