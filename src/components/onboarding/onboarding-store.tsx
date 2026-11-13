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

export interface OnboardingData {
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
  };
}

/** Starting selections match the states shown in the step designs. */
export const DEFAULT_ONBOARDING: OnboardingData = {
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
    character: "commander",
    skin: "yellow",
    accent: "red",
    callsign: "",
    fromPhoto: false,
    suit: "eva-white",
    visor: "clear",
  },
};

const STORAGE_KEY = "astra-onboarding-v1";

type Section = keyof OnboardingData;

interface OnboardingContextValue {
  data: OnboardingData;
  update: <K extends Section>(section: K, patch: Partial<OnboardingData[K]>) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function mergeSaved(saved: Partial<OnboardingData>): OnboardingData {
  const merged = { ...DEFAULT_ONBOARDING };
  for (const key of Object.keys(DEFAULT_ONBOARDING) as Section[]) {
    merged[key] = { ...DEFAULT_ONBOARDING[key], ...(saved[key] ?? {}) } as never;
  }
  return merged;
}

/** Holds every answer across the steps; kept in session storage so a refresh doesn't lose them. */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) setData(mergeSaved(JSON.parse(raw) as Partial<OnboardingData>));
    } catch {
      // Ignore unreadable storage; the defaults stay in place.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage can be unavailable (private mode); answers still live in memory.
    }
  }, [data, hydrated]);

  const update = useCallback<OnboardingContextValue["update"]>((section, patch) => {
    setData((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }, []);

  const value = useMemo(() => ({ data, update }), [data, update]);
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
