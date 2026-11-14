/**
 * ASTRA HEALTH — Cited physiological ranges & spaceflight standards.
 *
 * Every value in this file carries its authoritative source (guideline title,
 * document/requirement id where applicable, and URL). Sources were reviewed
 * against the official NASA Space Apps Challenge 2026 "Create Health
 * Monitoring Software for Astronauts on Space Missions" resources
 * (https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/?tab=resources)
 * and their linked NASA Human Research Program pages, supplemented with
 * recognized clinical guidelines (AHA/ACC, BTS, NICE/NHS, ADA, CDC/AASM, WHO,
 * IOF/WHO, NASEM) and NASA-STD-3001 Rev C requirements.
 *
 * The challenge resources themselves are orientation documents (the 5
 * hazards, the risk catalog, ongoing HRP research, and two CSA articles);
 * the quantitative values below come from the NASA standards & evidence
 * documents those pages link to, as cited per entry.
 *
 * This registry is reference data, not diagnosis. The rule engine still
 * only evaluates the user's own personal thresholds, and the chatbot's
 * analyzer rules (from the user's assistant.py/analyzer.py) are untouched.
 */

export interface GuidelineSource {
  title: string;
  url: string;
  /** Short verbatim fragment carrying the number, for transparency. */
  quote?: string;
}

export interface MetricStandard {
  metric: string;
  unit: string;
  /** Typical adult reference range on Earth (with source). */
  normalAdult: string;
  /** Where a guideline defines an action/alert cutoff. */
  alertAbove?: string;
  alertBelow?: string;
  /** NASA spaceflight standard relevant to this metric, if any. */
  spaceflight?: string;
  sources: GuidelineSource[];
}

