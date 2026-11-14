import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useOnboarding } from "@/components/onboarding/onboarding-store";

import { buildNotifications, type DashNotification } from "./health";
import { NOTIFICATIONS_KEY, useStoredState } from "./use-stored-state";

interface NotificationsValue {
  items: DashNotification[];
  unread: number;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsValue | null>(null);

/** Shares the notice list and its read state between the sidebar badge and the page. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { data, hydrated } = useOnboarding();
  const [readIds, setReadIds, readHydrated] = useStoredState<string[]>(NOTIFICATIONS_KEY, []);
  const items = useMemo(() => buildNotifications(data), [data]);

  const isRead = useCallback((id: string) => readIds.includes(id), [readIds]);
  const markRead = useCallback(
    (id: string) => setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setReadIds],
  );
  const markAllRead = useCallback(
    () => setReadIds((prev) => Array.from(new Set([...prev, ...items.map((i) => i.id)]))),
    [items, setReadIds],
  );

  const unread = hydrated && readHydrated ? items.filter((i) => !readIds.includes(i.id)).length : 0;
  const value = useMemo(
    () => ({ items, unread, isRead, markRead, markAllRead }),
    [items, unread, isRead, markRead, markAllRead],
  );
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationsProvider>");
  return ctx;
}
