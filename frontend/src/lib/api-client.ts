import {
  AnalyticsSummary,
  AuthResponse,
  DailyReflection,
  FocusTaskAssignment,
  Insight,
  Task,
  TaskEnergyLevel,
  TaskPriority,
  TaskStatus,
  TodayDashboard,
  User,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  searchParams?: Record<string, string | undefined>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path, API_URL);

  if (options.searchParams) {
    Object.entries(options.searchParams)
      .filter(([, value]) => value !== undefined && value !== "")
      .forEach(([key, value]) => url.searchParams.append(key, value as string));
  }

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  let payload: unknown = null;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in (payload as Record<string, unknown>)
      ? String((payload as Record<string, unknown>).message)
      : response.statusText || "Request failed";
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export function signUp(data: { email: string; password: string; displayName?: string }) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: data,
  });
}

export function signIn(data: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: data,
  });
}

export function getCurrentUser(token: string) {
  return request<User>("/users/me", {
    token,
  });
}

export function getTasks(
  token: string,
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    energyLevel?: TaskEnergyLevel;
    search?: string;
    dueBefore?: string;
    dueAfter?: string;
  } = {},
) {
  return request<Task[]>("/tasks", {
    token,
    searchParams: filters,
  });
}

export function getTaskDetail(token: string, taskId: string) {
  return request<Task>(`/tasks/${taskId}`, {
    token,
  });
}

export function createTask(
  token: string,
  data: {
    title: string;
    description?: string;
    dueDate?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    energyLevel?: TaskEnergyLevel;
    estimatedMinutes?: number | null;
  },
) {
  return request<Task>("/tasks", {
    method: "POST",
    token,
    body: data,
  });
}

export function updateTask(
  token: string,
  id: string,
  data: {
    title?: string;
    description?: string | null;
    dueDate?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    energyLevel?: TaskEnergyLevel;
    estimatedMinutes?: number | null;
  },
) {
  return request<Task>(`/tasks/${id}`, {
    method: "PATCH",
    token,
    body: data,
  });
}

export function deleteTask(token: string, id: string) {
  return request<{ success: true }>(`/tasks/${id}`, {
    method: "DELETE",
    token,
  });
}

export function getSubtasks(token: string, taskId: string) {
  return request<Task["subtasks"]>(`/tasks/${taskId}/subtasks`, {
    token,
  });
}

export function createSubtask(
  token: string,
  taskId: string,
  payload: { title: string; position?: number },
) {
  return request<Task["subtasks"]>(`/tasks/${taskId}/subtasks`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateSubtask(
  token: string,
  taskId: string,
  subtaskId: string,
  payload: { title?: string; position?: number; isCompleted?: boolean },
) {
  return request<Task["subtasks"]>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteSubtask(token: string, taskId: string, subtaskId: string) {
  return request<Task["subtasks"]>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "DELETE",
    token,
  });
}

export function getComments(token: string, taskId: string) {
  return request<Task["comments"]>(`/tasks/${taskId}/comments`, {
    token,
  });
}

export function createComment(token: string, taskId: string, payload: { content: string }) {
  return request<Task["comments"]>(`/tasks/${taskId}/comments`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function getTaskActivity(token: string, taskId: string) {
  return request<Task["activities"]>(`/tasks/${taskId}/activity`, {
    token,
  });
}

export function getFocusTasks(token: string, date?: string) {
  return request<FocusTaskAssignment[]>("/focus", {
    token,
    searchParams: { date },
  });
}

export function updateFocusTasks(token: string, payload: { date?: string; taskIds: string[] }) {
  return request<FocusTaskAssignment[]>("/focus", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getTodayDashboard(token: string) {
  return request<TodayDashboard>("/dashboard/today", {
    token,
  });
}

export function getInsights(token: string) {
  return request<Insight[]>("/insights", {
    token,
  });
}

export function getAnalytics(token: string) {
  return request<AnalyticsSummary>("/analytics", {
    token,
  });
}

export function getPlanningRecommendations(
  token: string,
  payload: { availableMinutes: number; energyLevel?: TaskEnergyLevel },
) {
  return request<Task[]>("/planning/recommendations", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getReflection(token: string, date?: string) {
  return request<DailyReflection | null>("/reflections", {
    token,
    searchParams: { date },
  });
}

export function submitReflection(
  token: string,
  payload: { date?: string; wentWell?: string; blockers?: string; winOfDay?: string },
) {
  return request<DailyReflection>("/reflections", {
    method: "POST",
    token,
    body: payload,
  });
}

