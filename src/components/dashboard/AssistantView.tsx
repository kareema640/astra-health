import { Link } from "@tanstack/react-router";
import { Bell, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import robot from "@/assets/dashboard/ai-assistant-robot.png.asset.json";
import nasaLogo from "@/assets/nasa-logo.png.asset.json";
import { useOnboarding, type OnboardingData } from "@/components/onboarding/onboarding-store";
import { cn } from "@/lib/utils";

import { AvatarPortrait } from "./AvatarArt";
import { firstName, HYDRATION_LABEL, SLEEP_INFO } from "./health";
import { useNotifications } from "./notifications-context";

interface ChatMetric {
  emoji: string;
  value: string;
  label: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  subtitle?: string;
  metricsTitle?: string;
  metrics?: ChatMetric[];
  closing?: string;
  isDemoNote?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "initial-user",
    role: "user",
    text: "How is my health today?",
  },
  {
    id: "initial-assistant",
    role: "assistant",
    text: "Your health is stable, Sarah! 💙",
    subtitle: "All vital signs are within normal range.",
    metricsTitle: "Key Metrics:",
    metrics: [
      { emoji: "❤️", value: "72 bpm", label: "Heart Rate" },
      { emoji: "💧", value: "98%", label: "SpO₂" },
      { emoji: "🌡️", value: "36.6°C", label: "Body Temp" },
      { emoji: "⚡", value: "92%", label: "Energy" },
    ],
    closing: "Keep up the great work! 🚀",
    isDemoNote: true,
  },
];

function buildDemoReply(prompt: string, data: OnboardingData): ChatMessage {
  const q = prompt.toLowerCase();
  const userName = firstName(data.account.fullName) ?? (data.avatar.callsign.trim() || "Sarah");
  const hr = data.heart.restingHr.trim() || "72";
  const spo2 = data.vitals.spo2.trim() || "98";
  const sleepLabel = data.progress.heart === "done" ? SLEEP_INFO[data.heart.sleep].label : "7–8 h";
  const hydrationLabel =
    data.progress.heart === "done" ? HYDRATION_LABEL[data.heart.hydration] : "2–3 L";

  if (q.includes("heart") || q.includes("bpm") || q.includes("pulse") || q.includes("cardio")) {
    return {
      id: `ast-${Date.now()}`,
      role: "assistant",
      text: `Heart telemetry preview looks steady, ${userName}! 💙`,
      subtitle: "Simulated demo overview — not medical analysis.",
      metricsTitle: "Cardio Snapshot (Demo):",
      metrics: [
        { emoji: "❤️", value: `${hr} bpm`, label: "Resting Heart Rate" },
        { emoji: "📈", value: "48 ms", label: "HRV Balance" },
        { emoji: "💧", value: `${spo2}%`, label: "SpO₂ Oxygenation" },
      ],
      closing: "Connect a wearable sensor for live ECG & continuous alerts.",
      isDemoNote: true,
    };
  }

  if (q.includes("sleep") || q.includes("rest") || q.includes("tired") || q.includes("fatigue")) {
    return {
      id: `ast-${Date.now()}`,
      role: "assistant",
      text: `Your rest target is tracking well, ${userName}! 🌙`,
      subtitle: "Simulated demo guidance based on your Astra Health profile.",
      metricsTitle: "Recovery Summary (Demo):",
      metrics: [
        { emoji: "🛌", value: sleepLabel, label: "Sleep Duration" },
        { emoji: "⚡", value: "92%", label: "Energy Readiness" },
        { emoji: "💧", value: hydrationLabel, label: "Daily Hydration" },
      ],
      closing: "Keep a consistent sleep window before your next EVA check! 🚀",
      isDemoNote: true,
    };
  }

  if (q.includes("water") || q.includes("hydrat") || q.includes("oxygen") || q.includes("spo2")) {
    return {
      id: `ast-${Date.now()}`,
      role: "assistant",
      text: `Oxygen and hydration look good in demo mode, ${userName}! 💧`,
      subtitle: "Simulated demo response — connect sensors for real-time telemetry.",
      metricsTitle: "Hydration & O₂ (Demo):",
      metrics: [
        { emoji: "💧", value: `${spo2}%`, label: "SpO₂ Level" },
        { emoji: "🥤", value: hydrationLabel, label: "Fluid Intake" },
        { emoji: "🌡️", value: "36.6°C", label: "Body Temp" },
      ],
      closing: "Steady hydration supports optimal cabin performance! 🚀",
      isDemoNote: true,
    };
  }

  return {
    id: `ast-${Date.now()}`,
    role: "assistant",
    text: `I'm here to help, ${userName}! 💙`,
    subtitle:
      "This is a simulated demo assistant. For real clinical insights, connect a wearable sensor.",
    metricsTitle: "Current Demo Overview:",
    metrics: [
      { emoji: "❤️", value: `${hr} bpm`, label: "Heart Rate" },
      { emoji: "💧", value: `${spo2}%`, label: "SpO₂" },
      { emoji: "🌡️", value: "36.6°C", label: "Body Temp" },
      { emoji: "⚡", value: "92%", label: "Energy" },
    ],
    closing: "Ask me about heart rate, sleep recovery, or hydration anytime! 🚀",
    isDemoNote: true,
  };
}

