import { Modal } from "../../Modal/Modal";
import { EventIcon } from "../EventIcon/EventIcon";
import { CALENDAR_EVENT_CONFIG, CALENDAR_ICON_SIZES } from "../../../helpers/calendar/events";
import type { CalendarEventType } from "../../../helpers/calendar/events";
import "./EventInfoModal.scss";

type EventInfoModalProps = {
  isOpen: boolean;
  eventType: CalendarEventType;
  onClose: () => void;
};

/**
 * Event info modal component for detailed explanations.
 * 
 * Displays a modal with detailed information about a specific event type
 * when clicking on an event icon.
 */
export const EventInfoModal = ({ isOpen, eventType, onClose }: EventInfoModalProps) => {
  const config = CALENDAR_EVENT_CONFIG[eventType];

  return (
    <Modal isOpen={isOpen} title={config.modalTitle} onClose={onClose}>
      <div className="event-info-modal">
        <div className="event-info-modal__icon">
          <EventIcon eventType={eventType} size={CALENDAR_ICON_SIZES.large} />
        </div>
        <div className="event-info-modal__content">
          <p className="event-info-modal__text">{config.modalContent}</p>
        </div>
      </div>
    </Modal>
  );
};

