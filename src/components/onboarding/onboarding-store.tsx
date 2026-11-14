import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { HeartCondition, HeightUnit, WeightUnit } from "./logic";

/** How the user left a health-profile step: Continue marks it done, Skip marks it skipped. */
export type StepStatus = "done" | "skipped";

export interface OnboardingData {
  /** Collected on Sign Up. Passwords are never stored. */
  account: {
    fullName: string;
    email: string;
    astronautId: string;
    joinDate: string;
  };
  basic: {
    age: string;
    sex: "male" | "female" | "other";
    height: string;
    heightUnit: HeightUnit;
    weight: string;
    weightUnit: WeightUnit;
  };
  vitals: {
    systolic: string;
    diastolic: string;
    bpUnknown: boolean;
    respiratoryRate: string;
    spo2: string;
    measuredWithDevice: boolean;
  };
  heart: {
    heartAlert: "off" | "on";
    restingHr: string;
    conditions: HeartCondition[];
    alertAbove: string;
    alertBelow: string;
    sleep: "lt5" | "5-6" | "7-8" | "9plus";
    hydration: "lt1" | "1-2" | "2-3" | "3plus";
  };
  muscle: {
    muscleMass: string;
    boneDensity: "normal" | "osteopenia" | "osteoporosis" | "unknown";
    emgFile: string | null;
    dexaFile: string | null;
    emgGroup: "biceps" | "quadriceps" | "calf" | "core" | "forearm";
  };
  avatar: {
    character: "explorer" | "pilot" | "scientist" | "commander" | "medic";
    skin: "purple" | "green" | "blue" | "yellow" | "teal";
    accent: "red" | "blue" | "gold" | "green" | "white";
    callsign: string;
    fromPhoto: boolean;
    suit: "eva-white" | "launch-orange" | "flight-blue" | "lunar-gray";
    visor: "clear" | "gold" | "tinted";
    customPhoto: string;
  };
  /**
   * Which steps the user finished. Preselected choices (sleep, sex, avatar…) only count as the
   * user's answer once their step is "done".
   */
  progress: Partial<Record<"basic" | "vitals" | "heart" | "muscle" | "avatar", StepStatus>>;
}

export type ProgressKey = keyof OnboardingData["progress"];

/** Starting selections match the states shown in the step designs. */
export const DEFAULT_ONBOARDING: OnboardingData = {
  account: { fullName: "", email: "", astronautId: "", joinDate: "" },
  basic: { age: "", sex: "male", height: "", heightUnit: "cm", weight: "", weightUnit: "kg" },
  vitals: {
    systolic: "",
    diastolic: "",
    bpUnknown: false,
    respiratoryRate: "",
    spo2: "",
    measuredWithDevice: false,
  },
  heart: {
    heartAlert: "on",
    restingHr: "",
    conditions: ["none"],
    alertAbove: "",
    alertBelow: "",
    sleep: "7-8",
    hydration: "2-3",
  },
  muscle: {
    muscleMass: "",
    boneDensity: "unknown",
    emgFile: null,
    dexaFile: null,
    emgGroup: "quadriceps",
  },
  avatar: {
    character: "explorer",
    skin: "purple",
    accent: "red",
    callsign: "",
    fromPhoto: false,
    suit: "eva-white",
    visor: "clear",
    customPhoto: "",
  },
  progress: {},
};

export const STORAGE_KEY = "astra-onboarding-v1";
export const AVATAR_STORAGE_KEY = "astra_selected_avatar";
export const ASTRA_USER_STORAGE_KEY = "astra_user";

interface AstraUserRecord {
  name?: string;
  avatarId?: OnboardingData["avatar"]["character"];
  joinDate?: string;
  customPhoto?: string;
}

const VALID_CHARACTERS: ReadonlySet<OnboardingData["avatar"]["character"]> = new Set([
  "explorer",
  "pilot",
  "scientist",
  "commander",
  "medic",
]);

type Section = keyof OnboardingData;

