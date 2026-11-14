import nasaLogo from "@/assets/nasa-logo.png.asset.json";

import { GoogleIcon, MicrosoftIcon } from "./icons";

const PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "microsoft", label: "Continue with Microsoft" },
  { id: "nasa", label: "Continue with NASA" },
] as const;

export function SocialLogins() {
  return (
    <div className="flex flex-wrap justify-center gap-[10px] sm:gap-[13px]">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-label={p.label}
          className="auth-tile flex h-[56px] w-[78px] items-center justify-center sm:h-[63px] sm:w-[88px]"
        >
          {p.id === "google" && <GoogleIcon className="size-[38px]" />}
          {p.id === "microsoft" && <MicrosoftIcon className="size-[32px]" />}
          {p.id === "nasa" && (
            <img src={nasaLogo.url} alt="" className="h-[37px] w-[42px] object-contain" />
          )}
        </button>
      ))}
    </div>
  );
}
