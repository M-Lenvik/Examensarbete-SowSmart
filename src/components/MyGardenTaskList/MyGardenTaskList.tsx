import { useState } from "react";
import { CalendarEventIcon } from "../CalendarEventIcon/CalendarEventIcon";
import { getTaskTypeLabel, taskTypeToDateType } from "../../helpers/calendar/tasks";
import type { Task } from "../../helpers/calendar/tasks";
import type { PlantWarning } from "../../helpers/validation/warnings";
import { parseDateIso, formatMonthYearSwedish } from "../../helpers/date/date";
import "./MyGardenTaskList.scss";

type MyGardenTaskListProps = {
  tasks: Task[];
  warnings: PlantWarning[];
  onPlantClick?: (plantId: number) => void;
};

/**
 * Group tasks by date and type.
 * Returns an array of groups, each containing date, type, and tasks.
 */
const groupTasksByDateAndType = (tasks: Task[]): Array<{
  date: string;
  type: Task["type"];
  tasks: Task[];
}> => {
  const grouped = new Map<string, Map<Task["type"], Task[]>>();

  for (const task of tasks) {
    if (!grouped.has(task.date)) {
      grouped.set(task.date, new Map());
    }
    const dateGroup = grouped.get(task.date)!;
    if (!dateGroup.has(task.type)) {
      dateGroup.set(task.type, []);
    }
    dateGroup.get(task.type)!.push(task);
  }

  const result: Array<{ date: string; type: Task["type"]; tasks: Task[] }> = [];
  for (const [date, typeMap] of grouped.entries()) {
    for (const [type, tasks] of typeMap.entries()) {
      result.push({ date, type, tasks });
    }
  }

  return result.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.type.localeCompare(b.type);
  });
};

/**
 * Get warning for a specific task.
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

/**
 * Task group card component (groups tasks of same type and date).
 */
type TaskGroupCardProps = {
  type: Task["type"];
  tasks: Task[];
  warnings: PlantWarning[];
  dateFormatted: string;
  isExpanded: boolean;
  onToggle: () => void;
  onPlantClick?: (plantId: number) => void;
};

