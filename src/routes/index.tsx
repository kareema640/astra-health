import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthField } from "@/components/auth/AuthField";
import { AuthScene } from "@/components/auth/AuthScene";
import { CometStreak } from "@/components/auth/CometStreak";
import { AstronautIcon, LockIcon, PersonIcon, PersonPlusIcon } from "@/components/auth/icons";
import { SocialLogins } from "@/components/auth/SocialLogins";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login · Astra Health Monitoring System" },
      {
        name: "description",
        content:
          "Sign in to your Astra Health dashboard to monitor astronaut health and mission data.",
      },
      { property: "og:title", content: "Login · Astra Health Monitoring System" },
      {
        property: "og:description",
        content:
          "Sign in to your Astra Health dashboard to monitor astronaut health and mission data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  // No account server yet: Continue opens the dashboard saved on this device.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthScene>
      <div className="flex flex-col px-[22px] py-[28px] sm:px-[44px] sm:py-[34px] lg:px-[52px]">
        <div className="relative">
          <h1 className="font-bold tracking-[-0.005em]">
            <span className="block text-[34px] leading-[40px] text-foreground sm:text-[44px] sm:leading-[50px] lg:text-[48px] lg:leading-[54px]">
              Welcome Back,
            </span>
            <span className="block text-[40px] leading-[44px] text-coral sm:text-[52px] sm:leading-[56px] lg:text-[56px] lg:leading-[60px]">
              Astronaut!
            </span>
          </h1>
          <p className="mt-[8px] max-w-[400px] text-[16.5px] leading-[23px] text-foreground sm:text-[20px] sm:leading-[26px]">
            Sign in to access your health dashboard and mission data.
          </p>
          <CometStreak className="pointer-events-none absolute top-[4px] right-[0px] hidden w-[195px] sm:block" />
        </div>

        <nav
          aria-label="Authentication"
          className="mt-[22px] grid h-[56px] grid-cols-2 rounded-full border-[1.5px] border-field-border sm:mt-[26px] sm:h-[64px]"
        >
          <Link
            to="/"
            aria-current="page"
            className="auth-pill-active -m-[1.5px] flex items-center justify-center gap-[10px] rounded-full text-[18px] font-medium text-primary-foreground sm:gap-[14px] sm:text-[22px]"
          >
            <AstronautIcon className="size-[26px] sm:size-[32px]" />
            Login
          </Link>
          <Link
            to="/signup"
            className="flex items-center justify-center gap-[10px] text-[17.5px] font-medium text-foreground transition-opacity hover:opacity-85 sm:gap-[12px] sm:text-[21px]"
          >
            <PersonPlusIcon className="h-[24px] w-[28px] text-cream sm:h-[28px] sm:w-[32px]" />
            Sign Up
          </Link>
        </nav>

        <form onSubmit={handleSubmit} className="contents">
          <AuthField
            size="login"
            icon={PersonIcon}
            iconClassName="size-[24px] sm:size-[28px]"
            name="astronautId"
            placeholder="Astronaut ID"
            autoComplete="username"
            className="mt-[20px]"
          />
          <AuthField
            size="login"
            icon={LockIcon}
            iconClassName="size-[24px] sm:size-[28px]"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            reveal="eye"
            className="mt-[14px]"
          />
          <button
            type="submit"
            className="auth-cta mt-[18px] flex h-[56px] w-full items-center justify-center gap-[10px] rounded-full text-[20px] font-bold sm:h-[64px] sm:text-[23.5px]"
          >
            Continue
            <ArrowRight className="size-[22px] sm:size-[25px]" strokeWidth={2.4} />
          </button>
        </form>

        <AuthDivider
          label="or continue with"
          gapClassName="mt-[16px] gap-[14px] text-[14.5px] leading-[20px] sm:text-[16px]"
        />
        <div className="mt-[14px]">
          <SocialLogins />
        </div>
      </div>
    </AuthScene>
  );
}
