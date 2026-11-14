import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { LoaderCircle, LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import robot from "@/assets/dashboard/ai-assistant-robot.png.asset.json";
import spaceScene from "@/assets/dashboard/dashboard-earth-scene.jpg.asset.json";
import nasaLogo from "@/assets/nasa-logo.png.asset.json";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { cn } from "@/lib/utils";

import { AvatarPortrait } from "./AvatarArt";
import { isNavActive, NAV_ITEMS, type NavItem } from "./nav";
import { NotificationsProvider, useNotifications } from "./notifications-context";
import { DashModeContext, useDashboardStage } from "./use-dashboard-stage";

/**
 * Unified responsive sidebar, header, and space backdrop shared by every dashboard page.
 * Uses full-viewport flex layout (`w-[260px]` fixed sidebar on `lg+`, collapsible drawer below `lg`)
 * and fluid `flex-1 min-w-0` main content with zero letterboxing or right-side dead space.
 */
export function DashboardShell({
  children,
  headerTitle,
  headerRight,
  statusWeekday,
  statusSeparator = "pipe",
  hideHeaderTitle = false,
  hideDesktopHeader = false,
  calmBackdrop = false,
}: {
  children?: ReactNode;
  headerTitle?: ReactNode;
  headerRight?: ReactNode;
  statusWeekday?: boolean;
  statusSeparator?: "pipe" | "dot";
  hideHeaderTitle?: boolean;
  hideDesktopHeader?: boolean;
  sidebarVariant?: "default" | "profile";
  calmBackdrop?: boolean;
  fluid?: boolean;
} = {}) {
  const stage = useDashboardStage();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const onOverview = isNavActive(pathname, "/dashboard");

  return (
    <NotificationsProvider>
      <DashModeContext.Provider value={stage.mode}>
        <div
          ref={topRef}
          className="relative flex min-h-screen w-full overflow-x-hidden bg-background"
        >
          {calmBackdrop ? (
            <CalmSpaceBackdrop />
          ) : (
            <img
              src={spaceScene.url}
              alt=""
              aria-hidden
              className="pointer-events-none fixed inset-0 h-full w-full object-cover object-left-bottom select-none"
            />
          )}

          {/* Unified Desktop Fixed-Width Sidebar (260px on lg+) */}
          <aside
            aria-label="Dashboard"
            className="dash-panel relative z-20 hidden h-screen w-[260px] shrink-0 flex-col lg:sticky lg:top-0 lg:flex"
          >
            <SidebarContent pathname={pathname} showPlanetLayer={calmBackdrop} />
          </aside>

          {/* Main Content Area: flex-1 min-w-0 w-full */}
          <div className="relative z-10 flex min-h-screen w-full min-w-0 flex-1 flex-col px-[16px] py-[16px] sm:px-[24px] sm:py-[18px] lg:px-[32px] lg:py-[22px]">
            {/* Mobile & Tablet Header + Collapsible Nav Drawer */}
            <div className="flex flex-col gap-[12px] lg:hidden">
              <CompactHeader
                pathname={pathname}
                headerTitle={headerTitle}
                headerRight={headerRight}
                statusWeekday={statusWeekday}
                statusSeparator={statusSeparator}
                hideHeaderTitle={hideHeaderTitle}
                onOverview={onOverview}
              />
            </div>

            {/* Unified Desktop Full-Width Header */}
            {!hideDesktopHeader && (
              <header className="hidden min-h-[68px] w-full items-center justify-between gap-[20px] lg:flex">
                {hideHeaderTitle ? (
                  <div className="min-w-0" />
                ) : (
                  <div className="flex min-w-0 items-center gap-[20px]">
                    <span
                      aria-hidden
                      className="h-[58px] w-[2px] shrink-0 rounded-full bg-foreground/80"
                    />
                    <div className="min-w-0 text-[28px] leading-[33px] font-bold tracking-[-0.005em] text-foreground xl:text-[31px] xl:leading-[36px]">
                      {headerTitle ?? (
                        <>
                          Astra Health
                          <br />
                          Monitoring System
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex shrink-0 items-center gap-[18px] xl:gap-[24px]">
                  <StatusPill
                    weekday={statusWeekday}
                    separator={statusSeparator}
                    className="h-[48px] min-w-[330px] text-[15px] xl:min-w-[360px] xl:text-[15.5px]"
                  />
                  {headerRight ??
                    (onOverview ? (
                      <AssistantHeaderButton size={62} />
                    ) : (
                      <ProfileButton size={60} />
                    ))}
                </div>
              </header>
            )}

            <main
              className={cn(
                "flex w-full min-w-0 flex-1 flex-col gap-[20px]",
                hideDesktopHeader ? "mt-[18px] lg:mt-0" : "mt-[18px] lg:mt-[22px]",
              )}
            >
              <PageOutlet>{children}</PageOutlet>
            </main>
          </div>
        </div>
      </DashModeContext.Provider>
    </NotificationsProvider>
  );
}

/** Calmer navy backdrop with a subtle glowing Earth horizon at the top-right for Profile & Settings. */
function CalmSpaceBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden select-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 90% at 80% 10%, rgba(28, 78, 173, 0.34) 0%, rgba(9, 25, 62, 0.92) 56%, rgba(6, 17, 45, 1) 100%)",
        }}
      />
      {/* Subtle planet horizon arc at top-right */}
      <div
        className="absolute -top-[18%] -right-[14%] h-[960px] w-[1180px] rounded-full opacity-75"
        style={{
          background:
            "radial-gradient(circle at 38% 45%, rgba(56, 139, 255, 0.24) 0%, rgba(21, 66, 152, 0.16) 42%, transparent 72%)",
          boxShadow: "inset 18px 28px 90px rgba(125, 189, 255, 0.22)",
          border: "1px solid rgba(147, 197, 253, 0.16)",
        }}
      />
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 24% 18%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 66% 12%, rgba(191,219,254,0.8), transparent), radial-gradient(1.2px 1.2px at 42% 76%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 88% 64%, rgba(191,219,254,0.6), transparent)",
        }}
      />
    </div>
  );
}

