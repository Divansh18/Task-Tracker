"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  createComment,
  createSubtask,
  createTask,
  deleteSubtask,
  deleteTask,
  getFocusTasks,
  getTaskDetail,
  getTasks,
  updateSubtask,
  updateTask,
} from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { FocusTaskAssignment, Task, TaskStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TaskFilters, TaskFilterState } from "./TaskFilters";
import { TaskForm, TaskFormSubmitValues } from "./TaskForm";
import { TaskList } from "./TaskList";
import { TaskDetailDrawer } from "./TaskDetailDrawer";

export function TasksView() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<TaskFilterState>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tasksQueryKey = [
    "tasks",
    token,
    filters.status ?? "",
    filters.priority ?? "",
    filters.search ?? "",
    filters.dueAfter ?? "",
    filters.dueBefore ?? "",
  ];

  const focusQueryKey = ["focus", token];
  const detailQueryKey = ["task-detail", token, selectedTaskId];

  const {
    data: tasks = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: tasksQueryKey,
    enabled: Boolean(token),
    queryFn: () => getTasks(token as string, filters),
  });

  const { data: focusAssignments = [] } = useQuery({
    queryKey: focusQueryKey,
    enabled: Boolean(token),
    queryFn: () => getFocusTasks(token as string, undefined),
  });

  const {
    data: taskDetail,
    isFetching: detailLoading,
  } = useQuery({
    queryKey: detailQueryKey,
    enabled: Boolean(token && selectedTaskId),
    queryFn: () => getTaskDetail(token as string, selectedTaskId as string),
  });

  const focusTaskIds = useMemo(
    () => (focusAssignments as FocusTaskAssignment[]).map((focus) => focus.task.id),
    [focusAssignments],
  );

  const createTaskMutation = useMutation({
    mutationFn: (values: TaskFormSubmitValues) =>
      createTask(token as string, {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate ?? undefined,
        priority: values.priority,
        status: values.status,
        estimatedMinutes: values.estimatedMinutes ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      queryClient.invalidateQueries({ queryKey: ["today-dashboard", token] });
      setIsFormOpen(false);
      setEditingTask(null);
    },
    onError: (error: unknown) => setErrorMessage(error instanceof ApiError ? error.message : "Unable to create task."),
  });

  const updateTaskMutation = useMutation({
    mutationFn: (values: TaskFormSubmitValues) =>
      updateTask(token as string, editingTask?.id as string, {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate ?? undefined,
        priority: values.priority,
        status: values.status,
        estimatedMinutes: values.estimatedMinutes ?? undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
      queryClient.invalidateQueries({ queryKey: ["today-dashboard", token] });
      setIsFormOpen(false);
      setEditingTask(null);
    },
    onError: (error: unknown) => setErrorMessage(error instanceof ApiError ? error.message : "Unable to update task."),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(token as string, taskId),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      queryClient.invalidateQueries({ queryKey: ["today-dashboard", token] });
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
    },
    onError: (error: unknown) => setErrorMessage(error instanceof ApiError ? error.message : "Unable to delete task."),
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTask(token as string, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
      queryClient.invalidateQueries({ queryKey: ["today-dashboard", token] });
    },
    onError: (error: unknown) => setErrorMessage(error instanceof ApiError ? error.message : "Unable to update status."),
  });

  const createSubtaskMutation = useMutation({
    mutationFn: (payload: { taskId: string; title: string }) =>
      createSubtask(token as string, payload.taskId, { title: payload.title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
    },
    onError: (error: unknown) =>
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to add subtask."),
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: (payload: { taskId: string; subtaskId: string; isCompleted: boolean }) =>
      updateSubtask(token as string, payload.taskId, payload.subtaskId, { isCompleted: payload.isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
      queryClient.invalidateQueries({ queryKey: ["today-dashboard", token] });
    },
    onError: (error: unknown) =>
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to update subtask."),
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: (payload: { taskId: string; subtaskId: string }) =>
      deleteSubtask(token as string, payload.taskId, payload.subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
    },
    onError: (error: unknown) =>
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to remove subtask."),
  });

  const createCommentMutation = useMutation({
    mutationFn: (payload: { taskId: string; content: string }) =>
      createComment(token as string, payload.taskId, { content: payload.content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
    },
    onError: (error: unknown) =>
      setErrorMessage(error instanceof ApiError ? error.message : "Unable to add comment."),
  });

  const handleFiltersChange = (nextFilters: TaskFilterState) => {
    setFilters(nextFilters);
  };

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
    setErrorMessage(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
    setErrorMessage(null);
  };

  const handleDeleteTask = (task: Task) => {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);
    if (!confirmed) return;
    deleteTaskMutation.mutate(task.id);
  };

  const handleStatusChange = (task: Task, nextStatus: TaskStatus) => {
    setErrorMessage(null);
    statusMutation.mutate({ taskId: task.id, status: nextStatus });
  };

  const handleSubmitTask = async (values: TaskFormSubmitValues) => {
    setErrorMessage(null);
    if (editingTask) {
      await updateTaskMutation.mutateAsync(values);
    } else {
      await createTaskMutation.mutateAsync(values);
    }
  };

  const closeDrawer = () => {
    setSelectedTaskId(null);
  };

  return (
    <div className="relative space-y-6">
      <TaskFilters filters={filters} onChange={handleFiltersChange} onCreateClick={handleCreateClick} />

      {errorMessage && (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
          <CardContent className="text-sm">{errorMessage}</CardContent>
        </Card>
      )}

      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTask ? "Edit task" : "Create task"}</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskForm
              submitting={createTaskMutation.isPending || updateTaskMutation.isPending}
              initialTask={editingTask}
              onSubmit={handleSubmitTask}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTask(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      <TaskList
        tasks={tasks}
        loading={isLoading || isFetching || deleteTaskMutation.isPending}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
        onSelect={(task) => setSelectedTaskId(task.id)}
        focusTaskIds={focusTaskIds}
      />

      {selectedTaskId && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={closeDrawer}
          role="button"
          tabIndex={-1}
          aria-label="Close task details"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeDrawer();
            }
          }}
        />
      )}
      <TaskDetailDrawer
        task={taskDetail}
        open={Boolean(selectedTaskId)}
        loading={detailLoading}
        onClose={closeDrawer}
        onToggleSubtask={(subtaskId, isCompleted) =>
          updateSubtaskMutation.mutate({ taskId: selectedTaskId as string, subtaskId, isCompleted })
        }
        onCreateSubtask={(title) => createSubtaskMutation.mutate({ taskId: selectedTaskId as string, title })}
        onDeleteSubtask={(subtaskId) => deleteSubtaskMutation.mutate({ taskId: selectedTaskId as string, subtaskId })}
        onAddComment={(content) => createCommentMutation.mutate({ taskId: selectedTaskId as string, content })}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: detailQueryKey })}
      />
    </div>
  );
}

