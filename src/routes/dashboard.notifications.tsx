import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Bell, Check, CheckCheck, Info, Sparkles } from "lucide-react";

import { useNotifications } from "@/components/dashboard/notifications-context";
import { DASH_GHOST, DashCard, PageHeader } from "@/components/dashboard/ui";
import { stepHead } from "@/components/onboarding/steps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () =>
    stepHead("Notifications", "System alerts, profile reminders, and telemetry readiness notices."),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { items, unread, isRead, markRead, markAllRead } = useNotifications();

  return (
    <div className="flex w-full flex-col gap-[20px]">
      <PageHeader
        title="Notifications"
        subtitle={
          unread > 0
            ? `You have ${unread} unread mission ${unread === 1 ? "notice" : "notices"}.`
            : "All mission notifications are caught up."
        }
        actions={
          unread > 0 ? (
            <button type="button" onClick={markAllRead} className={DASH_GHOST}>
              <CheckCheck className="size-[17px]" />
              Mark all as read
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-[14px]">
        {items.length === 0 ? (
          <DashCard className="flex flex-col items-center py-[44px] text-center">
            <Bell className="size-[38px] text-dash-cyan" />
            <p className="mt-[12px] text-[18px] font-bold text-foreground">All caught up</p>
            <p className="mt-[4px] text-[14.5px] text-dash-muted">
              No active notifications right now.
            </p>
          </DashCard>
        ) : (
          items.map((item) => {
            const read = isRead(item.id);
            const ToneIcon =
              item.tone === "warning" ? AlertTriangle : item.tone === "action" ? Sparkles : Info;
            const toneBadge =
              item.tone === "warning"
                ? "border-dash-amber/45 bg-dash-amber/15 text-dash-amber"
                : item.tone === "action"
                  ? "border-dash-cyan/50 bg-dash-cyan/15 text-dash-cyan"
                  : "border-dash-blue/50 bg-dash-blue/20 text-dash-ice";

            return (
              <DashCard
                key={item.id}
                className={cn(
                  "flex flex-col gap-[16px] p-[20px] transition-opacity sm:flex-row sm:items-center sm:justify-between sm:p-[24px]",
                  read && "opacity-75",
                )}
              >
                <div className="flex min-w-0 items-start gap-[16px]">
                  <span
                    className={cn(
                      "flex size-[46px] shrink-0 items-center justify-center rounded-[14px] border",
                      toneBadge,
                    )}
                  >
                    <ToneIcon className="size-[22px]" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-[10px]">
                      <h2 className="text-[18px] font-bold text-foreground">{item.title}</h2>
                      {!read && (
                        <span className="inline-flex items-center gap-[6px] rounded-full bg-coral/20 px-[10px] py-[2px] text-[12px] font-semibold text-coral">
                          <span className="size-[7px] rounded-full bg-coral" />
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-[4px] max-w-[760px] text-[15px] leading-[22px] text-dash-muted">
                      {item.body}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-[10px] sm:justify-end">
                  {item.link && (
                    <Link
                      to={item.link.to}
                      onClick={() => markRead(item.id)}
                      className="dash-ghost inline-flex h-[40px] items-center gap-[6px] rounded-full px-[16px] text-[14px] font-medium"
                    >
                      <span>{item.link.label}</span>
                      <ArrowRight className="size-[15px]" />
                    </Link>
                  )}
                  {!read && (
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className="inline-flex h-[40px] items-center gap-[6px] rounded-full border border-dash-line bg-white/[0.04] px-[14px] text-[13.5px] font-medium text-dash-ice transition-colors hover:border-dash-cyan hover:text-foreground"
                    >
                      <Check className="size-[15px]" />
                      Mark read
                    </button>
                  )}
                </div>
              </DashCard>
            );
          })
        )}
      </div>
    </div>
  );
}
