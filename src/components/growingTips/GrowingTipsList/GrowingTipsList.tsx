/**
 * GrowingTipsList component - displays growing tips for all event types.
 * 
 * Data sources:
 * - Static: ALL_CALENDAR_EVENT_TYPES, CALENDAR_EVENT_CONFIG from helpers
 * 
 * Results:
 * - Returns: JSX (list of growing tip items, one per event type)
 * 
 * Uses:
 * - components/event/EventIcon/EventIcon.tsx (EventIcon)
 * - helpers/calendar/events.ts (ALL_CALENDAR_EVENT_TYPES, CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES, CalendarEventType)
 * 
 * Used by:
 * - pages/GrowingTips.tsx - for displaying all growing tips
 */

import { EventIcon } from "../../event/EventIcon/EventIcon";
import { ALL_CALENDAR_EVENT_TYPES, CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES } from "../../../helpers/calendar/events";
import type { CalendarEventType } from "../../../helpers/calendar/events";
import "./GrowingTipsList.scss";

export const GrowingTipsList = () => {
  return (
    <div className="growing-tips-list">
      {ALL_CALENDAR_EVENT_TYPES.map((eventType) => {
        const config = CALENDAR_EVENT_CONFIG[eventType];
        return (
          <GrowingTipItem
            key={eventType}
            eventType={eventType}
            title={config.modalTitle}
            content={config.modalContent}
          />
        );
      })}
    </div>
  );
};

type GrowingTipItemProps = {
  eventType: CalendarEventType;
  title: string;
  content: string;
};

const GrowingTipItem = ({ eventType, title, content }: GrowingTipItemProps) => {
  return (
    <section className="growing-tip-item">
      <div className="growing-tip-item__header">
        <EventIcon eventType={eventType} size={CALENDAR_ICON_SIZES.small} />
        <h2 className="growing-tip-item__title">{title}</h2>
      </div>
      <p className="growing-tip-item__text">{content}</p>
    </section>
  );
};

