import { MyGardenTaskCard } from "../MyGardenTaskCard/MyGardenTaskCard";
import { taskTypeToDateType } from "../../helpers/calendar/tasks";
import type { Task } from "../../helpers/calendar/tasks";
import type { PlantWarning } from "../../helpers/validation/warnings";
import "./MyGardenTaskList.scss";

type MyGardenTaskListProps = {
  tasks: Task[];
  warnings: PlantWarning[];
};

/**
 * Group tasks by date and create a map for quick warning lookup.
 */
const groupTasksByDate = (tasks: Task[]): Map<string, Task[]> => {
  const grouped = new Map<string, Task[]>();
  for (const task of tasks) {
    const existing = grouped.get(task.date) || [];
    grouped.set(task.date, [...existing, task]);
  }
  return grouped;
};

/**
 * Get warning for a task.
 */
const getTaskWarning = (task: Task, warnings: PlantWarning[]): PlantWarning | null => {
  const dateType = taskTypeToDateType(task.type);
  return (
    warnings.find(
      (warning) =>
        warning.plantId === task.plantId &&
        warning.date === task.date &&
        warning.dateType === dateType
    ) || null
  );
};

export const MyGardenTaskList = ({ tasks, warnings }: MyGardenTaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="my-garden-task-list">
        <p>Inga händelser att visa.</p>
      </div>
    );
  }

  // Group tasks by date (already sorted chronologically from recommendationsToTasks)
  const tasksByDate = groupTasksByDate(tasks);
  const sortedDates = Array.from(tasksByDate.keys()).sort();

  return (
    <div className="my-garden-task-list">
      <ul className="my-garden-task-list__list" role="list">
        {sortedDates.map((date) => {
          const dateTasks = tasksByDate.get(date) || [];
          return (
            <li key={date} className="my-garden-task-list__date-group">
              <h3 className="my-garden-task-list__date-header">
                {dateTasks[0]?.dateFormatted || date}
              </h3>
              <ul className="my-garden-task-list__tasks" role="list">
                {dateTasks.map((task, index) => {
                  const warning = getTaskWarning(task, warnings);
                  return (
                    <li key={`${task.type}-${task.plantId}-${index}`}>
                      <MyGardenTaskCard task={task} warning={warning} />
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

