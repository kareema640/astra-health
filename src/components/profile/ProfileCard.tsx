import { Calendar, Camera, Check, Rocket, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";

import { displayName } from "@/components/dashboard/health";
import { useOnboarding } from "@/components/onboarding/onboarding-store";
import { AVATAR_OPTIONS, resolveAvatarImage } from "@/data/avatars";
import { cn } from "@/lib/utils";

import { Modal } from "./Modal";

export function ProfileCard() {
  const { data, update } = useOnboarding();
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userName = displayName(data);
  const joinDate = data.account.joinDate?.trim() || "Nov 11, 2026";
  const avatarSrc = resolveAvatarImage(data.avatar.character, data.avatar.customPhoto);

  const handleSelectAvatar = (id: (typeof AVATAR_OPTIONS)[number]["id"]) => {
    update("avatar", { character: id, customPhoto: "", fromPhoto: false });
    update("progress", { avatar: "done" });
    setPickerOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("avatar", { customPhoto: reader.result, fromPhoto: true });
        setPickerOpen(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <section
        aria-label="Astronaut Profile"
        className="dash-card-calm flex flex-col items-center gap-[22px] p-[22px] sm:flex-row sm:gap-[28px] sm:p-[28px]"
      >
        <div className="relative mx-auto size-[184px] shrink-0 overflow-hidden rounded-[18px] border border-white/15 bg-navy/60 shadow-[0_12px_28px_rgba(4,12,35,0.45)] sm:mx-0 sm:size-[214px]">
          <img
            src={avatarSrc}
            alt={`${userName} astronaut portrait`}
            className="h-full w-full object-cover object-top"
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-label="Change profile avatar or photo"
            title="Change profile photo"
            className="absolute right-[10px] bottom-[10px] flex size-[36px] cursor-pointer items-center justify-center rounded-full border border-blue-300/45 bg-[#081635]/85 text-white shadow-md backdrop-blur-md transition-transform hover:scale-105 hover:bg-[#3B82F6]"
          >
            <Camera className="size-[17px]" strokeWidth={2} />
          </button>
        </div>

        <div className="w-full min-w-0 flex-1">
          <h1 className="truncate text-[30px] leading-[1.15] font-bold tracking-[-0.01em] text-foreground sm:text-[36px]">
            {userName}
          </h1>
          <p className="mt-[4px] text-[17px] font-normal text-foreground/80 sm:text-[18px]">
            Astronaut
          </p>

          <div className="my-[16px] h-px w-full bg-white/15 sm:my-[18px]" />

          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center gap-[16px]">
              <Rocket className="size-[26px] shrink-0 text-[#F25C3C]" strokeWidth={1.9} />
              <div className="min-w-0">
                <div className="text-[13px] text-foreground/60">Mission</div>
                <div className="truncate text-[16px] font-medium text-foreground sm:text-[16.5px]">
                  Orbital Health Mission
                </div>
              </div>
            </div>

            <div className="flex items-center gap-[16px]">
              <Calendar className="size-[26px] shrink-0 text-[#F25C3C]" strokeWidth={1.9} />
              <div className="min-w-0">
                <div className="text-[13px] text-foreground/60">Join Date</div>
                <div className="text-[16px] font-medium text-foreground sm:text-[16.5px]">
                  {joinDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Profile Photo & Avatar"
        subtitle="Choose your mission avatar or upload a custom photo."
      >
        <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-5">
          {AVATAR_OPTIONS.map((opt) => {
            const active = !data.avatar.customPhoto && data.avatar.character === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectAvatar(opt.id)}
                className={cn(
                  "relative flex cursor-pointer flex-col items-center gap-[6px] rounded-[14px] border p-[8px] transition-colors",
                  active
                    ? "border-[#3B82F6] bg-[#3B82F6]/20"
                    : "border-white/15 bg-white/[0.04] hover:border-blue-400/50 hover:bg-white/[0.08]",
                )}
              >
                <img
                  src={opt.image}
                  alt={opt.name}
                  className="size-[52px] rounded-[10px] object-cover object-top"
                />
                <span className="text-[11.5px] font-medium text-foreground">{opt.name}</span>
                {active && (
                  <span className="absolute top-[4px] right-[4px] flex size-[18px] items-center justify-center rounded-full bg-[#3B82F6] text-white">
                    <Check className="size-[11px]" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-[18px] flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[44px] flex-1 cursor-pointer items-center justify-center gap-[8px] rounded-[12px] bg-[#3B82F6] px-[16px] text-[14.5px] font-medium text-white transition-colors hover:bg-[#2563EB]"
          >
            <Upload className="size-[16px]" />
            Upload Photo
          </button>
          {data.avatar.customPhoto && (
            <button
              type="button"
              onClick={() => {
                update("avatar", { customPhoto: "", fromPhoto: false });
                setPickerOpen(false);
              }}
              className="h-[44px] cursor-pointer rounded-[12px] border border-white/20 px-[14px] text-[14px] text-foreground/85 transition-colors hover:bg-white/[0.08]"
            >
              Use Avatar
            </button>
          )}
        </div>
      </Modal>
    </>
  );
}