interface OnboardingContextValue {
  data: OnboardingData;
  /** False until the saved answers have been read from this browser. */
  hydrated: boolean;
  update: <K extends Section>(section: K, patch: Partial<OnboardingData[K]>) => void;
  /** Forget every answer on this device. */
  reset: () => void;
  /** Clear active session data while keeping static data intact. */
  logout: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function mergeSaved(saved: Partial<OnboardingData>): OnboardingData {
  const merged = { ...DEFAULT_ONBOARDING };
  for (const key of Object.keys(DEFAULT_ONBOARDING) as Section[]) {
    merged[key] = { ...DEFAULT_ONBOARDING[key], ...(saved[key] ?? {}) } as never;
  }
  return merged;
}

function readSaved(): string | null {
  // Earlier versions kept answers in session storage only; pick those up once.
  return window.localStorage.getItem(STORAGE_KEY) ?? window.sessionStorage.getItem(STORAGE_KEY);
}

/**
 * Holds every answer from Sign Up, the health-profile steps and the dashboard settings.
 * Mirrored to local storage so a refresh or a new visit on this device keeps them.
 */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = readSaved();
      const savedAvatar = window.localStorage.getItem(AVATAR_STORAGE_KEY) as
        OnboardingData["avatar"]["character"] | null;
      const savedUserRaw = window.localStorage.getItem(ASTRA_USER_STORAGE_KEY);
      const savedUser = savedUserRaw ? (JSON.parse(savedUserRaw) as AstraUserRecord) : null;

      if (raw) {
        const parsed = mergeSaved(JSON.parse(raw) as Partial<OnboardingData>);
        if (savedAvatar && VALID_CHARACTERS.has(savedAvatar) && !parsed.progress.avatar) {
          parsed.avatar = { ...parsed.avatar, character: savedAvatar };
        }
        if (savedUser) {
          if (!parsed.account.fullName && savedUser.name) {
            parsed.account = { ...parsed.account, fullName: savedUser.name };
          }
          if (!parsed.account.joinDate && savedUser.joinDate) {
            parsed.account = { ...parsed.account, joinDate: savedUser.joinDate };
          }
          if (!parsed.avatar.customPhoto && savedUser.customPhoto) {
            parsed.avatar = { ...parsed.avatar, customPhoto: savedUser.customPhoto };
          }
          if (
            savedUser.avatarId &&
            VALID_CHARACTERS.has(savedUser.avatarId) &&
            !parsed.progress.avatar
          ) {
            parsed.avatar = { ...parsed.avatar, character: savedUser.avatarId };
          }
        }
        setData(parsed);
      } else if (savedAvatar || savedUser) {
        setData((prev) => ({
          ...prev,
          account: {
            ...prev.account,
            fullName: savedUser?.name ?? prev.account.fullName,
            joinDate: savedUser?.joinDate ?? prev.account.joinDate,
          },
          avatar: {
            ...prev.avatar,
            character:
              savedUser?.avatarId && VALID_CHARACTERS.has(savedUser.avatarId)
                ? savedUser.avatarId
                : savedAvatar && VALID_CHARACTERS.has(savedAvatar)
                  ? savedAvatar
                  : prev.avatar.character,
            customPhoto: savedUser?.customPhoto ?? prev.avatar.customPhoto,
          },
        }));
      }
    } catch {
      // Ignore unreadable storage; the defaults stay in place.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.localStorage.setItem(AVATAR_STORAGE_KEY, data.avatar.character);
      const astraUser: AstraUserRecord = {
        name: data.account.fullName.trim() || data.avatar.callsign.trim() || "Sarah",
        avatarId: data.avatar.character,
        joinDate: data.account.joinDate?.trim() || "Nov 11, 2026",
        customPhoto: data.avatar.customPhoto || "",
      };
      window.localStorage.setItem(ASTRA_USER_STORAGE_KEY, JSON.stringify(astraUser));
    } catch {
      // Storage can be unavailable (private mode); answers still live in memory.
    }
  }, [data, hydrated]);

  const update = useCallback<OnboardingContextValue["update"]>((section, patch) => {
    setData((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }, []);

  const reset = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(AVATAR_STORAGE_KEY);
      window.localStorage.removeItem(ASTRA_USER_STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
    setData(DEFAULT_ONBOARDING);
  }, []);

  const logout = useCallback(() => {
    try {
      window.sessionStorage.clear();
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(AVATAR_STORAGE_KEY);
      window.localStorage.removeItem(ASTRA_USER_STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
    setData(DEFAULT_ONBOARDING);
  }, []);

  const value = useMemo(
    () => ({ data, hydrated, update, reset, logout }),
    [data, hydrated, update, reset, logout],
  );
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}

/** Shorthand for one section: its values and a patch setter. */
export function useOnboardingSection<K extends Section>(section: K) {
  const { data, update } = useOnboarding();
  const set = useCallback(
    (patch: Partial<OnboardingData[K]>) => update(section, patch),
    [section, update],
  );
  return [data[section], set] as const;
}
