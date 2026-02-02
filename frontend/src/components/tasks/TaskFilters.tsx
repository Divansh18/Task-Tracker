"use client";

import { ChangeEvent } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { TaskPriority, TaskStatus } from "@/types";

export type TaskFilterState = {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  dueAfter?: string;
  dueBefore?: string;
};

interface TaskFiltersProps {
  filters: TaskFilterState;
  onChange: (filters: TaskFilterState) => void;
  onCreateClick: () => void;
}

export function TaskFilters({ filters, onChange, onCreateClick }: TaskFiltersProps) {
  const handleSelectChange =
    (key: keyof TaskFilterState) =>
    (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value || undefined;
      onChange({
        ...filters,
        [key]: value,
      });
    };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      search: event.target.value || undefined,
    });
  };

  const handleClear = () => {
    onChange({});
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,160px))]">
        <input
          type="search"
          placeholder="Search by title or description"
          value={filters.search ?? ""}
          onChange={handleSearchChange}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 sm:max-w-xs"
        />
        <select
          value={filters.status ?? ""}
          onChange={handleSelectChange("status")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 sm:w-40"
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filters.priority ?? ""}
          onChange={handleSelectChange("priority")}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 sm:w-40"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={filters.dueAfter ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              dueAfter: event.target.value || undefined,
            })
          }
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 sm:w-40"
          placeholder="Due after"
        />
        <input
          type="date"
          value={filters.dueBefore ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              dueBefore: event.target.value || undefined,
            })
          }
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400 sm:w-40"
          placeholder="Due before"
        />
      </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Refine by status, priority, or due date to narrow the list.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onCreateClick}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-200 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            New task
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}

