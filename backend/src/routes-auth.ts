import { Router } from "express";
import type { Request, Response } from "express";
import { query, queryOne } from "./db";
import { hashPassword, verifyPassword } from "./passwords";
import {
  generateRefreshToken,
  hashRefreshToken,
  refreshExpiresAt,
  signAccessToken,
  verifyAccessToken,
} from "./tokens";
import { fieldErrors, loginSchema, logoutSchema, refreshSchema, registerSchema } from "./validation";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  astronaut_id: string;
  created_at: string;
}

function publicUser(u: UserRow) {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    astronautId: u.astronaut_id,
    createdAt: u.created_at,
  };
}

function bearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (h && h.startsWith("Bearer ")) return h.slice(7);
  return null;
}

async function createSession(userId: string): Promise<string> {
  const token = generateRefreshToken();
  await query(
    `INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, hashRefreshToken(token), refreshExpiresAt()],
  );
  return token;
}

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "VALIDATION", message: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) },
    });
  }
  const { fullName, email, password, astronautId } = parsed.data;

  try {
    // Atomic insert; unique indexes enforce case-insensitive email + astronaut id.
    const rows = await query<UserRow>(
      `INSERT INTO users (email, password_hash, full_name, astronaut_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, password_hash, full_name, astronaut_id, created_at`,
      [email.toLowerCase(), await hashPassword(password), fullName, astronautId.toUpperCase()],
    );
    const user = rows[0];
    const refreshToken = await createSession(user.id);
    return res.status(201).json({
      user: publicUser(user),
      accessToken: signAccessToken({ sub: user.id, aid: user.astronaut_id }),
      refreshToken,
    });
  } catch (e: unknown) {
    const pg = e as { code?: string; constraint?: string };
    if (pg.code === "23505") {
      const emailTaken = pg.constraint === "users_email_lower_key";
      const conflictMessage = emailTaken
        ? "An account with this email already exists"
        : "This Astronaut ID is already registered";
      return res.status(409).json({
        error: {
          code: emailTaken ? "EMAIL_EXISTS" : "ASTRONAUT_ID_EXISTS",
          message: conflictMessage,
          fields: { [emailTaken ? "email" : "astronautId"]: conflictMessage },
        },
      });
    }
    throw e;
  }
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: { code: "VALIDATION", message: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) },
    });
  }
  const { astronautId, password } = parsed.data;

  // Login is by Astronaut ID (what the form collects). Email is accepted too as an
  // alias, since both are unique identifiers the user registered with.
  const user = await queryOne<UserRow>(
    `SELECT id, email, password_hash, full_name, astronaut_id, created_at
     FROM users
     WHERE astronaut_id = $1 OR lower(email) = $2`,
    [astronautId.toUpperCase(), astronautId.toLowerCase()],
  );
  if (!user) {
    // Same message either way — never leak which identifiers exist.
    return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid Astronaut ID or password" } });
  }
  if (!(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid Astronaut ID or password" } });
  }
  const refreshToken = await createSession(user.id);
  return res.json({
    user: publicUser(user),
    accessToken: signAccessToken({ sub: user.id, aid: user.astronaut_id }),
    refreshToken,
  });
});

authRouter.post("/refresh", async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(401).json({ error: { code: "INVALID_REFRESH", message: "Not signed in" } });
  }
  const incoming = hashRefreshToken(parsed.data.refreshToken);
  const session = await queryOne<{ id: string; user_id: string; expires_at: string; revoked_at: string | null; replaced_by_hash: string | null }>(
    `SELECT id, user_id, expires_at, revoked_at, replaced_by_hash
     FROM sessions WHERE refresh_token_hash = $1`,
    [incoming],
  );
  if (!session || session.revoked_at || new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ error: { code: "INVALID_REFRESH", message: "Not signed in" } });
  }
  const user = await queryOne<UserRow>(
    `SELECT id, email, password_hash, full_name, astronaut_id, created_at FROM users WHERE id = $1`,
    [session.user_id],
  );
  if (!user) return res.status(401).json({ error: { code: "INVALID_REFRESH", message: "Not signed in" } });

  // Rotation: mark used, issue a replacement. A stolen old token cannot be reused.
  const newToken = generateRefreshToken();
  await query(
    `UPDATE sessions SET revoked_at = now(), replaced_by_hash = $2 WHERE id = $1`,
    [session.id, hashRefreshToken(newToken)],
  );
  await query(
    `INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3)`,
    [user.id, hashRefreshToken(newToken), refreshExpiresAt()],
  );
  return res.json({
    accessToken: signAccessToken({ sub: user.id, aid: user.astronaut_id }),
    refreshToken: newToken,
  });
});

authRouter.post("/logout", async (req: Request, res: Response) => {
  const parsed = logoutSchema.safeParse(req.body ?? {});
  if (!parsed.success || !parsed.data.refreshToken) return res.status(204).end();
  await query(`UPDATE sessions SET revoked_at = now() WHERE refresh_token_hash = $1`, [
    hashRefreshToken(parsed.data.refreshToken),
  ]);
  return res.status(204).end();
});

authRouter.get("/me", async (req: Request, res: Response) => {
  const token = bearer(req);
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } });
  const user = await queryOne<UserRow>(
    `SELECT id, email, password_hash, full_name, astronaut_id, created_at FROM users WHERE id = $1`,
    [claims.sub],
  );
  if (!user) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Sign in required" } });
  return res.json({ user: publicUser(user) });
});
