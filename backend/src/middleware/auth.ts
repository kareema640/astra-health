import type { NextFunction, Request, Response } from "express";
import { queryOne } from "../db";
import { verifyAccessToken } from "../tokens";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  astronautId: string;
  role: string;
}

export function bearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (h && h.startsWith("Bearer ")) return h.slice(7);
  return null;
}

/**
 * Require a valid access token. Loads the user row (so disabled accounts fail)
 * and resolves their bound astronaut record in one place — every health route
 * then relies on req.user.astronautId for row isolation.
 */
export function requireAuth(allowRoles?: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = bearer(req);
    if (!token) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } });
      return;
    }
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      res.status(401).json({ error: { code: "TOKEN_INVALID", message: "Sign in required" } });
      return;
    }
    if (!payload) {
      res.status(401).json({ error: { code: "TOKEN_INVALID", message: "Sign in required" } });
      return;
    }
    const user = await queryOne<AuthUser & { status: string }>(
      `SELECT u.id, u.email, u.full_name AS "fullName", u.astronaut_id AS "astronautId",
              u.role, u.status
       FROM users u WHERE u.id = $1`,
      [payload.sub],
    );
    if (!user || user.status !== "active") {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } });
      return;
    }
    if (allowRoles && !allowRoles.includes(user.role)) {
      res.status(403).json({
        error: { code: "FORBIDDEN", message: "This account role cannot access that resource" },
      });
      return;
    }
    const { status: _status, ...safe } = user;
    req.user = safe;
    next();
  };
}

/** Ensure the signed-in user has an astronauts record (created on demand). */
export async function resolveAstronaut(user: AuthUser): Promise<string> {
  const row = await queryOne<{ id: string }>(
    "SELECT id FROM astronauts WHERE user_id = $1",
    [user.id],
  );
  if (row) return row.id;
  const created = await queryOne<{ id: string }>(
    `INSERT INTO astronauts (designator, display_name, user_id, kind, join_date_display)
     VALUES ($1, $2, $3, 'real', $4)
     ON CONFLICT (designator) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING id`,
    [user.astronautId, user.fullName, user.id, null],
  );
  return (created as { id: string }).id;
}

declare module "express-serve-static-core" {
  interface Request {
    user: AuthUser;
  }
}