/** Waits for the saved profile before rendering a page, so values never flash as empty. */
function PageOutlet({ children }: { children?: ReactNode }) {
  const { hydrated } = useOnboarding();
  if (!hydrated) {
    return (
      <div
        role="status"
        className="flex h-[420px] flex-col items-center justify-center gap-[12px] text-dash-muted"
      >
        <LoaderCircle className="size-[36px] animate-spin text-dash-cyan" />
        <span className="text-[16px]">Loading your mission data…</span>
      </div>
    );
  }
  return <>{children ?? <Outlet />}</>;
}

function SidebarContent({
  pathname,
  showPlanetLayer = false,
  onClose,
}: {
  pathname: string;
  showPlanetLayer?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      {showPlanetLayer && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={spaceScene.url}
            alt=""
            className="h-full w-full object-cover object-left-bottom opacity-85 select-none"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11, 34, 88, 0.72) 0%, rgba(7, 24, 66, 0.55) 60%, rgba(7, 24, 66, 0.32) 100%)",
            }}
          />
        </div>
      )}

      <div className="relative z-10 flex shrink-0 items-center justify-center px-[16px] pt-[26px] pb-[14px]">
        <Link
          to="/dashboard"
          activeOptions={{ exact: true }}
          aria-label="Dashboard home"
          onClick={onClose}
          className="flex items-center justify-center"
        >
          <img
            src={nasaLogo.url}
            alt="NASA"
            className="h-auto w-[106px] object-contain select-none"
          />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute top-[16px] right-[12px] flex size-[36px] items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.14]"
          >
            <X className="size-[18px]" />
          </button>
        )}
      </div>

      <nav
        aria-label="Dashboard"
        className="dash-scroll relative z-10 flex min-h-0 flex-1 flex-col gap-[3px] overflow-y-auto px-[12px] pt-[16px] pb-[12px]"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            active={isNavActive(pathname, item.to)}
            onNavigate={onClose}
          />
        ))}
      </nav>

      <div className="relative z-10 mt-auto shrink-0 px-[12px] pt-[8px] pb-[18px]">
        <LogoutButton />
      </div>
    </>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: (() => void) | undefined;
}) {
  const { unread } = useNotifications();
  const Icon = item.icon;
  const badge = item.to === "/dashboard/notifications" && unread > 0 ? unread : null;

  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to === "/dashboard" }}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-[48px] w-full shrink-0 items-center gap-[12px] rounded-[15px] px-[16px] py-[11px] text-[17px] leading-[22px] text-white transition-colors",
        active
          ? "dash-nav-active font-semibold"
          : "border border-transparent font-medium hover:bg-white/[0.08]",
      )}
    >
      <Icon className="size-[24px] shrink-0 text-white" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {badge && (
        <span
          aria-label={`${badge} unread`}
          className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-coral px-[6px] text-[12px] font-bold text-white"
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useOnboarding();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex min-h-[46px] w-full items-center gap-[12px] rounded-[15px] border border-blue-400/35 bg-white/[0.04] px-[16px] py-[10px] text-[16px] font-medium text-white transition-colors hover:border-blue-300/60 hover:bg-white/[0.09]"
    >
      <LogOut className="size-[22px] shrink-0 text-white/90" strokeWidth={1.8} />
      <span>Log Out</span>
    </button>
  );
}

