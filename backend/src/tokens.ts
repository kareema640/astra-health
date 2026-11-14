import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "./env";

export interface AccessClaims {
  sub: string; // user id
  aid: string; // astronaut id
}

export function signAccessToken(claims: AccessClaims): string {
  return jwt.sign({ ...claims }, env.JWT_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as jwt.SignOptions["expiresIn"],
    issuer: "astra-health-api",
  });
}

export function verifyAccessToken(token: string): AccessClaims | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { issuer: "astra-health-api" });
    if (typeof payload === "string") return null;
    const { sub, aid } = payload as jwt.JwtPayload & { sub?: string; aid?: string };
    if (typeof sub !== "string" || typeof aid !== "string") return null;
    return { sub, aid };
  } catch {
    return null;
  }
}

/** Opaque refresh token: 32 random bytes, url-safe base64. Only its hash is stored. */
export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHmac("sha256", env.JWT_SECRET).update(token).digest("hex");
}

export function refreshExpiresAt(): Date {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function tokensEqual(a: string, b: string): boolean {
  const ha = Buffer.from(a);
  const hb = Buffer.from(b);
  return ha.length === hb.length && timingSafeEqual(ha, hb);
}
