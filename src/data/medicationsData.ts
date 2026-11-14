export type MedicalStatus = "Available" | "Restock Soon" | "Under Review";
export type SupplementStatus = "Target Met" | "Individualized Plan";

export type SupplementIconKey =
  | "flask"
  | "sun"
  | "b1"
  | "b2"
  | "b3"
  | "b5"
  | "b6"
  | "b7"
  | "b9"
  | "b12"
  | "calcium"
  | "magnesium";

export interface MedicalItem {
  id: string;
  category: string;
  name: string;
  dose: string;
  sideEffects: string;
  expiryDate: string;
  status: MedicalStatus;
}

export interface SupplementItem {
  id: string;
  name: string;
  policy: string;
  dailyTarget: string;
  status: SupplementStatus;
  column: "left" | "right";
  iconKey: SupplementIconKey;
}

export const medical: readonly MedicalItem[] = [
  {
    id: "motion-sickness",
    category: "Motion Sickness",
    name: "Scopolamine Patch",
    dose: "1 patch",
    sideEffects: "Drowsiness",
    expiryDate: "2028-11-01",
    status: "Available",
  },
  {
    id: "anti-allergic",
    category: "Anti-Allergic",
    name: "Cetirizine 10mg",
    dose: "1 tab",
    sideEffects: "N/A",
    expiryDate: "2027-05-10",
    status: "Restock Soon",
  },
  {
    id: "anti-inflammatory",
    category: "Anti-Inflammatory",
    name: "Zolpidem 5mg",
    dose: "1 tab",
    sideEffects: "Dizziness",
    expiryDate: "2027-01-15",
    status: "Under Review",
  },
  {
    id: "sleep-related",
    category: "Sleep-Related Medications",
    name: "Zolpidem 5mg",
    dose: "1 tab",
    sideEffects: "Dizziness",
    expiryDate: "2027-01-15",
    status: "Available",
  },
  {
    id: "pain-relief",
    category: "Pain Relief",
    name: "Cetirizine 10mg",
    dose: "1 tab",
    sideEffects: "Drowsiness",
    expiryDate: "2027-05-10",
    status: "Restock Soon",
  },
  {
    id: "emergency-kit",
    category: "Emergency Kit",
    name: "Emergency Kit",
    dose: "1 tab",
    sideEffects: "N/A",
    expiryDate: "2028-07-01",
    status: "Available",
  },
];

export const supplements: readonly SupplementItem[] = [
  {
    id: "iron",
    name: "Iron",
    policy: "Individualized",
    dailyTarget: "8-18 mg",
    status: "Target Met",
    column: "left",
    iconKey: "flask",
  },
  {
    id: "vitamin-d3",
    name: "Vitamin D3",
    policy: "NASA maintenance protocol",
    dailyTarget: "1,000 IU",
    status: "Target Met",
    column: "left",
    iconKey: "sun",
  },
  {
    id: "vitamin-b1",
    name: "Vitamin B1",
    policy: "Dietary target",
    dailyTarget: "1.1-1.2 mg",
    status: "Target Met",
    column: "left",
    iconKey: "b1",
  },
  {
    id: "vitamin-b2",
    name: "Vitamin B2",
    policy: "Dietary target",
    dailyTarget: "1.1-1.3 mg",
    status: "Target Met",
    column: "left",
    iconKey: "b2",
  },
  {
    id: "vitamin-b3",
    name: "Vitamin B3",
    policy: "Dietary target",
    dailyTarget: "14-16 mg",
    status: "Target Met",
    column: "left",
    iconKey: "b3",
  },
  {
    id: "vitamin-b5",
    name: "Vitamin B5",
    policy: "Dietary target",
    dailyTarget: "5 mg",
    status: "Target Met",
    column: "left",
    iconKey: "b5",
  },
  {
    id: "vitamin-b6",
    name: "Vitamin B6",
    policy: "Dietary target",
    dailyTarget: "1.3 mg",
    status: "Individualized Plan",
    column: "right",
    iconKey: "b6",
  },
  {
    id: "vitamin-b7",
    name: "Vitamin B7",
    policy: "Dietary target",
    dailyTarget: "30 µg",
    status: "Target Met",
    column: "right",
    iconKey: "b7",
  },
  {
    id: "vitamin-b9",
    name: "Vitamin B9",
    policy: "Dietary target",
    dailyTarget: "400 µg",
    status: "Target Met",
    column: "right",
    iconKey: "b9",
  },
  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    policy: "Dietary target",
    dailyTarget: "2.4 µg",
    status: "Individualized Plan",
    column: "right",
    iconKey: "b12",
  },
  {
    id: "calcium",
    name: "Calcium",
    policy: "Dietary target",
    dailyTarget: "1,000-1,500 mg",
    status: "Individualized Plan",
    column: "right",
    iconKey: "calcium",
  },
  {
    id: "magnesium",
    name: "Magnesium",
    policy: "Dietary target",
    dailyTarget: "320-420 mg",
    status: "Target Met",
    column: "right",
    iconKey: "magnesium",
  },
];

export type ExpiryUrgency = "normal" | "soon" | "expired";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Evaluates whether an ISO expiry date (YYYY-MM-DD) is already past or within 90 days of referenceDate.
 */
export function getExpiryUrgency(
  expiryDate: string,
  referenceDate: Date = new Date(),
): ExpiryUrgency {
  const parsed = Date.parse(`${expiryDate}T23:59:59Z`);
  if (Number.isNaN(parsed)) return "normal";
  const diff = parsed - referenceDate.getTime();
  if (diff < 0) return "expired";
  if (diff <= NINETY_DAYS_MS) return "soon";
  return "normal";
}
