import { Bell, Check, Globe, Moon, Settings } from "lucide-react";
import { useState } from "react";

import type { AppLanguage, AppTheme, ProfilePreferences } from "@/data/profileData";
import { cn } from "@/lib/utils";

import { Modal } from "./Modal";
import { SettingRow } from "./SettingRow";
import { ToggleSwitch } from "./ToggleSwitch";

interface PreferencesCardProps {
  prefs: ProfilePreferences;
  onUpdate: (patch: Partial<ProfilePreferences>) => void;
}

const LANGUAGES: readonly { value: AppLanguage; subtitle: string }[] = [
  { value: "English", subtitle: "Left-to-right (LTR) interface" },
  { value: "Arabic", subtitle: "Right-to-left (RTL) direction" },
];

export function PreferencesCard({ prefs, onUpdate }: PreferencesCardProps) {
  const [langModalOpen, setLangModalOpen] = useState(false);

  const toggleTheme = () => {
    const nextTheme: AppTheme = prefs.theme === "dark" ? "light" : "dark";
    onUpdate({ theme: nextTheme });
  };

  return (
    <>
      <section aria-label="Preferences" className="dash-card-calm p-[26px]">
        <div className="flex items-center gap-[12px]">
          <Settings className="size-[24px] shrink-0 text-[#F25C3C]" strokeWidth={2} />
          <h2 className="text-[20px] font-semibold tracking-[-0.005em] text-foreground">
            Preferences
          </h2>
        </div>

        <div className="my-[14px] h-px w-full bg-white/15" />

        <div className="flex flex-col gap-[4px]">
          <SettingRow
            icon={Globe}
            label="Language"
            value={prefs.language}
            onClick={() => setLangModalOpen(true)}
          />
          <SettingRow
            icon={Moon}
            label="Theme"
            value={prefs.theme === "dark" ? "Dark Mode" : "Light Mode"}
            onClick={toggleTheme}
          />
          <SettingRow
            icon={Bell}
            label="Notifications"
            rightControl={
              <ToggleSwitch
                checked={prefs.notifications}
                onChange={(next) => onUpdate({ notifications: next })}
                label="Toggle mission notifications"
              />
            }
          />
        </div>
      </section>

      <Modal
        open={langModalOpen}
        onClose={() => setLangModalOpen(false)}
        title="Select Language"
        subtitle="Switch interface language and layout direction."
      >
        <div className="flex flex-col gap-[10px]">
          {LANGUAGES.map((lang) => {
            const active = prefs.language === lang.value;
            return (
              <button
                key={lang.value}
                type="button"
                onClick={() => {
                  onUpdate({ language: lang.value });
                  setLangModalOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-[14px] border px-[16px] py-[12px] text-left transition-colors",
                  active
                    ? "border-[#3B82F6] bg-[#3B82F6]/20"
                    : "border-white/15 bg-white/[0.04] hover:border-blue-400/50 hover:bg-white/[0.08]",
                )}
              >
                <div>
                  <div className="text-[16px] font-medium text-foreground">{lang.value}</div>
                  <div className="text-[12.5px] text-dash-muted">{lang.subtitle}</div>
                </div>
                {active && (
                  <span className="flex size-[22px] items-center justify-center rounded-full bg-[#3B82F6] text-white">
                    <Check className="size-[13px]" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
