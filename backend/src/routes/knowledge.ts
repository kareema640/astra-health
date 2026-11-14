import { Router } from "express";
import { notFound } from "../lib/api";
import {
  MEDICAL_STANDARDS,
  MISSION_STANDARDS,
  guidelineSummaryForPrompt,
} from "../knowledge/standards";
import type { MetricStandard } from "../knowledge/standards";

/**
 * Reference knowledge API: cited physiological ranges and NASA/clinical
 * standards behind ASTRA's interpretation. Purely public reference data —
 * no PHI, no authentication required; responses are cacheable.
 *
 * Sources were reviewed from the official Space Apps 2026 challenge
 * resources page and the NASA HRP / NASA-STD-3001 documents it links,
 * supplemented with AHA/ACC, BTS, NICE/NHS, ADA, CDC/AASM, WHO, IOF and
 * NASEM guidance. Every entry carries its own citations.
 */
export const knowledgeRouter = Router();

knowledgeRouter.use((_req, res, next) => {
  res.set("Cache-Control", "public, max-age=3600");
  next();
});

knowledgeRouter.get("/standards", (_req, res) => {
  res.json({
    disclaimer:
      "Reference ranges from published guidelines; not personal medical advice. " +
      "In microgravity individual physiology shifts — consult the mission medical officer.",
    review_basis:
      "NASA Space Apps 2026 challenge resources (nasa.gov/hrp) plus NASA-STD-3001 Rev C and recognized clinical guidelines.",
    metrics: MEDICAL_STANDARDS,
    mission: MISSION_STANDARDS,
  });
});

knowledgeRouter.get("/standards/:metric", (req, res) => {
  const all: Record<string, MetricStandard | undefined> = MEDICAL_STANDARDS;
  const entry = all[req.params.metric];
  if (!entry) return notFound(res, "standard");
  res.json(entry);
});

knowledgeRouter.get("/summary", (_req, res) => {
  res.json(guidelineSummaryForPrompt());
});
