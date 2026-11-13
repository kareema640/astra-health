import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { FormEvent } from "react";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthField } from "@/components/auth/AuthField";
import { AuthScene } from "@/components/auth/AuthScene";
import { EnvelopeIcon, IdCardIcon, LockIcon, PersonIcon } from "@/components/auth/icons";
import { SocialLogins } from "@/components/auth/SocialLogins";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account · Astra Health Monitoring System" },
      {
        name: "description",
        content: "Join the mission: create your Astra Health account to track astronaut health in orbit.",
      },
      { property: "og:title", content: "Create Account · Astra Health Monitoring System" },
      {
        property: "og:description",
        content: "Join the mission: create your Astra Health account to track astronaut health in orbit.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({ to: "/onboarding/basic-info" });
  };

  return (
    <AuthScene header={{ left: 43, top: 24 }} card={{ left: 94, top: 166, width: 663, height: 716 }}>
      <div className="flex h-full flex-col px-[70px] pt-[24px]">
        <div className="pl-[20px]">
          <h1 className="text-[50px] leading-[58px] font-bold tracking-[-0.005em] text-foreground">
            Create Your <span className="text-coral">Account</span>
          </h1>
          <p className="mt-[6px] text-[23.6px] leading-[28px] text-foreground">
            Join the mission for a healthier tomorrow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="contents">
          <div className="mt-[22px] flex flex-col gap-[10px]">
            <AuthField
              size="signup"
              icon={PersonIcon}
              iconClassName="size-[32px]"
              name="fullName"
              placeholder="Full Name"
              autoComplete="name"
            />
            <AuthField
              size="signup"
              icon={EnvelopeIcon}
              iconClassName="h-[28px] w-[37px]"
              name="email"
              type="email"
              placeholder="Email Address"
              autoComplete="email"
            />
            <AuthField
              size="signup"
              icon={LockIcon}
              iconClassName="size-[34px]"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              reveal="eye-off"
            />
            <AuthField
              size="signup"
              icon={LockIcon}
              iconClassName="size-[34px]"
              name="confirmPassword"
              placeholder="Confirm Password"
              autoComplete="new-password"
              reveal="eye-off"
            />
            <AuthField
              size="signup"
              icon={IdCardIcon}
              iconClassName="h-[31px] w-[38px]"
              name="astronautId"
              placeholder="Astronaut ID"
              hint="Your mission-issued astronaut identifier"
            />
          </div>
          <button
            type="submit"
            className="auth-cta mt-[12px] flex h-[65px] w-full items-center justify-center gap-[12px] rounded-full text-[26.5px] font-bold"
          >
            Sign Up
            <ArrowRight className="size-[28px]" strokeWidth={2.4} />
          </button>
        </form>

        <AuthDivider label="or" gapClassName="mt-[13px] gap-[24px] text-[20px] leading-[22px]" />
        <div className="mt-[10px]">
          <SocialLogins />
        </div>

        <Link
          to="/"
          className="mx-auto mt-[11px] flex items-center gap-[16px] text-[22.8px] text-foreground transition-opacity hover:opacity-85"
        >
          <ArrowLeft className="size-[26px]" strokeWidth={1.9} />
          Back to Login
        </Link>
      </div>
    </AuthScene>
  );
}
