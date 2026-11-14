import { z } from "zod";
import { passwordIssues } from "./passwords";

/**
 * Field set mirrors the existing Sign Up / Login forms exactly:
 * fullName, email, password, confirmPassword, astronautId — nothing invented.
 */
const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email("Enter a valid email address");

const fullNameSchema = z.string().trim().min(2, "Full name is required").max(80);

const astronautIdSchema = z
  .string()
  .trim()
  .min(3, "Astronaut ID must be at least 3 characters")
  .max(32, "Astronaut ID must be at most 32 characters")
  .regex(/^[A-Za-z0-9_-]+$/, "Astronaut ID may contain only letters, numbers, '-' and '_'");

const passwordSchema = z.string().min(1).superRefine((pw, ctx) => {
  for (const msg of passwordIssues(pw)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
  }
});

export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm Password is required"),
    astronautId: astronautIdSchema,
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });

export const loginSchema = z.object({
  // The Login page collects Astronaut ID + Password (see src/routes/index.tsx).
  // The same field also accepts the registered email as an alias, so validation
  // permits either an Astronaut ID token or a syntactically valid email.
  astronautId: z
    .string()
    .trim()
    .min(3, "Astronaut ID is required")
    .max(254)
    .refine(
      (v) => /^[A-Za-z0-9_-]{3,32}$/.test(v) || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v),
      "Enter your Astronaut ID or email",
    ),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({ refreshToken: z.string().min(16) });
export const logoutSchema = z.object({ refreshToken: z.string().min(16) }).partial();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** zod issues → { field: firstMessage } map for a stable API error format. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
