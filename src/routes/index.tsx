import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthField } from "@/components/auth/AuthField";
import { AuthScene } from "@/components/auth/AuthScene";
import { AuthStatusLine, CtaSpinner } from "@/components/auth/AuthStatusLine";
import { CometStreak } from "@/components/auth/CometStreak";
import { AstronautIcon, LockIcon, PersonIcon, PersonPlusIcon } from "@/components/auth/icons";
import { SocialLogins } from "@/components/auth/SocialLogins";
import { ApiError, authApi } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login · Astra Health Monitoring System" },
      {
        name: "description",
        content: "Sign in to your Astra Health dashboard to monitor astronaut health and mission data.",
      },
      { property: "og:title", content: "Login · Astra Health Monitoring System" },
      {
        property: "og:description",
        content: "Sign in to your Astra Health dashboard to monitor astronaut health and mission data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fieldIssue = (name: string) => (error?.fields[name] ? "auth-field-error" : undefined);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    try {
      await authApi.login({
        astronautId: String(data.get("astronautId") ?? ""),
        password: String(data.get("password") ?? ""),
      });
      // The dashboard is not wired to the backend yet (roadmap), so a successful
      // sign-in resumes the profile flow, mirroring the Sign Up destination.
      navigate({ to: "/onboarding/basic-info" });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, "UNKNOWN", "Something went wrong. Try again."),
      );
    } finally {
      setBusy(false);
    }
  };

  const statusMessage = error ? (Object.values(error.fields)[0] ?? error.message) : null;

  return (
    <AuthScene header={{ left: 48, top: 32 }} card={{ left: 102, top: 192, width: 653, height: 685 }}>
      <div className="relative flex h-full flex-col px-[58px] pt-[37px]">
        <div className="relative pl-[13px]">
          <h1 className="font-bold tracking-[-0.005em]">
            <span className="block text-[49px] leading-[54px] text-foreground">Welcome Back,</span>
            <span className="block text-[58px] leading-[62px] text-coral">Astronaut!</span>
          </h1>
          <p className="mt-[5px] text-[22.4px] leading-[28px] text-foreground">
            Sign in to access your health dashboard
            <br />
            and mission data.
          </p>
          <CometStreak className="absolute top-[6px] left-[341px] w-[230px]" />
        </div>

        <nav
          aria-label="Authentication"
          className="mt-[27px] grid h-[68px] grid-cols-2 rounded-full border-[1.5px] border-field-border"
        >
          <Link
            to="/"
            aria-current="page"
            className="auth-pill-active -m-[1.5px] flex items-center justify-center gap-[16px] rounded-full text-[23.5px] font-medium text-primary-foreground"
          >
            <AstronautIcon className="size-[36px]" />
            Login
          </Link>
          <Link
            to="/signup"
            className="flex items-center justify-center gap-[14px] pl-[18px] text-[22.5px] font-medium text-foreground transition-opacity hover:opacity-85"
          >
            <PersonPlusIcon className="h-[30px] w-[34px] text-cream" />
            Sign Up
          </Link>
        </nav>

        {/* noValidate: server-side rules are authoritative so every field gets
            the designed error feedback instead of a browser-native bubble. */}
        <form onSubmit={handleSubmit} noValidate className="contents">
          <AuthField
            size="login"
            icon={PersonIcon}
            iconClassName="size-[30px]"
            name="astronautId"
            placeholder="Astronaut ID"
            autoComplete="username"
            className={cn("mt-[21px]", fieldIssue("astronautId"))}
          />
          <AuthField
            size="login"
            icon={LockIcon}
            iconClassName="size-[30px]"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            reveal="eye"
            className={cn("mt-[15px]", fieldIssue("password"))}
          />
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy}
            className={cn(
              "auth-cta mt-[16px] flex h-[68px] w-full items-center justify-center gap-[10px] rounded-full text-[24.5px] font-bold",
              busy && "cursor-progress opacity-90",
            )}
          >
            {busy ? "Signing in" : "Continue"}
            {busy ? (
              <CtaSpinner className="size-[26px] animate-spin" />
            ) : (
              <ArrowRight className="size-[26px]" strokeWidth={2.4} />
            )}
          </button>
        </form>

        <AuthDivider
          label="or continue with"
          gapClassName="mt-[13px] gap-[14px] text-[16px] leading-[20px]"
        />
        <div className="mt-[12px]">
          <SocialLogins />
        </div>

        <AuthStatusLine message={statusMessage} />
      </div>
    </AuthScene>
  );
}
