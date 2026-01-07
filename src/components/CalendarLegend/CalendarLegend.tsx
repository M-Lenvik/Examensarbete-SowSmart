import { CalendarEventIcon } from "../CalendarEventIcon/CalendarEventIcon";
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
        <li className="calendar-legend__item">
          <CalendarEventIcon eventType="sow-outdoor" size="medium" />
          <span className="calendar-legend__label">Så direkt ute</span>
        </li>
        <li className="calendar-legend__item">
          <CalendarEventIcon eventType="sow-indoor" size="medium" />
          <span className="calendar-legend__label">Så inne</span>
        </li>
        <li className="calendar-legend__item">
          <CalendarEventIcon eventType="harden-start" size="medium" />
          <span className="calendar-legend__label">Starta avhärdning</span>
        </li>
        <li className="calendar-legend__item">
          <CalendarEventIcon eventType="move-plant-outdoor" size="medium" />
          <span className="calendar-legend__label">Flytta ut plantan</span>
        </li>
        <li className="calendar-legend__item">
          <CalendarEventIcon eventType="harvest" size="medium" />
          <span className="calendar-legend__label">Skörd</span>
        </li>
      </ul>
    </div>
  );
};