export const MEDICAL_STANDARDS = {
  heart_rate: {
    metric: "Heart rate (resting)",
    unit: "bpm",
    normalAdult: "60–100",
    alertAbove: ">100 (tachycardia, AHA)",
    alertBelow: "<60 (bradycardia, AHA; normal in athletes/sleep)",
    spaceflight:
      "Postflight resting HR transiently increased in 13/21 Apollo astronauts, back to preflight in 2–3 days; in-flight resting HR is typically slightly higher than the Earth baseline.",
    sources: [
      {
        title: "American Heart Association — All About Heart Rate",
        url: "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse",
        quote: "A normal resting heart rate is between 60 and 100 beats per minute.",
      },
      {
        title: "American Heart Association — Tachycardia: Fast Heart Rate",
        url: "https://www.heart.org/en/health-topics/arrhythmia/about-arrhythmia/tachycardia--fast-heart-rate",
        quote:
          "Tachycardia is when the heart beats too fast when at rest - at a rate of more than 100 beats per minute.",
      },
      {
        title: "NASA HRP Cardiovascular Risk Evidence Report 2022",
        url: "https://humanresearchroadmap.nasa.gov/evidence/reports/Cardio%20Risk%20EB%202022%20FINAL_4-3-2023.pdf",
        quote:
          "13 exhibited an increased heart rate when at rest postflight. Resting heart rate returned to preflight values by the third examination, two to three days after splashdown.",
      },
    ],
  },
  spo2: {
    metric: "Blood oxygen saturation (SpO₂)",
    unit: "%",
    normalAdult:
      "95–100 in healthy adults (clinical-physiology convention); BTS prescribes a 94–98% target for acutely ill adults",
    alertBelow:
      "<94 warrants investigation (BTS); <92 is the common action threshold (NICE NG253/TSANZ); <90 is 'significant desaturation' (BTS)",
    spaceflight:
      "Cabin inspired O₂ partial pressure is controlled to PIO₂ 145–155 mmHg nominal (acceptable 139–168) per NASA-STD-3001 Vol 2, so crew SpO₂ should remain in the Earth-normal band.",
    sources: [
      {
        title: "British Thoracic Society Guideline for oxygen use in adults (Thorax 2017)",
        url: "https://www.brit-thoracic.org.uk/clinical-resources/guidelines/emergency-oxygen/",
        quote:
          "The recommended target saturation range for acutely ill patients not at risk of hypercapnic respiratory failure is 94-98%.",
      },
      {
        title: "BTS Guideline full text (PMC5531304)",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5531304/",
        quote: "Significant arterial oxygen desaturation (SpO2 <90% ...).",
      },
      {
        title: "NICE NG253 — Suspected sepsis in people aged 16 or over (2025)",
        url: "https://www.nice.org.uk/guidance/ng253/resources/suspected-sepsis-in-people-aged-16-or-over-recognition-assessment-and-early-management-pdf-66144015386053",
        quote:
          "Give oxygen to achieve a target saturation of 94% to 98% for people aged 18 years or over.",
      },
      {
        title: "NASA-STD-3001 Vol 2 Rev C, Table 1 Inspired Oxygen Partial Pressure",
        url: "https://www.nasa.gov/wp-content/uploads/2020-10-2022-04-08_nasa-std-3001_vol_2_rev_c_final.pdf",
      },
    ],
  },
  body_temperature: {
    metric: "Body temperature",
    unit: "°C",
    normalAdult: "36.5–37.5 core (NICE CG65 normothermic range)",
    alertAbove: "≥38.0 fever (NHS)",
    alertBelow:
      "<36.0 perioperative hypothermia definition (NICE); <35.0 accidental hypothermia (CDC/AHA)",
    spaceflight:
      "ISS habitable-volume air temperature is controlled to about 18–27 °C with 30–65% relative humidity (NASA-STD-3001 Vol 2), so core temperature should behave as on Earth.",
    sources: [
      {
        title: "NICE CG65 — Hypothermia (perioperative)",
        url: "https://www.nice.org.uk/guidance/cg65/chapter/recommendations",
        quote: "The expected normal temperature range of adult patients (between 36.5C and 37.5C).",
      },
      {
        title: "NHS — High temperature (fever) in adults",
        url: "https://www.nhs.uk/symptoms/fever-in-adults/",
        quote: "A high temperature is usually considered to be 38C or above.",
      },
      {
        title: "CDC MMWR — Hypothermia",
        url: "https://www.cdc.gov/mmwr/preview/mmwrhtml/00001231.htm",
        quote: "Hypothermia, defined as a core body temperature lower than 35 C (95 F).",
      },
      {
        title: "NASA-STD-3001 Vol 2 Rev C (environmental controls)",
        url: "https://www.nasa.gov/wp-content/uploads/2020-10-2022-04-08_nasa-std-3001_vol_2_rev_c_final.pdf",
      },
    ],
  },
  respiratory_rate: {
    metric: "Respiratory rate",
    unit: "breaths/min",
    normalAdult: "12–20 at rest (StatPearls standard reference)",
    alertAbove: ">20 tachypnea; NICE NG253: 21–24 medium risk, ≥25 high risk",
    alertBelow: "<12 bradypnea",
    spaceflight:
      "Cabin CO₂ is limited to ≤3 mmHg average (NASA agency standard) with the legacy ISS maximum allowable concentration 5.3 mmHg (0.7%), so ventilation rate should remain in the Earth-normal band.",
    sources: [
      {
        title: "StatPearls — Vital Sign Assessment (NCBI NBK553213)",
        url: "https://www.ncbi.nlm.nih.gov/books/NBK553213/",
        quote:
          "The respiratory rate is the number of breaths/min, with a normal adult range of 12 to 20.",
      },
      {
        title: "NICE NG253 — Evaluating risk (2025)",
        url: "https://www.nice.org.uk/guidance/ng253/chapter/Evaluating-risk",
      },
      {
        title: "NASA-STD-3001 Vol 2 Rev C [V2 6004] CO₂ limit",
        url: "https://www.nasa.gov/wp-content/uploads/2020-10-2022-04-08_nasa-std-3001_vol_2_rev_c_final.pdf",
        quote:
          "The system shall limit the average one-hour CO2 partial pressure (ppCO2) in the habitable volume to no more than 3 mmHg.",
      },
      {
        title: "NASA CO₂ exposure analysis (NTRS 20120016340)",
        url: "https://ntrs.nasa.gov/citations/20120016340",
        quote:
          "The current Spacecraft Maximum Allowable Concentration of CO2 aboard the ISS is 0.7% or 5.3 mmHg.",
      },
    ],
  },
  blood_pressure: {
    metric: "Blood pressure",
    unit: "mmHg",
    normalAdult: "<120 systolic AND <80 diastolic (ACC/AHA normal)",
    alertAbove:
      "≥140 or ≥90 stage-2 hypertension; >180 and/or >120 severe/emergency — seek care (2017 ACC/AHA, retained by the 2025 AHA/ACC guideline)",
    spaceflight:
      "Headward fluid shift with spaceflight reduces plasma volume 4–17% mostly in the first week; orthostatic intolerance on landing day affected 66% of ISS crew vs 20% of Shuttle crew in tilt-test data — BP drops on standing are expected postflight.",
    sources: [
      {
        title: "AHA — Understanding Blood Pressure Readings (2025 chart)",
        url: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
        quote:
          "STAGE 2 | 140 OR HIGHER | or | 90 OR HIGHER ... SEVERE HYPERTENSION / HYPERTENSIVE EMERGENCY | HIGHER THAN 180 | and/or | HIGHER THAN 120.",
      },
      {
        title: "AHA/ACC 2025 High Blood Pressure Guideline newsroom release",
        url: "https://newsroom.heart.org/news/new-high-blood-pressure-guideline-emphasizes-prevention-early-treatment-to-reduce-cvd-risk",
        quote: "The blood pressure criteria remain the same as the 2017 guideline.",
      },
      {
        title: "NASA HRP Cardiovascular Risk Evidence Report 2022 (HRR i=179)",
        url: "https://humanresearchroadmap.nasa.gov/Risks/risk.aspx?i=179",
        quote:
          "On landing day, 4 of 6 (66%) ISS astronauts were unable to complete a 10-min 80° head-up tilt test compared to 13 of 66 (20%) Shuttle astronauts.",
      },
    ],
  },
  sleep_hours: {
    metric: "Sleep duration (adult)",
    unit: "hours/night",
    normalAdult: "≥7 for adults 18–60 (CDC/AASM-SRS consensus 2015)",
    alertBelow:
      "<6 chronically inadequate (astronauts averaged ~6–6.5 h inflight, showing sleep debt)",
    spaceflight:
      "NASA-STD-3001 [V1 6001]: recommended 8.5 h sleep period per 24-h workday (plus 2 h pre- and 1.5 h post-sleep buffers); the ISS sees 16 sunrises/day, so light exposure and schedule drive circadian risk.",
    sources: [
      {
        title: "CDC — About Sleep",
        url: "https://www.cdc.gov/sleep/about/index.html",
        quote: "Adult | 18-60 years | 7 or more hours.",
      },
      {
        title: "AASM/SRS Joint Consensus (J Clin Sleep Med 2015)",
        url: "https://jcsm.aasm.org/doi/10.5664/jcsm.4758",
      },
      {
        title: "NASA-STD-3001 Vol 1 Rev C [V1 6001] via Medical Operations reference",
        url: "https://www.nasa.gov/reference/6-0-medical-operations/",
        quote:
          "Recommended 8.5 hr. sleep period (need to also include pre sleep of 2 hrs./post sleep of 1.5 hrs.).",
      },
      {
        title: "NASA OCHMO-TB-041 Sleep Accommodations Rev B",
        url: "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-041-sleep-accommodations.pdf",
        quote: "Astronauts sleep an average of about six hours while in space.",
      },
    ],
  },
  activity_fitness: {
    metric: "Physical activity / aerobic fitness",
    unit: "min/week; VO₂max mL/min/kg",
    normalAdult:
      "150–300 min moderate (or 75–150 vigorous) aerobic activity per week + strengthening ≥2 days (WHO 2020)",
    spaceflight:
      "ISS countermeasure exercise: 2.5 h/day 6 days/week (30–60 min resistive + ~27 min aerobic; crew average ~2 h); NASA-STD-3001 [V1 4001-4004]: in-mission VO₂max ≥32.9 mL/min/kg (microgravity EVA), ≥36.5 (planetary surface EVA), and maintain ≥80% of pre-mission aerobic capacity; average in-mission loss without countermeasures is 10–12%.",
    sources: [
      {
        title: "WHO Guidelines on physical activity and sedentary behaviour (2020)",
        url: "https://www.who.int/publications/i/item/9789240015128",
        quote:
          "Adults should do at least 150-300 minutes of moderate-intensity aerobic physical activity.",
      },
      {
        title: "NASA-STD-3001 Vol 1 Rev C [V1 4001] (Human Performance reference)",
        url: "https://www.nasa.gov/reference/4-0-human-performance/",
        quote:
          "Crewmembers shall maintain an in-mission VO2max at or above 32.9 ml/min/kg for missions with microgravity EVAs.",
      },
      {
        title: "NASA SP-20250000273 — exercise prescription countermeasures (2025)",
        url: "https://www.nasa.gov/wp-content/uploads/2025/02/sp-20250000273.pdf",
        quote:
          "A recommended 2.5 hours a day/6 days a week of exercise with 30-60 minutes of resistive training.",
      },
      {
        title: "NASA HRP — Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness",
        url: "https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/",
        quote: "Average losses to strength and aerobic fitness are 10-12% of pre-mission levels.",
      },
    ],
  },
  muscle_strength: {
    metric: "Muscle strength",
    unit: "% of pre-mission baseline",
    normalAdult:
      "Age/sex-dependent dynamometry; ASTRA tracks grip strength and resistance-training minutes.",
    spaceflight:
      "NASA-STD-3001 [V1 4023-4025]: in-mission skeletal muscle strength shall stay ≥80% of baseline; pre-mission deadlift ≥1.3× body weight (unaided egress); strength losses affect more crew than aerobic declines (10–12% average).",
    sources: [
      {
        title: "NASA-STD-3001 Vol 1 Rev C via Human Performance reference",
        url: "https://www.nasa.gov/reference/4-0-human-performance/",
        quote:
          "Countermeasures shall maintain in-mission skeletal muscle strength at or above 80% of baseline values.",
      },
    ],
  },
  bone_density: {
    metric: "Bone mineral density",
    unit: "% of pre-mission aBMD (DXA); T-score for clinical diagnosis",
    normalAdult:
      "WHO T-score: ≥ -1.0 normal; -1.0 to -2.5 osteopenia; ≤ -2.5 osteoporosis (IOF/WHO)",
    alertBelow:
      "Rapid loss: untreated microgravity bone loss averages 1–1.5% of hip/spine BMD per month",
    spaceflight:
      "NASA-STD-3001 [V1 4027]: countermeasures shall keep hip/spine BMD ≥95% of pre-mission values and femoral neck ≥90%; ARED + bisphosphonate trials reduced loss to ~0%; bisphosphonate mitigation is documented in the NASA bone-loss technical brief.",
    sources: [
      {
        title: "IOF — WHO diagnostic thresholds",
        url: "https://www.iofbonehealth.org/health-professionals/diagnosis",
        quote:
          "Normal: -1 and above | Osteopenia: Between -1 and -2.5 | Osteoporosis: -2.5 or lower.",
      },
      {
        title: "NASA HRP Bone Fracture Evidence Report (2024)",
        url: "https://humanresearchroadmap.nasa.gov/evidence/reports/Bone%20Fracture%20Evidence%20Report_07-18-2024.pdf",
        quote:
          "The average loss rate of pre-flight areal bone mineral density (aBMD) at 1–1.5% per month for hip and spine.",
      },
      {
        title: "NASA-STD-3001 Vol 1 Rev C sec. 4.7.2 [V1 4027]",
        url: "https://www.nasa.gov/wp-content/uploads/2023/11/nasa-std-3001-vol-1-rev-c-with-signature.pdf",
        quote:
          "Countermeasures shall maintain bone mineral density of the hip and spine at or above 95% of pre-mission values and at or above 90% for the femoral neck.",
      },
    ],
  },
  hydration: {
    metric: "Water intake",
    unit: "L/day",
    normalAdult: "Adequate intake ~3.7 L total water/day men, ~2.7 L women (NASEM/IOM 2005)",
    spaceflight:
      "NASA-STD-3001 Vol 2: minimum 2.5 L potable drinking water per crewmember per day; rehydration is also the countermeasure for landing-day orthostatic intolerance.",
    sources: [
      {
        title: "National Academies — DRI for Water (2005), Ch. 4",
        url: "https://www.nationalacademies.org/read/10925/chapter/6",
        quote:
          "The AI for total water intake for young men and women (ages 19 to 30 years) is 3.7 L and 2.7 L per day, respectively.",
      },
      {
        title: "NASA-STD-3001 Vol 2 Rev C, Table 4 Water Quantities",
        url: "https://www.nasa.gov/wp-content/uploads/2020-10-2022-04-08_nasa-std-3001_vol_2_rev_c_final.pdf",
        quote: "Potable Water for Hydration: Minimum 2.5 L (84.5 fl oz) per crewmember per day.",
      },
    ],
  },
  blood_glucose: {
    metric: "Blood glucose (reference — not yet collected by ASTRA)",
    unit: "mg/dL",
    normalAdult:
      "Fasting <100 normal; 100–125 prediabetes; ≥126 diabetes (ADA Standards of Care 2026)",
    alertBelow: "<70 hypoglycemia Level 1 (treat); <54 Level 2 (ADA/IHSG classification)",
    spaceflight:
      "NASA food system standard: ~3,035 kcal/crewmember/day average plus 200 kcal per EVA hour (NASA-STD-3001 Vol 2 [V2 7003-7004]).",
    sources: [
      {
        title: "ADA — Diabetes Diagnosis (Standards of Care)",
        url: "https://diabetes.org/about-diabetes/diagnosis",
        quote:
          "Normal: less than 100 mg/dL; Prediabetes: 100 mg/dl to 125 mg/dL; Diabetes: 126 mg/dL or higher.",
      },
      {
        title: "ADA Standards of Care 2026 §6 — Hypoglycemia classification",
        url: "https://diabetesjournals.org/care/article/49/Supplement_1/S132/163927/6-Glycemic-Goals-Hypoglycemia-and-Hyperglycemic",
        quote: "Level 1 hypoglycemia is defined as a measurable glucose concentration <70 mg/dL.",
      },
    ],
  },
};

