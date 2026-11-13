import { describe, expect, it } from "vitest";

import { convertHeight, convertWeight, toggleHeartCondition } from "@/components/onboarding/logic";
import { filledSegments, ONBOARDING_STEPS, stepNeighbors } from "@/components/onboarding/steps";

describe("onboarding step order", () => {
  it("runs Basic Information → Vital Signs → Heart & Recovery → Muscle & Bone → Choose Your Avatar", () => {
    expect(ONBOARDING_STEPS.map((s) => s.path)).toEqual([
      "/onboarding/basic-info",
      "/onboarding/vital-signs",
      "/onboarding/heart-recovery",
      "/onboarding/muscle-bone",
      "/onboarding/avatar",
    ]);
  });

  it("goes back from step 2 to Sign Up", () => {
    expect(stepNeighbors(2).prev).toBe("/signup");
  });

  it("continues from Muscle & Bone to Choose Your Avatar", () => {
    expect(stepNeighbors(5).next).toBe("/onboarding/avatar");
  });

  it("goes back from Choose Your Avatar to Muscle & Bone", () => {
    expect(stepNeighbors(6).prev).toBe("/onboarding/muscle-bone");
  });

  it("has no next page after Choose Your Avatar (Launch Dashboard does nothing yet)", () => {
    expect(stepNeighbors(6).next).toBeNull();
  });

  it("lights one progress segment per completed step out of six", () => {
    expect(filledSegments(2)).toBe(2);
    expect(filledSegments(6)).toBe(6);
  });
});

describe("health-profile rules", () => {
  it("converts 175 cm to 5'9\" and back", () => {
    expect(convertHeight("175", "cm", "ftin")).toBe(`5'9"`);
    expect(convertHeight(`5'9"`, "ftin", "cm")).toBe("175");
  });

  it("converts 70 kg to 154 lb", () => {
    expect(convertWeight("70", "kg", "lb")).toBe("154");
  });

  it("clears other heart conditions when None is picked", () => {
    expect(toggleHeartCondition(["arrhythmia", "hypertension"], "none")).toEqual(["none"]);
  });

  it("replaces None when a condition is picked", () => {
    expect(toggleHeartCondition(["none"], "arrhythmia")).toEqual(["arrhythmia"]);
  });
});