function CompactHeader({
  pathname,
  headerTitle,
  headerRight,
  statusWeekday,
  statusSeparator = "pipe",
  hideHeaderTitle = false,
  onOverview,
}: {
  pathname: string;
  headerTitle?: ReactNode;
  headerRight?: ReactNode;
  statusWeekday?: boolean | undefined;
  statusSeparator?: "pipe" | "dot";
  hideHeaderTitle?: boolean;
  onOverview?: boolean;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className="flex items-center gap-[12px]">
        <Link to="/dashboard" aria-label="Dashboard home" className="shrink-0">
          <img
            src={nasaLogo.url}
            alt="NASA"
            className="h-auto w-[58px] object-contain select-none"
          />
        </Link>
        <div className="min-w-0 flex-1 text-[18px] leading-[22px] font-bold text-foreground sm:text-[21px] sm:leading-[25px]">
          {hideHeaderTitle
            ? "Profile & Settings"
            : (headerTitle ?? (
                <>
                  Astra Health
                  <br />
                  Monitoring System
                </>
              ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-[10px]">
          {headerRight ??
            (onOverview ? <AssistantHeaderButton size={48} /> : <ProfileButton size={48} />)}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="dash-compact-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="dash-pill flex size-[46px] items-center justify-center"
          >
            {open ? <X className="size-[22px]" /> : <Menu className="size-[22px]" />}
          </button>
        </div>
      </header>

      <StatusPill
        weekday={statusWeekday}
        separator={statusSeparator}
        className="min-h-[42px] w-full py-[6px] text-[13px] sm:text-[14.5px]"
      />

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-[#040b1e]/65 backdrop-blur-[2px]"
          />
          <aside
            id="dash-compact-drawer"
            aria-label="Dashboard navigation"
            className="dash-panel relative z-10 flex h-screen w-[260px] max-w-[85vw] flex-col"
          >
            <SidebarContent pathname={pathname} showPlanetLayer onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

function AssistantHeaderButton({ size }: { size: number }) {
  return (
    <Link
      to="/dashboard/assistant"
      aria-label="Open AI Assistant"
      className="dash-ring relative flex shrink-0 items-center justify-center overflow-hidden transition-transform hover:scale-105"
      style={{ width: size, height: size }}
    >
      <img src={robot.url} alt="AI Assistant" className="mt-[6%] h-[88%] w-auto object-contain" />
    </Link>
  );
}

function ProfileButton({ size }: { size: number }) {
  return (
    <Link
      to="/profile"
      aria-label="Profile & Settings"
      className="shrink-0 rounded-full transition-transform hover:scale-105"
    >
      <AvatarPortrait size={size} />
    </Link>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatUtc(d: Date, weekday = false, separator: "pipe" | "dot" = "pipe") {
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
  const sep = separator === "dot" ? " · " : " - ";
  if (weekday) {
    return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}${sep}${time}`;
  }
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}${sep}${time}`;
}

/** Connection status of this browser and the current UTC time, as in the reference header. */
function StatusPill({
  className,
  weekday,
  separator = "pipe",
}: {
  className?: string;
  weekday?: boolean | undefined;
  separator?: "pipe" | "dot";
}) {
  const [now, setNow] = useState<Date | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setNow(new Date());
    setOnline(navigator.onLine);
    const tick = window.setInterval(() => setNow(new Date()), 15_000);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      className={cn(
        "dash-pill flex flex-wrap items-center justify-center gap-x-[12px] gap-y-[2px] px-[16px] sm:px-[20px]",
        className,
      )}
    >
      <span className="flex items-center gap-[8px] whitespace-nowrap">
        <span
          aria-hidden
          className={cn(
            "size-[12px] shrink-0 rounded-full",
            online ? "bg-dash-green shadow-[0_0_10px_var(--dash-green)]" : "bg-dash-amber",
          )}
        />
        {online ? "System Online" : "Offline"}
      </span>
      <span aria-hidden className="hidden h-[18px] w-[1.5px] bg-foreground/60 sm:block" />
      <time dateTime={now?.toISOString()} className="whitespace-nowrap tabular-nums">
        {now ? formatUtc(now, weekday, separator) : "— UTC"}
      </time>
    </div>
  );
}
