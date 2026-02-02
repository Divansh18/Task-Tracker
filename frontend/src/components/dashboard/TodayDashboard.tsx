"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DailyReflection,
  FocusTaskAssignment,
  Task,
  TaskPriority,
  TaskStatus,
  TodayDashboard as TodayDashboardData,
} from "@/types";
import {
  ApiError,
  getPlanningRecommendations,
  getTasks,
  getTodayDashboard,
  submitReflection,
  updateFocusTasks,
} from "@/lib/api-client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";

type FocusPickerProps = {
  tasks: Task[];
  selectedIds: Set<string>;
  onToggle: (taskId: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error?: string | null;
};

function FocusTaskPicker({ tasks, selectedIds, onToggle, onClose, onSave, saving, error }: FocusPickerProps) {
  const renderTask = (task: Task) => {
    const dueDateLabel = task.dueDate ? format(parseISO(task.dueDate), "MMM d") : "No due date";
    const isSelected = selectedIds.has(task.id);
    const disableSelection = selectedIds.size >= 3 && !isSelected;
    return (
      <label
        key={task.id}
        className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition ${
          isSelected
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
            : "border-zinc-200 hover:border-blue-400 dark:border-zinc-800 dark:hover:border-blue-600"
        } ${disableSelection ? "opacity-60" : ""}`}
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {TaskPriorityLabels[task.priority]} • {TaskStatusLabels[task.status]} • {dueDateLabel}
          </span>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          disabled={disableSelection}
          onChange={() => onToggle(task.id)}
          className="h-4 w-4"
        />
      </label>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">Daily focus selection</CardTitle>
            <CardDescription>Choose up to three high-impact tasks to highlight today.</CardDescription>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="mt-2 inline-flex h-9 items-center rounded-md border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:mt-0"
          >
            Close
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Selected {selectedIds.size} / 3 focus tasks
            </span>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
          <div className="grid max-h-80 gap-3 overflow-y-auto pr-1">
            {tasks.length ? tasks.map(renderTask) : <p className="text-sm text-zinc-500">No tasks available.</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <button
            onClick={onClose}
            type="button"
            className="inline-flex h-9 items-center rounded-md border border-zinc-300 px-4 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            type="button"
            onClick={onSave}
            className="inline-flex h-9 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

const TaskPriorityLabels: Record<TaskPriority, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
};

const TaskStatusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

type ReflectionFormState = {
  wentWell: string;
  blockers: string;
  winOfDay: string;
};

export function TodayDashboard() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [focusPickerOpen, setFocusPickerOpen] = useState(false);
  const [selectedFocusIds, setSelectedFocusIds] = useState<Set<string>>(new Set());
  const [plannerInput, setPlannerInput] = useState({ minutes: 60 });
  const [reflectionState, setReflectionState] = useState<ReflectionFormState>({
    wentWell: "",
    blockers: "",
    winOfDay: "",
  });
  const [reflectionFeedback, setReflectionFeedback] = useState<string | null>(null);

  const dashboardQueryKey = ["today-dashboard", token];
  const tasksQueryKey = ["tasks-for-focus", token];

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: dashboardQueryKey,
    enabled: Boolean(token),
    queryFn: () => getTodayDashboard(token as string),
  });

  const { data: taskPool = [] } = useQuery({
    queryKey: tasksQueryKey,
    enabled: Boolean(token && focusPickerOpen),
    queryFn: () =>
      getTasks(token as string, {
        status: undefined,
      }),
  });

  useEffect(() => {
    if (dashboard?.focus.tasks) {
      setSelectedFocusIds(new Set(dashboard.focus.tasks.map((focus) => focus.task.id)));
    }
    if (dashboard?.reflection) {
      setReflectionState({
        wentWell: dashboard.reflection.wentWell ?? "",
        blockers: dashboard.reflection.blockers ?? "",
        winOfDay: dashboard.reflection.winOfDay ?? "",
      });
    }
  }, [dashboard]);

  const focusMutation = useMutation({
    mutationFn: (payload: { taskIds: string[] }) =>
      updateFocusTasks(token as string, { taskIds: payload.taskIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
      setFocusPickerOpen(false);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        setFocusError(error.message);
      } else {
        setFocusError("Unable to update focus tasks. Please try again.");
      }
    },
  });

  const planningMutation = useMutation({
    mutationFn: (payload: { minutes: number }) =>
      getPlanningRecommendations(token as string, {
        availableMinutes: payload.minutes,
      }),
  });

  const reflectionMutation = useMutation({
    mutationFn: (body: ReflectionFormState) =>
      submitReflection(token as string, {
        wentWell: body.wentWell,
        blockers: body.blockers,
        winOfDay: body.winOfDay,
      }),
    onSuccess: (reflection: DailyReflection) => {
      queryClient.setQueryData<TodayDashboardData | undefined>(dashboardQueryKey, (previous) =>
        previous
          ? {
              ...previous,
              reflection,
            }
          : previous,
      );
      setReflectionFeedback("Reflection saved for today!");
      setTimeout(() => setReflectionFeedback(null), 3500);
    },
    onError: () => {
      setReflectionFeedback("Unable to save your reflection. Please try again.");
    },
  });

  const [focusError, setFocusError] = useState<string | null>(null);

  const availableFocusTasks = useMemo(
    () =>
      taskPool.filter(
        (task) => task.status !== "done" && !dashboard?.focus.tasks.some((focus) => focus.task.id === task.id),
      ),
    [taskPool, dashboard?.focus.tasks],
  );

  const closeFocusPicker = () => {
    setFocusPickerOpen(false);
    setFocusError(null);
    if (dashboard) {
      setSelectedFocusIds(new Set(dashboard.focus.tasks.map((entry) => entry.task.id)));
    }
  };

  const handleToggleFocus = (taskId: string) => {
    setFocusError(null);
    setSelectedFocusIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else if (next.size < 3) {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleSaveFocus = () => {
    setFocusError(null);
    focusMutation.mutate({ taskIds: Array.from(selectedFocusIds) });
  };

  const handleReflectionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reflectionMutation.mutate(reflectionState);
  };

  const handlePlannerSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    planningMutation.mutate({
      minutes: plannerInput.minutes,
    });
  };

  if (dashboardLoading) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        Loading your day...
      </div>
    );
  }

  if (dashboardError || !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-600 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
        We weren&apos;t able to load your dashboard right now. Please refresh or try again later.
      </div>
    );
  }

  const planningSuggestions = planningMutation.data ?? [];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[2.2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-blue-600 dark:text-blue-300">
                  Today
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {format(parseISO(dashboard.date), "EEEE, MMMM d")}
                </h2>
              </div>
              <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                Streak: {dashboard.streak.current} day{dashboard.streak.current === 1 ? "" : "s"}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
                Focus on what moves you forward. Review your focus tasks, plan how to use your time, and celebrate the
                progress you make today.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard label="Total tasks" value={dashboard.summary.totalTasks} tone="neutral" />
                <SummaryCard label="Completed today" value={dashboard.summary.completedToday} tone="positive" />
                <SummaryCard label="In progress" value={dashboard.summary.inProgress} tone="accent" />
                <SummaryCard label="Overdue" value={dashboard.summary.overdueCount} tone="alert" />
              </div>
            </CardContent>
          </Card>

          <ScoreCard score={dashboard.score} />

          <TaskSections sections={dashboard.sections} />
        </div>

        <aside className="space-y-6">
          <FocusTasksPanel
            focus={dashboard.focus}
            onManageFocus={() => {
              setSelectedFocusIds(new Set(dashboard.focus.tasks.map((entry) => entry.task.id)));
              setFocusError(null);
              setFocusPickerOpen(true);
            }}
          />

          <PlannerWidget
            plannerInput={plannerInput}
            onChange={setPlannerInput}
            onSubmit={handlePlannerSubmit}
            suggestions={planningSuggestions}
            loading={planningMutation.isPending}
          />
        </aside>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>End-of-day reflection</CardTitle>
          <CardDescription>Capture today’s insights to help your future self plan smarter.</CardDescription>
        </CardHeader>
        <CardContent>
        <form className="space-y-4" onSubmit={handleReflectionSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">What went well?</span>
            <textarea
              value={reflectionState.wentWell}
              onChange={(event) =>
                setReflectionState((previous) => ({ ...previous, wentWell: event.target.value }))
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
              placeholder="Celebrate the moments that created momentum."
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Any blockers?</span>
            <textarea
              value={reflectionState.blockers}
              onChange={(event) =>
                setReflectionState((previous) => ({ ...previous, blockers: event.target.value }))
              }
              rows={3}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
              placeholder="Note anything that slowed you down."
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">One win you&apos;re proud of</span>
            <textarea
              value={reflectionState.winOfDay}
              onChange={(event) =>
                setReflectionState((previous) => ({ ...previous, winOfDay: event.target.value }))
              }
              rows={2}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
              placeholder="Highlight the moment you want to remember."
            />
          </label>
          <div className="flex items-center justify-between">
            {reflectionFeedback && (
              <span className="text-sm text-blue-600 dark:text-blue-300">{reflectionFeedback}</span>
            )}
            <button
              type="submit"
              disabled={reflectionMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {reflectionMutation.isPending ? "Saving..." : "Save reflection"}
            </button>
          </div>
        </form>
        </CardContent>
      </Card>

      {focusPickerOpen && (
        <FocusTaskPicker
          tasks={[...dashboard.focus.tasks.map((entry) => entry.task), ...availableFocusTasks]}
          selectedIds={selectedFocusIds}
          onToggle={handleToggleFocus}
          onClose={closeFocusPicker}
          onSave={handleSaveFocus}
          saving={focusMutation.isPending}
          error={focusError}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "positive" | "accent" | "alert";
}) {
  const toneClasses: Record<typeof tone, string> = {
    neutral: "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100",
    positive: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
    accent: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
    alert: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  };

  return (
    <Card className={toneClasses[tone]}>
      <CardContent className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ScoreCard({ score }: { score: TodayDashboardData["score"] }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardDescription className="uppercase tracking-[0.3em]">Productivity score</CardDescription>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100">{score.value}</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">out of 100</span>
          </div>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
            <p className="font-semibold">Completed tasks</p>
            <p>
              {score.completedToday} • +{score.breakdown.base} pts
            </p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
            <p className="font-semibold">Focus progress</p>
            <p>
              {score.focusCompleted}/{score.focusAssigned} • +{score.breakdown.focus} pts
            </p>
          </div>
          <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
            <p className="font-semibold">Overdue drag</p>
            <p>
              {score.overdueCount} • -{score.breakdown.overduePenalty} pts
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all dark:from-blue-400 dark:to-violet-400"
            style={{ width: `${score.value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FocusTasksPanel({
  focus,
  onManageFocus,
}: {
  focus: TodayDashboardData["focus"];
  onManageFocus: () => void;
}) {
  const focusTasks = focus.tasks;
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle>Daily focus</CardTitle>
          <CardDescription>
            Highlight up to three essential tasks. Completed focus work boosts your score.
          </CardDescription>
        </div>
        <button
          onClick={onManageFocus}
          type="button"
          className="inline-flex h-9 items-center rounded-md border border-blue-200 px-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/30"
        >
          Manage
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        {focusTasks.length ? (
          focusTasks.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start justify-between rounded-xl border border-zinc-200 px-3 py-3 dark:border-zinc-700"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{entry.task.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Priority: {TaskPriorityLabels[entry.task.priority]}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  entry.task.status === "done"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {TaskStatusLabels[entry.task.status]}
              </span>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            No focus tasks selected yet. Pick up to three to stay on track.
          </p>
        )}
      </CardContent>
      <CardFooter className="text-xs text-zinc-500 dark:text-zinc-400">
        {focus.remainingSlots > 0
          ? `${focus.remainingSlots} focus slot${focus.remainingSlots === 1 ? "" : "s"} available today.`
          : "Focus list full — complete one to free up space."}
      </CardFooter>
    </Card>
  );
}

function PlannerWidget({
  plannerInput,
  onChange,
  onSubmit,
  suggestions,
  loading,
}: {
  plannerInput: { minutes: number };
  onChange: (value: { minutes: number }) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  suggestions: Task[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart planning</CardTitle>
        <CardDescription>Tell us how much time you have and we'll suggest high-impact tasks to fit the window.</CardDescription>
      </CardHeader>
      <CardContent>
      <form className="space-y-3" onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Available time (minutes)</span>
          <input
            type="number"
            min={15}
            max={600}
            value={plannerInput.minutes}
            onChange={(event) =>
              onChange({
                minutes: Number(event.target.value) || plannerInput.minutes,
              })
            }
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          {loading ? "Generating..." : "Suggest tasks"}
        </button>
      </form>
      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-zinc-500 dark:text-zinc-400">Calculating your best matches...</p>}
        {!loading && suggestions.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            We&apos;ll show tailored recommendations here. Enter your available time to get started.
          </p>
        )}
        {suggestions.map((task) => (
          <div key={task.id} className="rounded-lg border border-zinc-200 px-3 py-3 dark:border-zinc-700">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{task.title}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Priority: {TaskPriorityLabels[task.priority]} • Estimate:{" "}
              {task.estimatedMinutes ? `${task.estimatedMinutes} mins` : "unspecified"}
            </p>
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
}

function TaskSections({
  sections,
}: {
  sections: TodayDashboardData["sections"];
}) {
  const renderSection = (title: string, tasks: Task[], emptyMessage: string) => (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length ? (
          tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-zinc-200 px-3 py-3 transition hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-500"
            >
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{task.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Priority: {TaskPriorityLabels[task.priority]}
                {task.dueDate ? ` • due ${format(parseISO(task.dueDate), "MMM d")}` : ""}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {emptyMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {renderSection("Due today", sections.dueToday, "No tasks due today — consider pulling something forward.")}
      {renderSection("Overdue", sections.overdue, "No overdue tasks. Great job staying ahead!")}
      {renderSection("Upcoming", sections.upcoming, "No tasks scheduled for the next few days.")}
      {renderSection("In progress", sections.inProgress, "Move a task into progress to build momentum.")}
    </div>
  );
}


