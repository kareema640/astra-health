/**
 * Mission Planner & Activity log API client. Server persistence is the
 * source of truth — these records never live in localStorage. Requests
 * reuse the shared authed transport (token refresh included) from the
 * health client.
 */
import { ApiError } from "./auth-api";
import { apiRequest } from "./health-api";

export type MissionCategory = "Vital Check" | "Exercise" | "Nutrition" | "EVA Prep" | "Rest";
export type MissionPriority = "low" | "medium" | "high";
export type MissionStatus = "pending" | "in_progress" | "done";

export interface PlannerMission {
  id: string;
  title: string;
  description: string | null;
  category: MissionCategory;
  timeUtc: string;
  scheduledDay: string | null;
  durationMin: number | null;
  priority: MissionPriority;
  status: MissionStatus;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MissionInput {
  title: string;
  description?: string | null;
  category?: MissionCategory;
  timeUtc?: string;
  scheduledDay?: string | null;
  durationMin?: number | null;
  priority?: MissionPriority;
  status?: MissionStatus;
}

export type WorkoutFocus = "Resistance" | "Cardio" | "Mobility" | "Core";

export interface WorkoutSession {
  id: string;
  name: string;
  focus: WorkoutFocus;
  durationMin: number;
  sessionDay: string | null;
  notes: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionInput {
  name: string;
  focus?: WorkoutFocus;
  durationMin: number;
  sessionDay?: string | null;
  notes?: string | null;
  completed?: boolean;
}

export const plannerApi = {
  async list(): Promise<PlannerMission[]> {
    const r = await apiRequest<{ missions: PlannerMission[] }>("/api/planner/missions");
    return r.missions;
  },
  create(input: MissionInput): Promise<PlannerMission> {
    return apiRequest<{ mission: PlannerMission }>("/api/planner/missions", {
      body: input,
    }).then((r) => r.mission);
  },
  patch(id: string, patch: Partial<MissionInput>): Promise<PlannerMission> {
    return apiRequest<{ mission: PlannerMission }>(
      `/api/planner/missions/${encodeURIComponent(id)}`,
      { method: "PATCH", body: patch },
    ).then((r) => r.mission);
  },
  remove(id: string): Promise<void> {
    return apiRequest<{ deleted: boolean }>(`/api/planner/missions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).then(() => undefined);
  },
};

export const workoutApi = {
  async list(): Promise<WorkoutSession[]> {
    const r = await apiRequest<{ sessions: WorkoutSession[] }>("/api/workouts/sessions");
    return r.sessions;
  },
  create(input: SessionInput): Promise<WorkoutSession> {
    return apiRequest<{ session: WorkoutSession }>("/api/workouts/sessions", {
      body: input,
    }).then((r) => r.session);
  },
  patch(id: string, patch: Partial<SessionInput>): Promise<WorkoutSession> {
    return apiRequest<{ session: WorkoutSession }>(
      `/api/workouts/sessions/${encodeURIComponent(id)}`,
      { method: "PATCH", body: patch },
    ).then((r) => r.session);
  },
  remove(id: string): Promise<void> {
    return apiRequest<{ deleted: boolean }>(`/api/workouts/sessions/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }).then(() => undefined);
  },
};

export function isAuthIssue(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}
