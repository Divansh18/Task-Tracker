export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";

export type TaskEnergyLevel = "low" | "medium" | "high";

export interface User {
  id: string;
  email: string;
  displayName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSubtask {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, "id" | "email" | "displayName">;
}

export interface TaskActivity {
  id: string;
  type:
    | "task_created"
    | "task_updated"
    | "status_changed"
    | "priority_changed"
    | "due_date_changed"
    | "estimate_updated"
    | "energy_level_updated"
    | "subtask_added"
    | "subtask_updated"
    | "subtask_completed"
    | "subtask_reopened"
    | "comment_added"
    | "focus_assigned"
    | "focus_cleared";
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: Pick<User, "id" | "email" | "displayName"> | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  energyLevel: TaskEnergyLevel;
  estimatedMinutes?: number | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks?: TaskSubtask[];
  comments?: TaskComment[];
  activities?: TaskActivity[];
}

export interface FocusTaskAssignment {
  id: string;
  focusDate: string;
  position: number;
  task: Task;
}

export interface DailyReflection {
  id: string;
  reflectDate: string;
  wentWell?: string | null;
  blockers?: string | null;
  winOfDay?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodayDashboard {
  date: string;
  summary: {
    totalTasks: number;
    completedToday: number;
    overdueCount: number;
    inProgress: number;
    focusAssigned: number;
  };
  focus: {
    tasks: FocusTaskAssignment[];
    remainingSlots: number;
  };
  streak: {
    current: number;
    longest: number;
    lastCompletedDate?: string;
  };
  score: {
    value: number;
    breakdown: {
      base: number;
      focus: number;
      overduePenalty: number;
    };
    completedToday: number;
    focusAssigned: number;
    focusCompleted: number;
    overdueCount: number;
  };
  sections: {
    dueToday: Task[];
    upcoming: Task[];
    overdue: Task[];
    inProgress: Task[];
    focusTaskIds: string[];
  };
  energyBreakdown: Array<{
    energyLevel: TaskEnergyLevel;
    done: number;
    inProgress: number;
    todo: number;
  }>;
  reflection: DailyReflection | null;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
}

export interface AnalyticsSummary {
  completionTrend: Array<{ date: string; count: number }>;
  overdueTrend: Array<{ date: string; count: number }>;
  priorityBreakdown: Array<{
    priority: TaskPriority;
    completed: number;
    open: number;
  }>;
  energyLevelBreakdown: Array<{
    energyLevel: TaskEnergyLevel;
    count: number;
  }>;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

