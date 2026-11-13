import { createFileRoute } from "@tanstack/react-router";

import {
  ACCENTS,
  AVATARS,
  avatarById,
  SKINS,
  SUITS,
  suitById,
  VISORS,
  visorById,
} from "@/components/onboarding/avatars";
import { CheckRow, FieldLabel, UnitInput } from "@/components/onboarding/fields";
import { OnboardingScene } from "@/components/onboarding/OnboardingScene";
import { useOnboardingSection } from "@/components/onboarding/onboarding-store";
import { StepCard } from "@/components/onboarding/StepCard";
import { StepFooter } from "@/components/onboarding/StepFooter";
import { stepHead } from "@/components/onboarding/steps";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/avatar")({
  head: () =>
    stepHead(
      "Choose Your Avatar",
      "Pick your full-body astronaut avatar, suit and helmet visor for the mission dashboard.",
    ),
  component: AvatarPage,
});

const CALLSIGN_FALLBACK = "Nova-7";

function AvatarPage() {
  const [avatar, set] = useOnboardingSection("avatar");
  const character = avatarById(avatar.character);
  const suit = suitById(avatar.suit);
  const visor = visorById(avatar.visor);

  return (
    <OnboardingScene
      step={6}
      aside={
        <div className="flex h-full flex-col items-center px-[32px] pt-[28px] compact:pb-[36px]">
          <h2 className="text-[21px] leading-[28px] font-bold text-foreground">Your avatar</h2>
          <div className="onb-preview relative mt-[15px] h-[467px] w-[280px] shrink-0 overflow-hidden rounded-[22px]">
            <span
              aria-hidden
              className="absolute -bottom-[44px] left-1/2 h-[96px] w-[118%] -translate-x-1/2 rounded-[50%] bg-platform"
            />
            <img
              key={character.id}
              src={character.image}
              alt={`${character.name} avatar`}
              className="absolute inset-x-[14px] bottom-[30px] h-[418px] w-[calc(100%-28px)] object-contain object-bottom duration-300 animate-in fade-in zoom-in-95"
            />
          </div>
          <p className="mt-[9px] text-[16.5px] leading-[27px] text-foreground">
            <span className="font-bold text-coral">
              {avatar.callsign.trim() || CALLSIGN_FALLBACK}
            </span>{" "}
            · {character.name}
          </p>
          <p className="text-[16.5px] leading-[27px] text-onb-label">
            {suit.label} · {visor.label} visor
          </p>
        </div>
      }
    >
      <StepCard
        title="Choose Your"
        accent="Avatar"
        subtitle="Last step: pick how you appear inside the mission dashboard."
        footer={<StepFooter step={6} nextLabel="Launch Dashboard" />}
      >
        <div className="flex gap-[24px] compact:flex-col">
          <div className="w-[633px] shrink-0 compact:w-full">
            <FieldLabel id="avatar-label" hint="(full-body)">
              Choose your avatar
            </FieldLabel>
            <div
              role="radiogroup"
              aria-labelledby="avatar-label"
              className="mt-[8px] grid grid-cols-5 gap-[12px]"
            >
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={a.id === avatar.character}
                  onClick={() => set({ character: a.id, skin: a.skin })}
                  className="onb-tile flex h-[209px] flex-col items-center px-[6px] pt-[7px] pb-[11px]"
                >
                  <img src={a.image} alt="" className="h-[150px] w-full object-contain" />
                  <span className="mt-auto text-[14.5px] leading-[18px] font-bold text-foreground">
                    {a.name}
                  </span>
                  <span className="text-[12.5px] leading-[16px] text-onb-body">{a.color}</span>
                </button>
              ))}
            </div>

            <div className="mt-[10px]">
              <FieldLabel id="suit-label">Suit style</FieldLabel>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="suit-label"
              className="mt-[8px] grid grid-cols-4 gap-[14px]"
            >
              {SUITS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={s.id === avatar.suit}
                  onClick={() => set({ suit: s.id })}
                  className="onb-tile flex h-[135px] flex-col items-center px-[6px] pt-[7px] pb-[7px]"
                >
                  <img src={s.image} alt="" className="h-[96px] w-full object-contain" />
                  <span className="mt-auto text-[14.5px] leading-[18px] font-bold text-foreground">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-[12px]">
              <FieldLabel id="visor-label">Helmet visor</FieldLabel>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="visor-label"
              className="mt-[8px] grid grid-cols-3 gap-[12px]"
            >
              {VISORS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={v.id === avatar.visor}
                  onClick={() => set({ visor: v.id })}
                  className="onb-tile flex h-[131px] flex-col items-center px-[6px] pt-[7px] pb-[9px]"
                >
                  <img src={v.image} alt="" className="h-[76px] w-full object-contain" />
                  <span className="mt-auto text-[14.5px] leading-[18px] font-bold text-foreground">
                    {v.label}
                  </span>
                  <span className="text-[12.5px] leading-[16px] text-onb-body">{v.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <FieldLabel id="skin-label">Skin color</FieldLabel>
            <div
              role="radiogroup"
              aria-labelledby="skin-label"
              className="mt-[8px] flex gap-[9px] pl-[2px]"
            >
              {SKINS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={s.id === avatar.skin}
                  aria-label={s.label}
                  onClick={() => {
                    const match = AVATARS.find((a) => a.skin === s.id);
                    set({ skin: s.id, ...(match ? { character: match.id } : {}) });
                  }}
                  className={cn("onb-swatch size-[36px]", s.className)}
                />
              ))}
            </div>

            <div className="mt-[14px]">
              <FieldLabel id="accent-label">Suit accent</FieldLabel>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="accent-label"
              className="mt-[8px] flex gap-[9px] pl-[2px]"
            >
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={a.id === avatar.accent}
                  aria-label={a.label}
                  onClick={() => set({ accent: a.id })}
                  className={cn("onb-swatch size-[36px]", a.className)}
                />
              ))}
            </div>

            <div className="mt-[15px]">
              <FieldLabel htmlFor="callsign">Callsign</FieldLabel>
              <UnitInput
                id="callsign"
                className="mt-[7px]"
                placeholder="e.g. Nova-7"
                maxLength={20}
                value={avatar.callsign}
                onChange={(e) => set({ callsign: e.target.value })}
              />
            </div>

            <CheckRow
              className="mt-[14px] items-start text-[14.5px] leading-[18px] [&>span:first-child]:mt-[1px]"
              checked={avatar.fromPhoto}
              onChange={(fromPhoto) => set({ fromPhoto })}
            >
              Generate my avatar from a photo of me (optional)
            </CheckRow>

            <p className="mt-[18px] text-[16.5px] leading-[22px] text-onb-body">
              Your avatar appears full-body on your dashboard and profile.
            </p>
          </div>
        </div>
      </StepCard>
    </OnboardingScene>
  );
}
