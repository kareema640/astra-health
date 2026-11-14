import bcrypt from "bcryptjs";
import { env } from "./env";

/**
 * Passwords are stored only as bcrypt hashes (cost 12 by default; 10 under test
 * to keep the suite fast). The plaintext never touches the database or logs.
 */
const ROUNDS = env.NODE_ENV === "test" ? 10 : env.BCRYPT_ROUNDS;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Server-side password policy (the workbook has no password rules, so the
 * conventional minimums apply and are documented in the report):
 * 8–72 characters, at least one letter and one digit.
 */
export function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 8) issues.push("Password must be at least 8 characters");
  else if (pw.length > 72) issues.push("Password must be at most 72 characters");
  if (!/[a-zA-Z]/.test(pw)) issues.push("Password must contain a letter");
  if (!/[0-9]/.test(pw)) issues.push("Password must contain a number");
  return issues;
}
