"use client";

import { format, parseISO } from "date-fns";
import { Task, TaskStatus } from "@/types";

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
  blocked: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  done: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200",
};

const statusLabel: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

const priorityLabel = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, nextStatus: TaskStatus) => void;
  onSelect: (task: Task) => void;
  focusTaskIds?: string[];
}

export function TaskList({ tasks, loading, onEdit, onDelete, onStatusChange, onSelect, focusTaskIds = [] }: TaskListProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Loading tasks...
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        No tasks found. Create your first task to get started.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500"
          onClick={() => onSelect(task)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              onSelect(task);
            }
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</h3>
                {focusTaskIds.includes(task.id) && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                    Focus
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 ${statusStyles[task.status]}`}>
                  {statusLabel[task.status]}
                </span>
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  Priority: {priorityLabel[task.priority]}
                </span>
                {task.estimatedMinutes && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                    Estimate: {task.estimatedMinutes}m
                  </span>
                )}
                {task.dueDate && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                    Due {format(parseISO(task.dueDate), "PPP")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onStatusChange(
                    task,
                    task.status === "done"
                      ? "todo"
                      : task.status === "blocked"
                      ? "todo"
                      : task.status === "todo"
                      ? "in_progress"
                      : task.status === "in_progress"
                      ? "done"
                      : "blocked",
                  );
                }}
                className="rounded-md border border-zinc-300 px-3 py-1 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Advance status
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(task);
                }}
                className="rounded-md border border-blue-300 px-3 py-1 text-blue-600 transition hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(task);
                }}
                className="rounded-md border border-red-300 px-3 py-1 text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