const TaskGroupCard = ({ type, tasks, warnings, dateFormatted, isExpanded, onToggle, onPlantClick }: TaskGroupCardProps) => {
  const hasWarning = tasks.some((task) => getTaskWarning(task, warnings) !== null);

  return (
    <li className="my-garden-task-list__task-group">
      <div className={`my-garden-task-list__task-card my-garden-task-list__task-card--${type}${hasWarning ? " my-garden-task-list__task-card--has-warning" : ""}`}>
        <div className="my-garden-task-list__task-icon">
          <CalendarEventIcon eventType={type} size="medium" />
        </div>
        <div className="my-garden-task-list__task-content">
          <button
            type="button"
            className="my-garden-task-list__task-header-button"
            onClick={onToggle}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Dölj" : "Visa"} plantor för ${getTaskTypeLabel(type)} den ${dateFormatted}`}
          >
            <div className="my-garden-task-list__task-header-content">
              <h3 className="my-garden-task-list__task-date">
                {dateFormatted}<span className="my-garden-task-list__task-count">, {tasks.length} {tasks.length === 1 ? "händelse" : "händelser"}</span>
              </h3>
              <h4 className={`my-garden-task-list__task-label ${isExpanded ? "my-garden-task-list__task-label--expanded" : ""}`}>
                {getTaskTypeLabel(type)}
              </h4>
            </div>
            <span className={`my-garden-task-list__task-header-icon ${isExpanded ? "my-garden-task-list__task-header-icon--expanded" : ""}`}>
              ▼
            </span>
          </button>
          {isExpanded && (
            <>
              <ul className="my-garden-task-list__plant-list" role="list">
              {(() => {
                // Sort tasks by subcategory and name
                const sortedTasks = [...tasks].sort((a, b) => {
                  const subcategoryA = (a.plantSubcategory || "").trim().toLowerCase();
                  const subcategoryB = (b.plantSubcategory || "").trim().toLowerCase();
                  
                  if (subcategoryA.length === 0 && subcategoryB.length === 0) {
                    return a.plantName.localeCompare(b.plantName, "sv");
                  }
                  
                  if (subcategoryA.length === 0) return 1;
                  if (subcategoryB.length === 0) return -1;
                  
                  const subcategoryCompare = subcategoryA.localeCompare(subcategoryB, "sv");
                  if (subcategoryCompare !== 0) return subcategoryCompare;
                  
                  return a.plantName.localeCompare(b.plantName, "sv");
                });

                // Group by subcategory
                const groupedTasks = sortedTasks.reduce((acc, task) => {
                  const subcategory = task.plantSubcategory || "Övrigt";
                  if (!acc[subcategory]) {
                    acc[subcategory] = [];
                  }
                  acc[subcategory].push(task);
                  return acc;
                }, {} as Record<string, Task[]>);

                const sortedSubcategories = Object.keys(groupedTasks).sort((a, b) => {
                  if (a === "Övrigt") return 1;
                  if (b === "Övrigt") return -1;
                  return a.localeCompare(b, "sv");
                });

                const capitalizeFirst = (str: string): string => {
                  if (str.length === 0) return str;
                  return str.charAt(0).toUpperCase() + str.slice(1);
                };

                return sortedSubcategories.flatMap((subcategory) => [
                  <li key={`subcategory-${subcategory}`} className="my-garden-task-list__subcategory-header">
                    <h4 className="my-garden-task-list__subcategory-title">{capitalizeFirst(subcategory)}</h4>
                  </li>,
                  ...groupedTasks[subcategory].map((task, taskIndex) => {
                    const taskWarning = getTaskWarning(task, warnings);
                    return (
                      <li key={`${task.plantId}-${taskIndex}`} className="my-garden-task-list__plant-item">
                        <div className="my-garden-task-list__plant-row">
                          {onPlantClick ? (
                            <button
                              type="button"
                              className="my-garden-task-list__plant-name-button"
                              onClick={() => onPlantClick(task.plantId)}
                              aria-label={`Öppna detaljer för ${task.plantName}`}
                            >
                              {task.plantName}
                            </button>
                          ) : (
                            <span className="my-garden-task-list__plant-name">{task.plantName}</span>
                          )}
                          {taskWarning && (
                            <span className="my-garden-task-list__plant-warning" role="alert" aria-label="Varning: datum ligger utanför optimalt fönster">
                              ⚠️
                            </span>
                          )}
                        </div>
                        {taskWarning && (
                          <p className="my-garden-task-list__plant-warning-message">{taskWarning.message}</p>
                        )}
                      </li>
                    );
                  })
                ]);
              })()}
              </ul>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export const MyGardenTaskList = ({ tasks, warnings, onPlantClick }: MyGardenTaskListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (tasks.length === 0) {
    return (
      <div className="my-garden-task-list">
        <p>Inga händelser att visa.</p>
      </div>
    );
  }

  // Group tasks by date and type
  const groupedTasks = groupTasksByDateAndType(tasks);
  
  // Group by date for display
  const tasksByDate = new Map<string, Array<{ type: Task["type"]; tasks: Task[] }>>();
  for (const group of groupedTasks) {
    if (!tasksByDate.has(group.date)) {
      tasksByDate.set(group.date, []);
    }
    tasksByDate.get(group.date)!.push({ type: group.type, tasks: group.tasks });
  }
  const sortedDates = Array.from(tasksByDate.keys()).sort();

  // Group by month
  const tasksByMonth = new Map<string, string[]>(); // monthKey -> array of dates
  for (const date of sortedDates) {
    try {
      const dateObj = parseDateIso(date);
      const monthKey = formatMonthYearSwedish(dateObj);
      if (!tasksByMonth.has(monthKey)) {
        tasksByMonth.set(monthKey, []);
      }
      tasksByMonth.get(monthKey)!.push(date);
    } catch {
      // Skip invalid dates
    }
  }
  const sortedMonths = Array.from(tasksByMonth.keys()).sort((a, b) => {
    // Sort by date (month and year)
    try {
      const dateA = parseDateIso(tasksByMonth.get(a)![0]);
      const dateB = parseDateIso(tasksByMonth.get(b)![0]);
      return dateA.getTime() - dateB.getTime();
    } catch {
      return 0;
    }
  });

  const toggleGroup = (date: string, type: Task["type"]) => {
    const groupKey = `${date}-${type}`;
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  return (
    <div className="my-garden-task-list">
      <ul className="my-garden-task-list__list" role="list">
        {sortedMonths.map((monthKey, monthIndex) => {
          const monthDates = tasksByMonth.get(monthKey) || [];
          const isLastMonth = monthIndex === sortedMonths.length - 1;
          
          // Capitalize first letter of month name
          const capitalizedMonth = monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
          
          return (
            <li key={monthKey} className="my-garden-task-list__month-group">
              <h2 className="my-garden-task-list__month-header">{capitalizedMonth}</h2>
              <ul className="my-garden-task-list__month-tasks" role="list">
                {monthDates.map((date) => {
                  const dateGroups = tasksByDate.get(date) || [];
                  const dateFormatted = groupedTasks.find((g) => g.date === date)?.tasks[0]?.dateFormatted || date;
                  
                  return (
                    <li key={date} className="my-garden-task-list__date-group">
                      <ul className="my-garden-task-list__tasks" role="list">
                        {dateGroups.map((group, groupIndex) => {
                          const groupKey = `${date}-${group.type}`;
                          const isExpanded = expandedGroups.has(groupKey);
                          return (
                            <TaskGroupCard
                              key={`${date}-${group.type}-${groupIndex}`}
                              type={group.type}
                              tasks={group.tasks}
                              warnings={warnings}
                              dateFormatted={dateFormatted}
                              isExpanded={isExpanded}
                              onToggle={() => toggleGroup(date, group.type)}
                              onPlantClick={onPlantClick}
                            />
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
              {!isLastMonth && <div className="my-garden-task-list__month-divider"></div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

