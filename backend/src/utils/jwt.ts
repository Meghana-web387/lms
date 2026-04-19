import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";

export type AccessPayload = { sub: string; email: string; name: string; typ: "access" };

export function signAccessToken(userId: bigint, email: string, name: string): string {
  const payload: AccessPayload = {
    sub: String(userId),
    email,
    name,
    typ: "access",
  };
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: `${env.accessTokenExpiresMin}m`,
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
  if (decoded.typ !== "access") throw new Error("Invalid token type");
  return decoded;
}

export function signRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
