import { useCallback, useEffect, useState } from "react";

/**
 * Small piece of dashboard state saved in this browser (planner tasks, read notifications).
 * Reads after mount so server and first client render match.
 */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // Keep the initial value.
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable: the value still lives in memory.
    }
  }, [key, value, hydrated]);

  const update = useCallback((next: T | ((prev: T) => T)) => setValue(next), []);
  return [value, update, hydrated] as const;
}

export const PLANNER_KEY = "astra-planner-v1";
export const NOTIFICATIONS_KEY = "astra-notifications-read-v1";

/** Clears dashboard-only saved state (used by "Reset all data"). */
export function clearDashboardStorage() {
  try {
    window.localStorage.removeItem(PLANNER_KEY);
    window.localStorage.removeItem(NOTIFICATIONS_KEY);
  } catch {
    // Nothing to clear.
  }
}
