import { useState } from "react";
import { CalendarEventIcon } from "../CalendarEventIcon/CalendarEventIcon";
import type { Task } from "../../helpers/calendar/tasks";
import type { PlantWarning } from "../../helpers/validation/warnings";
import "./MyGardenTaskCard.scss";

type MyGardenTaskCardProps = {
  task: Task;
  warning: PlantWarning | null;
};

export const MyGardenTaskCard = ({ task, warning }: MyGardenTaskCardProps) => {
  const [isWarningExpanded, setIsWarningExpanded] = useState(false);
  const hasWarning = warning !== null;

  const handleWarningClick = () => {
    if (hasWarning) {
      setIsWarningExpanded(!isWarningExpanded);
    }
  };

  return (
    <article 
      className={`my-garden-task-card my-garden-task-card--${task.type}${hasWarning ? " my-garden-task-card--has-warning" : ""}`}
      role="listitem" 
      aria-label={`${task.taskLabel} den ${task.dateFormatted}${hasWarning ? " - varning: datum ligger utanför optimalt fönster" : ""}`}
    >
      <div className="my-garden-task-card__icon">
        <CalendarEventIcon eventType={task.type} size="medium" />
      </div>
      <div className="my-garden-task-card__content">
        <div className="my-garden-task-card__header">
          <h3 className="my-garden-task-card__label">{task.taskLabel}</h3>
          {hasWarning && (
            <button
              type="button"
              className="my-garden-task-card__warning-button"
              onClick={handleWarningClick}
              aria-expanded={isWarningExpanded}
              aria-label="Visa varningsinformation"
            >
              <span className="my-garden-task-card__warning-icon" role="alert" aria-label="Varning: datum ligger utanför optimalt fönster">
                ⚠️
              </span>
            </button>
          )}
        </div>
        <time className="my-garden-task-card__date" dateTime={task.date}>
          {task.dateFormatted}
        </time>
        {hasWarning && isWarningExpanded && (
          <div className="my-garden-task-card__warning-content" role="alert">
            <p className="my-garden-task-card__warning-message">{warning.message}</p>
          </div>
        )}
      </div>
    </article>
  );
};

