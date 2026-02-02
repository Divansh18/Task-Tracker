"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FocusTaskAssignment, Task, TaskStatus } from "@/types";
import { ApiError, getFocusTasks, getTasks, updateTask } from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "blocked", "done"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

const STATUS_TONES: Record<TaskStatus, string> = {
  todo: "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
  in_progress: "border-blue-200 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/20",
  blocked: "border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-900/20",
  done: "border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-900/20",
};

export function KanbanBoard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const tasksQueryKey = ["tasks-kanban", token];
  const focusQueryKey = ["focus-kanban", token];

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: tasksQueryKey,
    enabled: Boolean(token),
    queryFn: () => getTasks(token as string),
  });

  const { data: focusAssignments = [] } = useQuery({
    queryKey: focusQueryKey,
    enabled: Boolean(token),
    queryFn: () => getFocusTasks(token as string, undefined),
  });

  const focusTaskMap = useMemo(() => new Set(focusAssignments.map((assignment) => assignment.task.id)), [focusAssignments]);

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTask(token as string, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      queryClient.invalidateQueries({ queryKey: ["today-dashboard", token] });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to update task status. Please try again.");
      }
    },
  });

  const groupedTasks = useMemo(() => {
    const grouping: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      blocked: [],
      done: [],
    };
    tasks.forEach((task) => {
      grouping[task.status].push(task);
    });
    return grouping;
  }, [tasks]);

  const handleDrop = (status: TaskStatus) => {
    if (!draggedTaskId) return;
    setErrorMessage(null);
    updateTaskMutation.mutate({ taskId: draggedTaskId, status });
    setDraggedTaskId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">Progress Board</CardTitle>
            <CardDescription>
              Drag tasks across columns to reflect progress, unblock work, and celebrate completion.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 text-red-600 dark:border-red-800/70 dark:bg-red-900/20 dark:text-red-200">
          <CardContent className="text-sm">
          {errorMessage}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Loading board...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUS_ORDER.map((status) => (
            <div
              key={status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(status)}
              className={`min-h-[320px] rounded-2xl border p-4 transition ${STATUS_TONES[status]} ${
                draggedTaskId ? "ring-0" : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                  {STATUS_LABELS[status]}
                </h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-300">
                  {groupedTasks[status].length}
                </span>
              </div>
              <div className="space-y-3">
                {groupedTasks[status].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragEnd={() => setDraggedTaskId(null)}
                    className="cursor-grab rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</h3>
                      {focusTaskMap.has(task.id) && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                          Focus
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="mt-2 line-clamp-3 text-xs text-zinc-500 dark:text-zinc-400">{task.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        Priority: {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200">
                          Due {format(parseISO(task.dueDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

