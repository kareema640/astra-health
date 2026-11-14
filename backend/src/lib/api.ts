import type { Request, Response } from "express";
import type { ZodError } from "zod";
import { fieldErrors } from "../validation";

/** Wrap async handlers so rejections hit the central error handler. */
export function h(
  fn: (req: Request, res: Response) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: (err: unknown) => void) => {
    fn(req, res).catch(next);
  };
}

/** Shared 400 shape with the per-field map the frontend already renders. */
export function validationFail(res: Response, error: ZodError) {
  return res.status(400).json({
    error: {
      code: "VALIDATION",
      message: "Please fix the highlighted fields",
      fields: fieldErrors(error),
    },
  });
}

export function notFound(res: Response, what: string) {
  return res.status(404).json({ error: { code: "NOT_FOUND", message: `${what} not found` } });
}

/**
 * Empty string / missing → null, never 0. Central to the health-data rule
 * that missing information must stay distinguishable from a zero reading.
 */
export function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function intOrNull(v: unknown, scale = 0): number | null {
  const n = numOrNull(v);
  return n === null ? null : Math.round(n);
}

export function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** numeric → string form the UI stores ("" for null) for snapshot responses. */
export function s(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}
