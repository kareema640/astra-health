import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthField } from "@/components/auth/AuthField";
import { AuthScene } from "@/components/auth/AuthScene";
import { EnvelopeIcon, IdCardIcon, LockIcon, PersonIcon } from "@/components/auth/icons";
import { SocialLogins } from "@/components/auth/SocialLogins";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { ApiError, authApi } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account · Astra Health Monitoring System" },
      {
        name: "description",
        content:
          "Join the mission: create your Astra Health account to track astronaut health in orbit.",
      },
      { property: "og:title", content: "Create Account · Astra Health Monitoring System" },
      {
        property: "og:description",
        content:
          "Join the mission: create your Astra Health account to track astronaut health in orbit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { update } = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const fieldIssue = (name: string) => (error?.fields[name] ? "auth-field-error" : undefined);

  // Credentials are registered on the auth backend first; on success the
  // existing flow continues unchanged (local account record + Step 2).
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    try {
      await authApi.register({
        fullName: text("fullName"),
        email: text("email"),
        password: text("password"),
        confirmPassword: text("confirmPassword"),
        astronautId: text("astronautId"),
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, "UNKNOWN", "Something went wrong. Try again."),
      );
      setBusy(false);
      return;
    }
    const now = new Date();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const joinDate = `${months[now.getUTCMonth()] ?? "Nov"} ${now.getUTCDate()}, ${now.getUTCFullYear()}`;
    update("account", {
      fullName: text("fullName"),
      email: text("email"),
      astronautId: text("astronautId"),
      joinDate,
    });
    navigate({ to: "/onboarding/basic-info" });
  };

  return (
    <AuthScene>
      <div className="flex flex-col px-[22px] py-[24px] sm:px-[44px] sm:py-[28px] lg:px-[56px]">
        <div>
          <h1 className="text-[32px] leading-[38px] font-bold tracking-[-0.005em] text-foreground sm:text-[44px] sm:leading-[50px] lg:text-[48px] lg:leading-[56px]">
            Create Your <span className="text-coral">Account</span>
          </h1>
          <p className="mt-[6px] text-[16.5px] leading-[22px] text-foreground sm:text-[21px] sm:leading-[26px]">
            Join the mission for a healthier tomorrow
          </p>
        </div>

        {/* noValidate: the server is authoritative, so every rule gets the
            designed feedback row below instead of a browser-native bubble. */}
        <form onSubmit={handleSubmit} noValidate className="contents">
          <div className="mt-[18px] flex flex-col gap-[10px]">
            <AuthField
              size="signup"
              icon={PersonIcon}
              iconClassName="size-[24px] sm:size-[28px]"
              name="fullName"
              placeholder="Full Name"
              autoComplete="name"
              className={cn(fieldIssue("fullName"))}
            />
            <AuthField
              size="signup"
              icon={EnvelopeIcon}
              iconClassName="h-[22px] w-[28px] sm:h-[26px] sm:w-[34px]"
              name="email"
              type="email"
              placeholder="Email Address"
              autoComplete="email"
              className={cn(fieldIssue("email"))}
            />
            <AuthField
              size="signup"
              icon={LockIcon}
              iconClassName="size-[24px] sm:size-[30px]"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              reveal="eye-off"
              className={cn(fieldIssue("password"))}
            />
            <AuthField
              size="signup"
              icon={LockIcon}
              iconClassName="size-[24px] sm:size-[30px]"
              name="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              reveal="eye-off"
              className={cn(fieldIssue("confirmPassword"))}
            />
            <AuthField
              size="signup"
              icon={IdCardIcon}
              iconClassName="h-[24px] w-[30px] sm:h-[28px] sm:w-[34px]"
              name="astronautId"
              placeholder="Astronaut ID"
              hint="Your mission-issued astronaut identifier"
              className={cn(fieldIssue("astronautId"))}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className="auth-cta mt-[16px] flex h-[56px] w-full items-center justify-center gap-[10px] rounded-full text-[20px] font-bold sm:h-[62px] sm:text-[24px]"
          >
            Sign Up
            {busy ? (
              <Loader2 aria-hidden className="size-[22px] animate-spin sm:size-[26px]" />
            ) : (
              <ArrowRight className="size-[22px] sm:size-[26px]" strokeWidth={2.4} />
            )}
          </button>
          {error ? (
            <p
              role="alert"
              aria-live="polite"
              className="mt-[12px] text-center text-[15px] leading-[20px] text-coral sm:text-[17px]"
            >
              {Object.values(error.fields)[0] ?? error.message}
            </p>
          ) : null}
        </form>

        <AuthDivider
          label="or"
          gapClassName="mt-[14px] gap-[18px] text-[16px] leading-[20px] sm:gap-[24px] sm:text-[19px]"
        />
        <div className="mt-[10px]">
          <SocialLogins />
        </div>

        <Link
          to="/"
          className="mx-auto mt-[14px] flex items-center gap-[12px] text-[17.5px] text-foreground transition-opacity hover:opacity-85 sm:gap-[16px] sm:text-[21px]"
        >
          <ArrowLeft className="size-[20px] sm:size-[24px]" strokeWidth={1.9} />
          Back to Login
        </Link>
      </div>
    </AuthScene>
  );
}
