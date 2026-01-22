import { EventIconInteractive } from "../../event/EventIconInteractive/EventIconInteractive";
import { ALL_CALENDAR_EVENT_TYPES, CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES, type CalendarEventType } from "../../../helpers/calendar/events";
import "./CalendarLegend.scss";

/**
 * Calendar legend component that explains event types.
 * 
 * Displays all event types with their visual representation and labels.
 * This is a static component with no props - it always shows all event types.
 */
export const CalendarLegend = () => {
  // Mobile order: group related items together
  const mobileOrder: CalendarEventType[] = [
    "sow-outdoor", // Row 1, item 1
    "harden-start", // Row 1, item 2
    "sow-indoor", // Row 2, item 1
    "move-plant-outdoor", // Row 2, item 2
    "harvest", // Row 3
  ];

  // Desktop order: use original order
  const desktopOrder = ALL_CALENDAR_EVENT_TYPES;

  return (
    <div className="calendar-legend" role="group" aria-label="Förklaring av event-typer">
      <h3 className="calendar-legend__title">Förklaring</h3>
      <ul className="calendar-legend__list calendar-legend__list--mobile">
        {mobileOrder.map((eventType) => (
          <li key={eventType} className="calendar-legend__item">
            <EventIconInteractive eventType={eventType} size={CALENDAR_ICON_SIZES.small} />
            <span className="calendar-legend__label">{CALENDAR_EVENT_CONFIG[eventType].label}</span>
          </li>
        ))}
      </ul>
      <ul className="calendar-legend__list calendar-legend__list--desktop">
        {desktopOrder.map((eventType) => (
          <li key={eventType} className="calendar-legend__item">
            <EventIconInteractive eventType={eventType} size={CALENDAR_ICON_SIZES.small} />
            <span className="calendar-legend__label">{CALENDAR_EVENT_CONFIG[eventType].label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