/** Mission-level standards that frame the spaceflight context. */
export const MISSION_STANDARDS: Record<string, GuidelineSource & { value: string }> = {
  radiation_career_limit: {
    value:
      "Career effective dose <600 mSv for all crewmembers/ages (keeps 3% REID cancer-risk ceiling)",
    title: "NASA-STD-3001 Vol 1 [V1 4030]",
    url: "https://www.nasa.gov/reference/4-0-human-performance/",
    quote:
      "An individual crewmember's total career effective radiation dose ... shall be less than 600 mSv.",
  },
  radiation_spe_limit: {
    value: "Solar particle event design reference limits acute exposure to <250 mSv per event",
    title: "OCHMO-TB-020 Design for Ionizing Radiation Protection",
    url: "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf",
    quote:
      "Short-term radiation exposure to solar particle events is limited to an effective dose of 250 mSv per event.",
  },
  five_hazards: {
    value:
      "Space radiation, isolation & confinement, distance from Earth, gravity fields, hostile/closed environments",
    title: "NASA HRP — 5 Hazards of Human Spaceflight (challenge resource)",
    url: "https://www.nasa.gov/hrp/hazards/",
  },
  space_adaptation_syndrome: {
    value:
      "Space Adaptation Syndrome affects up to 70% of first-time fliers (≈30% vomit) in the first 48–72 h",
    title: "NASA-STD-3001 Vol 2 Rev C",
    url: "https://www.nasa.gov/wp-content/uploads/2020-10-2022-04-08_nasa-std-3001_vol_2_rev_c_final.pdf",
    quote: "Space Adaptation Syndrome (SAS) occurs in up to 70% of first-time fliers.",
  },
};

/**
 * Compact per-metric lines injected into the assistant's real-data context
 * (never replacing user data; purely reference framing so ASTRA explains
 * values against cited ranges instead of inventing norms).
 */
export function guidelineSummaryForPrompt(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, s] of Object.entries(MEDICAL_STANDARDS) as [string, MetricStandard][]) {
    const bits = [
      s.normalAdult && `adult reference: ${s.normalAdult}`,
      s.alertAbove && `act above: ${s.alertAbove}`,
      s.alertBelow && `act below: ${s.alertBelow}`,
      s.spaceflight && `spaceflight standard: ${s.spaceflight}`,
    ].filter(Boolean);
    if (bits.length)
      out[key] =
        `${s.metric} (${s.unit}) — ${bits.join(" | ")} [sources: ${s.sources.map((x) => x.title).join("; ")}]`;
  }
  return out;
}
