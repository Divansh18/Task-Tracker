"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Task } from "@/types";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer")
    .optional()
    .or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["todo", "in_progress", "blocked", "done"]),
  estimatedMinutes: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || value === "" || /^\d+$/.test(value),
      "Estimate must be a whole number",
    )
    .refine(
      (value) =>
        value === undefined ||
        value === "" ||
        (Number(value) >= 5 && Number(value) <= 600),
      "Estimate should be between 5 and 600 minutes",
    ),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
export type TaskFormSubmitValues = Omit<TaskFormValues, "estimatedMinutes"> & {
  estimatedMinutes?: number;
};

interface TaskFormProps {
  submitting: boolean;
  initialTask?: Task | null;
  onSubmit: (values: TaskFormSubmitValues) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ submitting, initialTask, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      status: "todo",
      estimatedMinutes: "",
    },
  });

  useEffect(() => {
    if (initialTask) {
      reset({
        title: initialTask.title,
        description: initialTask.description ?? "",
        dueDate: initialTask.dueDate ? initialTask.dueDate.split("T")[0] : "",
        priority: initialTask.priority,
        status: initialTask.status,
        estimatedMinutes: initialTask.estimatedMinutes ? String(initialTask.estimatedMinutes) : "",
      });
    } else {
      reset({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "todo",
        estimatedMinutes: "",
      });
    }
  }, [initialTask, reset]);

  const handleFormSubmit = async (values: TaskFormValues) => {
    const estimatedMinutes =
      values.estimatedMinutes && values.estimatedMinutes !== ""
        ? Number(values.estimatedMinutes)
        : undefined;
    await onSubmit({
      ...values,
      description: values.description?.trim() ? values.description : undefined,
      dueDate: values.dueDate ? values.dueDate : undefined,
      estimatedMinutes,
    });
    if (!initialTask) {
      reset({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        status: "todo",
        estimatedMinutes: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
          placeholder="Add more context..."
          {...register("description")}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="dueDate">
            Due date
          </label>
          <input
            id="dueDate"
            type="date"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
            {...register("dueDate")}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            htmlFor="priority"
          >
            Priority
          </label>
          <select
            id="priority"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
            {...register("priority")}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
            {...register("status")}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300" htmlFor="estimatedMinutes">
            Estimated time (minutes)
          </label>
          <input
            id="estimatedMinutes"
            type="number"
            min={5}
            max={600}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
            {...register("estimatedMinutes")}
          />
          {errors.estimatedMinutes && (
            <p className="mt-1 text-xs text-red-500">{errors.estimatedMinutes.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-200 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          {submitting ? "Saving..." : initialTask ? "Update task" : "Create task"}
        </button>
      </div>
    </form>
  );
}

