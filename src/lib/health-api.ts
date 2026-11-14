/**
 * ASTRA HEALTH health-data API client.
 * Thin layer over the platform backend (profile sync, daily records,
 * analytics). Tokens come from the auth module only — this file stores and
 * sends no credentials of its own. All calls degrade silently offline: the
 * app keeps working from the local store, syncing when possible.
 */
import type { OnboardingData } from "@/components/onboarding/onboarding-store";

import { ApiError, authApi } from "./auth-api";

const BASE: string = (
  (import.meta as { env?: Record<string, string | undefined> }).env?.["VITE_API_URL"] ||
  "http://localhost:3001"
).replace(/\/+$/, "");

export function isSignedIn(): boolean {
  return authApi.getSession() !== null;
}

async function authedRequest<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const session = authApi.getSession();
  if (!session) throw new ApiError(401, "UNAUTHORIZED", "Sign in required");

  const send = async (token: string): Promise<T> => {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    const init: RequestInit = {
      method: options.method ?? (options.body === undefined ? "GET" : "POST"),
      headers,
      credentials: "omit",
    };
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
    const res = await fetch(`${BASE}${path}`, init);
    if (res.status === 401) throw new ApiError(401, "TOKEN_EXPIRED", "Session token expired");
    if (!res.ok) {
      let code = "UNKNOWN";
      let message = "Request failed";
      try {
        const json = (await res.json()) as { error?: { code?: string; message?: string } };
        code = json.error?.code ?? code;
        message = json.error?.message ?? message;
      } catch {
        /* non-JSON */
      }
      throw new ApiError(res.status, code, message);
    }
    return (await res.json()) as T;
  };

  try {
    return await send(session.accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      const fresh = await authApi.refresh();
      if (fresh) return send(fresh.accessToken);
    }
    throw err;
  }
}

/** The store payload minus the avatar data-URL (images stay on-device). */
function syncableSnapshot(data: OnboardingData) {
  const { avatar, ...rest } = data;
  const { customPhoto: _customPhoto, ...avatarRest } = avatar;
  return { ...rest, avatar: avatarRest };
}

/** Reused by the assistant client — one auth/refresh path for the whole app. */
export async function apiRequest<T>(
  path: string,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  return authedRequest<T>(path, options);
}

export async function syncOnboarding(data: OnboardingData): Promise<void> {
  await authedRequest("/api/onboarding/sync", { body: syncableSnapshot(data) });
}

export interface RemoteSnapshot {
  hasData: boolean;
  snapshot: OnboardingData | null;
}

export async function fetchOnboardingSnapshot(): Promise<RemoteSnapshot> {
  return authedRequest<RemoteSnapshot>("/api/onboarding/snapshot");
}
