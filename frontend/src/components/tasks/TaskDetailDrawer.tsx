"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Task, TaskActivity, TaskComment, TaskSubtask } from "@/types";

interface TaskDetailDrawerProps {
  task?: Task;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onToggleSubtask: (subtaskId: string, isCompleted: boolean) => void;
  onCreateSubtask: (title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddComment: (content: string) => void;
  onRefresh: () => void;
}

const activityLabels: Record<TaskActivity["type"], string> = {
  task_created: "Task created",
  task_updated: "Task updated",
  status_changed: "Status changed",
  priority_changed: "Priority updated",
  due_date_changed: "Due date changed",
  estimate_updated: "Estimate updated",
  energy_level_updated: "Task details updated",
  subtask_added: "Subtask added",
  subtask_updated: "Subtask updated",
  subtask_completed: "Subtask completed",
  subtask_reopened: "Subtask reopened",
  comment_added: "Comment added",
  focus_assigned: "Added to focus list",
  focus_cleared: "Removed from focus list",
};

export function TaskDetailDrawer({
  task,
  open,
  loading,
  onClose,
  onToggleSubtask,
  onCreateSubtask,
  onDeleteSubtask,
  onAddComment,
  onRefresh,
}: TaskDetailDrawerProps) {
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setNewSubtask("");
      setNewComment("");
    }
  }, [open]);

  const subtasks = task?.subtasks ?? [];
  const comments = task?.comments ?? [];
  const activities = task?.activities ?? [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.isCompleted).length;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    onCreateSubtask(newSubtask.trim());
    setNewSubtask("");
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 z-40 w-full max-w-xl transform border-l border-zinc-200 bg-white shadow-xl transition-transform dark:border-zinc-800 dark:bg-zinc-950 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{task?.title ?? "Task details"}</h2>
            {task?.dueDate && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Due on {format(parseISO(task.dueDate), "EEEE, MMMM d")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-md border border-zinc-300 px-3 py-1 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-3 py-1 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
            Loading task details...
          </div>
        ) : task ? (
          <div className="flex-1 overflow-y-auto">
            <section className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Overview
              </h3>
              <div className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Priority:</span>
                  <span className="capitalize">{task.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated time:</span>
                  <span>{task.estimatedMinutes ? `${task.estimatedMinutes} minutes` : "Not estimated"}</span>
                </div>
                {task.completedAt && (
                  <div className="flex items-center justify-between">
                    <span>Completed:</span>
                    <span>{format(parseISO(task.completedAt), "MMM d, yyyy HH:mm")}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Created {format(parseISO(task.createdAt), "MMM d, yyyy")}</span>
                  <span>Updated {format(parseISO(task.updatedAt), "MMM d, yyyy HH:mm")}</span>
                </div>
              </div>
              {task.description && (
                <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
                  {task.description}
                </p>
              )}
            </section>

            <section className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Subtasks ({completedSubtasks}/{subtasks.length})
                </h3>
              </div>
              <div className="mt-3 space-y-2">
                {subtasks.length ? (
                  subtasks.map((subtask) => (
                    <label
                      key={subtask.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={subtask.isCompleted}
                          onChange={() => onToggleSubtask(subtask.id, !subtask.isCompleted)}
                        />
                        <span
                          className={`text-sm ${
                            subtask.isCompleted
                              ? "text-zinc-400 line-through dark:text-zinc-500"
                              : "text-zinc-700 dark:text-zinc-200"
                          }`}
                        >
                          {subtask.title}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteSubtask(subtask.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </label>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    No subtasks yet. Break this task down to make progress feel easier.
                  </p>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(event) => setNewSubtask(event.target.value)}
                  placeholder="Add subtask"
                  className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  Add
                </button>
              </div>
            </section>

            <section className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Comments ({comments.length})
              </h3>
              <div className="mt-3 space-y-3">
                {comments.length ? (
                  comments.map((comment: TaskComment) => (
                    <div key={comment.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{comment.author.displayName ?? comment.author.email}</span>
                        <time>{format(parseISO(comment.createdAt), "MMM d, HH:mm")}</time>
                      </div>
                      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    Start the conversation. Comments keep everyone aligned.
                  </p>
                )}
              </div>
              <div className="mt-3 space-y-2">
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value)}
                  placeholder="Leave a note or ask a question"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
                  >
                    Add comment
                  </button>
                </div>
              </div>
            </section>

            <section className="px-6 py-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Activity log
              </h3>
              <div className="mt-3 space-y-3">
                {activities.length ? (
                  activities.map((activity: TaskActivity) => (
                    <div key={activity.id} className="flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium text-zinc-700 dark:text-zinc-200">
                        {activity.actor?.displayName ?? activity.actor?.email ?? "You"}
                      </span>
                      <div>
                        <p>{renderActivityDescription(activity)}</p>
                        <time className="text-[10px] uppercase tracking-wide">
                          {format(parseISO(activity.createdAt), "MMM d, yyyy HH:mm")}
                        </time>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                    Activity will appear here as this task evolves.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
            Select a task to view details.
          </div>
        )}
      </div>
    </div>
  );
}

function renderActivityDescription(activity: TaskActivity): string {
  const base = activityLabels[activity.type] ?? "Activity";
  const metadata = activity.metadata ?? {};

  switch (activity.type) {
    case "status_changed":
      return `${base}: ${metadata.previous ?? "unknown"} → ${metadata.next ?? "unknown"}`;
    case "priority_changed":
      return `${base}: ${metadata.previous ?? "unknown"} → ${metadata.next ?? "unknown"}`;
    case "due_date_changed":
      return `${base}: ${
        metadata.previous ? formatDateMetadata(metadata.previous as string) : "none"
      } → ${metadata.next ? formatDateMetadata(metadata.next as string) : "none"}`;
    case "estimate_updated":
      return `${base}: ${metadata.previous ?? "none"} → ${metadata.next ?? "none"} minutes`;
    case "energy_level_updated":
      return base;
    case "subtask_added":
      return `${base}: ${(metadata.title as string) ?? "New subtask"}`;
    case "subtask_completed":
      return `${base}`;
    case "subtask_reopened":
      return `${base}`;
    case "comment_added":
      return `${base}`;
    case "focus_assigned":
      return `${base} for ${metadata.focusDate ?? "today"}`;
    case "focus_cleared":
      return `${base} for ${metadata.focusDate ?? "today"}`;
    default:
      return base;
  }
}

function formatDateMetadata(value: string) {
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