/** Four-point glowing AI sparkle icon matching the futuristic assistant design. */
function AiSparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("shrink-0 text-dash-cyan", className)}
    >
      <path
        d="M16 2.5C16.7 10.1 21.9 15.3 29.5 16C21.9 16.7 16.7 21.9 16 29.5C15.3 21.9 10.1 16.7 2.5 16C10.1 15.3 15.3 10.1 16 2.5Z"
        fill="currentColor"
      />
      <path
        d="M25.5 4.5C25.8 6.8 27.2 8.2 29.5 8.5C27.2 8.8 25.8 10.2 25.5 12.5C25.2 10.2 23.8 8.8 21.5 8.5C23.8 8.2 25.2 6.8 25.5 4.5Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

/**
 * Interactive AI Assistant workspace inside the unified Astra Health DashboardShell.
 * Uses demo responses only — does not invent real medical analysis.
 */
export function AssistantView() {
  const { data } = useOnboarding();
  const { unread } = useNotifications();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const replyTimerRef = useRef<number | null>(null);

  const userName = firstName(data.account.fullName) ?? (data.avatar.callsign.trim() || "Sarah");
  const badgeCount = unread > 0 ? unread : 3;
  const isModified = messages.length > INITIAL_MESSAGES.length;

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isReplying]);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || isReplying) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setIsReplying(true);

    replyTimerRef.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, buildDemoReply(trimmed, data)]);
      setIsReplying(false);
    }, 520);
  };

  const handleReset = () => {
    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current);
      replyTimerRef.current = null;
    }
    setIsReplying(false);
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-[18px]">
      {/* Top Assistant Header */}
      <div className="flex flex-wrap items-center justify-between gap-[14px]">
        <div className="flex items-center gap-[14px] sm:gap-[16px]">
          <span className="flex size-[48px] shrink-0 items-center justify-center rounded-[16px] border-[1.5px] border-dash-cyan/60 bg-[oklch(0.28_0.11_255_/_65%)] shadow-[0_0_22px_oklch(0.8_0.135_228_/_40%)] sm:size-[52px]">
            <AiSparkleIcon className="size-[26px] drop-shadow-[0_0_10px_var(--dash-cyan)] sm:size-[30px]" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-[10px]">
              <h1 className="text-[26px] leading-[32px] font-bold tracking-[-0.01em] text-foreground sm:text-[32px] sm:leading-[38px]">
                AI Assistant
              </h1>
              <span className="rounded-full border border-dash-cyan/45 bg-dash-blue/25 px-[10px] py-[2px] text-[12px] font-medium text-dash-ice">
                Demo Mode
              </span>
            </div>
            <p className="mt-[2px] text-[14.5px] leading-[20px] text-dash-muted sm:text-[15.5px]">
              Your intelligent health companion in space
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          {isModified && (
            <button
              type="button"
              onClick={handleReset}
              className="dash-ghost inline-flex h-[42px] items-center gap-[7px] rounded-full px-[16px] text-[13.5px] font-medium"
            >
              <RotateCcw className="size-[15px]" />
              Reset chat
            </button>
          )}

          <Link
            to="/dashboard/notifications"
            aria-label={`Notifications (${badgeCount} unread)`}
            className="dash-pill relative flex size-[46px] items-center justify-center transition-colors hover:border-dash-cyan sm:size-[48px]"
          >
            <Bell className="size-[21px] text-foreground" strokeWidth={1.9} />
            <span className="absolute -top-[4px] -right-[4px] flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-coral px-[5px] text-[11.5px] font-bold text-foreground shadow-[0_0_10px_var(--coral)]">
              {badgeCount}
            </span>
          </Link>

          <span
            aria-label="Astra AI Robot"
            className="dash-ring relative size-[46px] shrink-0 overflow-hidden sm:size-[48px]"
          >
            <img
              src={robot.url}
              alt="Astra AI Robot"
              className="absolute top-[5px] left-1/2 h-[42px] w-auto -translate-x-1/2"
            />
          </span>
        </div>
      </div>

      {/* Main Split Section: Left Robot Character + Right Chat Interface */}
      <div className="flex min-h-0 flex-1 flex-col gap-[22px] xl:flex-row xl:items-stretch xl:gap-[28px]">
        {/* Left Section: Speech Bubble + Astronaut AI Robot + Holographic Rings & Platform */}
        <section
          aria-label="Astra AI Companion"
          className="relative flex shrink-0 flex-col items-center justify-center py-[6px] select-none xl:w-[390px] 2xl:w-[430px]"
        >
          {/* Ambient radial glow behind the robot */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 size-[300px] -translate-x-1/2 -translate-y-[42%] rounded-full bg-[radial-gradient(circle,oklch(0.76_0.16_230_/_26%)_0%,oklch(0.55_0.19_254_/_10%)_48%,transparent_72%)] blur-[10px] sm:size-[350px]"
          />

          {/* Speech Bubble */}
          <div className="relative z-30 mb-[14px]">
            <div className="rounded-[24px] border-[1.5px] border-dash-cyan/80 bg-[linear-gradient(180deg,oklch(0.3_0.12_258_/_88%)_0%,oklch(0.21_0.09_263_/_92%)_100%)] px-[22px] py-[14px] text-center shadow-[0_0_26px_oklch(0.75_0.15_232_/_38%),inset_0_1px_0_oklch(1_0_0_/_18%)] backdrop-blur-[14px] sm:px-[26px] sm:py-[16px]">
              <p className="text-[19px] leading-[26px] font-bold text-foreground sm:text-[20px] sm:leading-[28px]">
                Hello {userName}!{" "}
                <span role="img" aria-label="waving hand">
                  👋
                </span>
              </p>
              <p className="mt-[2px] text-[16px] leading-[23px] font-medium text-dash-ice sm:text-[17.5px] sm:leading-[25px]">
                How can I help you today?
              </p>
            </div>
            <div
              aria-hidden
              className="mx-auto -mt-[8px] size-[16px] rotate-45 border-r-[1.5px] border-b-[1.5px] border-dash-cyan/80 bg-[oklch(0.22_0.09_263)]"
            />
          </div>

          {/* Robot + Holographic Orbit Rings */}
          <div className="relative flex h-[240px] w-[260px] items-center justify-center sm:h-[290px] sm:w-[320px] xl:h-[320px] xl:w-[350px]">
            <HolographicRings layer="back" />

            <div className="dash-float relative z-10 flex h-full items-center justify-center">
              <div className="relative h-full">
                <img
                  src={robot.url}
                  alt="Astra AI Astronaut Robot"
                  className="h-full w-auto object-contain drop-shadow-[0_14px_28px_oklch(0.15_0.08_260_/_75%)]"
                />
                <img
                  src={nasaLogo.url}
                  alt="NASA insignia"
                  className="pointer-events-none absolute top-[62%] left-[55.5%] size-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-95 drop-shadow-[0_0_6px_oklch(0.8_0.135_228_/_65%)]"
                />
              </div>
            </div>

            <HolographicRings layer="front" />
          </div>

          {/* Floating Holographic Platform beneath the robot */}
          <div aria-hidden className="relative z-0 -mt-[22px] flex flex-col items-center">
            <div className="h-[20px] w-[200px] bg-[linear-gradient(180deg,transparent_0%,oklch(0.8_0.14_228_/_24%)_100%)] blur-[4px] sm:w-[220px]" />
            <div className="relative flex h-[36px] w-[250px] items-center justify-center rounded-[50%] border-[2px] border-dash-cyan/85 bg-[radial-gradient(ellipse_at_center,oklch(0.82_0.14_228_/_42%)_0%,oklch(0.55_0.18_250_/_22%)_58%,transparent_100%)] shadow-[0_0_28px_oklch(0.8_0.14_228_/_60%),inset_0_0_16px_oklch(0.85_0.12_225_/_55%)] sm:h-[40px] sm:w-[290px]">
              <div className="h-[20px] w-[180px] rounded-[50%] border-[1.5px] border-dash-ice/80 bg-[radial-gradient(ellipse_at_center,oklch(0.88_0.1_225_/_45%)_0%,transparent_75%)] shadow-[0_0_14px_oklch(0.85_0.12_225_/_65%)] sm:h-[22px] sm:w-[210px]" />
            </div>
            <div className="mt-[4px] h-[10px] w-[180px] rounded-[50%] bg-dash-cyan/25 blur-[8px] sm:w-[200px]" />
          </div>
        </section>

        {/* Right Section: Glassmorphism Chat Panel */}
        <section
          aria-label="AI Health Chat"
          className="relative flex min-h-[460px] flex-1 min-w-0 flex-col overflow-hidden rounded-[24px] border-[1.5px] border-dash-cyan/60 bg-[radial-gradient(110%_80%_at_0%_0%,oklch(0.5_0.16_250_/_26%)_0%,transparent_55%),linear-gradient(180deg,oklch(0.28_0.12_260_/_72%)_0%,oklch(0.19_0.09_264_/_82%)_100%)] p-[16px] shadow-[0_0_32px_oklch(0.68_0.16_244_/_30%),inset_0_1px_0_oklch(1_0_0_/_18%)] backdrop-blur-[20px] sm:rounded-[28px] sm:p-[24px] xl:max-h-[760px]"
        >
          {/* Subtle top glass reflection */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[24px] top-0 h-[1px] bg-[linear-gradient(90deg,transparent_0%,oklch(0.9_0.08_225_/_65%)_50%,transparent_100%)]"
          />

          {/* Scrollable Message List */}
          <div className="dash-scroll flex-1 space-y-[18px] overflow-y-auto pr-[4px] sm:pr-[6px]">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex items-start justify-end gap-[10px] sm:gap-[12px]">
                  <div className="max-w-[82%] rounded-[20px] rounded-tr-[6px] border border-[oklch(0.82_0.12_232_/_75%)] bg-[linear-gradient(180deg,oklch(0.67_0.18_248)_0%,oklch(0.52_0.21_258)_100%)] px-[16px] py-[11px] text-[15.5px] leading-[22px] font-medium text-foreground shadow-[0_6px_22px_oklch(0.62_0.19_252_/_45%),inset_0_1px_0_oklch(1_0_0_/_28%)] sm:max-w-[78%] sm:px-[20px] sm:py-[13px] sm:text-[16.5px] sm:leading-[24px]">
                    {msg.text}
                  </div>
                  <AvatarPortrait size={38} className="mt-[2px] sm:size-[42px]" />
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-[10px] sm:gap-[14px]">
                  <span className="dash-ring relative mt-[2px] size-[38px] shrink-0 overflow-hidden sm:size-[44px]">
                    <img
                      src={robot.url}
                      alt="Astra AI"
                      className="absolute top-[5px] left-1/2 h-[34px] w-auto -translate-x-1/2 sm:h-[40px]"
                    />
                  </span>
                  <div className="max-w-[88%] rounded-[22px] rounded-tl-[6px] border-[1.5px] border-dash-cyan/45 bg-[linear-gradient(180deg,oklch(0.32_0.12_258_/_78%)_0%,oklch(0.22_0.09_263_/_88%)_100%)] px-[16px] py-[14px] text-foreground shadow-[0_6px_24px_oklch(0.16_0.07_262_/_55%),inset_0_1px_0_oklch(1_0_0_/_12%)] sm:max-w-[84%] sm:px-[22px] sm:py-[18px]">
                    <p className="text-[16.5px] leading-[23px] font-bold text-foreground sm:text-[17.5px] sm:leading-[25px]">
                      {msg.text}
                    </p>
                    {msg.subtitle && (
                      <p className="mt-[4px] text-[14.5px] leading-[21px] text-dash-ice/90 sm:text-[15px]">
                        {msg.subtitle}
                      </p>
                    )}

                    {msg.metrics && msg.metrics.length > 0 && (
                      <div className="mt-[14px]">
                        {msg.metricsTitle && (
                          <p className="mb-[8px] text-[14px] font-semibold tracking-[0.01em] text-dash-cyan sm:text-[14.5px]">
                            {msg.metricsTitle}
                          </p>
                        )}
                        <div className="grid grid-cols-1 gap-[8px] sm:grid-cols-2">
                          {msg.metrics.map((m) => (
                            <div
                              key={`${msg.id}-${m.label}`}
                              className="flex items-center gap-[10px] rounded-[14px] border border-dash-cyan/28 bg-[oklch(0.25_0.1_260_/_55%)] px-[12px] py-[9px]"
                            >
                              <span className="text-[17px] leading-none" aria-hidden>
                                {m.emoji}
                              </span>
                              <span className="text-[14.5px] leading-[20px] text-foreground sm:text-[15px]">
                                <strong className="font-bold">{m.value}</strong>{" "}
                                <span className="text-dash-muted">— {m.label}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.closing && (
                      <p className="mt-[14px] text-[15px] leading-[22px] font-medium text-foreground sm:text-[15.5px]">
                        {msg.closing}
                      </p>
                    )}

                    {msg.isDemoNote && (
                      <p className="mt-[10px] border-t border-dash-line pt-[8px] text-[12px] text-dash-muted">
                        Demo response · Displays sample metrics for demonstration only, not medical
                        advice.
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}

            {isReplying && (
              <div className="flex items-start gap-[14px]" aria-live="polite">
                <span className="dash-ring relative mt-[2px] size-[42px] shrink-0 overflow-hidden">
                  <img
                    src={robot.url}
                    alt="Astra AI"
                    className="absolute top-[5px] left-1/2 h-[38px] w-auto -translate-x-1/2"
                  />
                </span>
                <div className="flex items-center gap-[6px] rounded-[20px] rounded-tl-[6px] border-[1.5px] border-dash-cyan/45 bg-[oklch(0.28_0.11_260_/_80%)] px-[18px] py-[14px]">
                  <span className="size-[8px] animate-bounce rounded-full bg-dash-cyan [animation-delay:-0.2s]" />
                  <span className="size-[8px] animate-bounce rounded-full bg-dash-cyan [animation-delay:-0.1s]" />
                  <span className="size-[8px] animate-bounce rounded-full bg-dash-cyan" />
                </div>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Chat Input Area */}
          <form onSubmit={handleSubmit} className="mt-[16px] shrink-0">
            <div className="flex h-[56px] items-center gap-[10px] rounded-full border-[1.5px] border-dash-cyan/55 bg-[oklch(0.21_0.08_263_/_82%)] pr-[6px] pl-[16px] shadow-[0_0_20px_oklch(0.68_0.16_244_/_20%),inset_0_1px_0_oklch(1_0_0_/_8%)] transition-all focus-within:border-dash-cyan focus-within:shadow-[0_0_24px_oklch(0.8_0.135_228_/_35%)] sm:h-[60px] sm:gap-[12px] sm:pr-[7px] sm:pl-[18px]">
              <AiSparkleIcon className="size-[20px] drop-shadow-[0_0_8px_var(--dash-cyan)] sm:size-[22px]" />
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your message…"
                aria-label="Message Astra AI Assistant"
                className="min-w-0 flex-1 bg-transparent text-[15.5px] text-foreground placeholder:text-dash-muted/80 focus:outline-none sm:text-[16px]"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isReplying}
                aria-label="Send message"
                className="flex size-[44px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,oklch(0.76_0.15_236)_0%,oklch(0.58_0.2_256)_100%)] text-foreground shadow-[0_0_20px_oklch(0.75_0.16_242_/_75%),inset_0_1px_0_oklch(1_0_0_/_35%)] transition-all hover:brightness-110 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none sm:size-[46px]"
              >
                <Send
                  className="size-[19px] -translate-x-[1px] translate-y-[1px]"
                  strokeWidth={2.2}
                />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

/** Multi-layered glowing cyan holographic rings wrapping behind and in front of the robot. */
function HolographicRings({ layer }: { layer: "back" | "front" }) {
  const rings = [
    { top: "54%", width: "92%", height: "20%", rotate: "-8deg" },
    { top: "67%", width: "102%", height: "22%", rotate: "6deg" },
    { top: "79%", width: "86%", height: "18%", rotate: "-4deg" },
  ];

  return (
    <>
      {rings.map((r, i) => (
        <span
          key={`${layer}-${i}`}
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 rounded-[50%] border-[2.5px] border-dash-cyan/85 shadow-[0_0_16px_oklch(0.8_0.135_228_/_75%),inset_0_0_10px_oklch(0.8_0.135_228_/_45%)]",
            layer === "back" ? "z-0" : "z-20",
          )}
          style={{
            top: r.top,
            width: r.width,
            height: r.height,
            transform: `translateX(-50%) rotate(${r.rotate})`,
            clipPath: layer === "back" ? "inset(0 0 50% 0)" : "inset(50% 0 0 0)",
          }}
        />
      ))}
    </>
  );
}
