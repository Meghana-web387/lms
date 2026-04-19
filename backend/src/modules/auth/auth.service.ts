import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { clearRefreshCookieOptions, refreshCookieOptions } from "../../config/security.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { hashToken, signAccessToken, signRefreshToken } from "../../utils/jwt.js";
import { AppError } from "../../middleware/errorHandler.js";
import type { Response } from "express";
import { REFRESH_COOKIE_NAME } from "../../config/security.js";

function refreshExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + env.refreshTokenExpiresDays);
  return d;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  res: Response
): Promise<{ accessToken: string; user: { id: string; email: string; name: string } }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "Email already registered");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true },
  });

  const rawRefresh = signRefreshToken();
  const tokenHash = hashToken(rawRefresh);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: refreshExpiry(),
    },
  });

  const accessToken = signAccessToken(user.id, user.email, user.name);
  res.cookie(REFRESH_COOKIE_NAME, rawRefresh, refreshCookieOptions());

  return {
    accessToken,
    user: { id: String(user.id), email: user.email, name: user.name },
  };
}

export async function loginUser(
  email: string,
  password: string,
  res: Response
): Promise<{ accessToken: string; user: { id: string; email: string; name: string } }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError(401, "Invalid credentials");

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AppError(401, "Invalid credentials");

  const rawRefresh = signRefreshToken();
  const tokenHash = hashToken(rawRefresh);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: refreshExpiry(),
    },
  });

  const accessToken = signAccessToken(user.id, user.email, user.name);
  res.cookie(REFRESH_COOKIE_NAME, rawRefresh, refreshCookieOptions());

  return {
    accessToken,
    user: { id: String(user.id), email: user.email, name: user.name },
  };
}

export async function refreshAccessToken(
  rawRefresh: string | undefined,
  res: Response
): Promise<{ accessToken: string }> {
  if (!rawRefresh) throw new AppError(401, "Missing refresh token");

  const tokenHash = hashToken(rawRefresh);
  const row = await prisma.refreshToken.findFirst({
    where: { tokenHash, revokedAt: null },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!row || row.expiresAt < new Date()) {
    throw new AppError(401, "Invalid refresh token");
  }

  const accessToken = signAccessToken(row.user.id, row.user.email, row.user.name);
  return { accessToken };
}

export async function logoutUser(
  rawRefresh: string | undefined,
  res: Response
): Promise<void> {
  if (rawRefresh) {
    const tokenHash = hashToken(rawRefresh);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  res.clearCookie(REFRESH_COOKIE_NAME, clearRefreshCookieOptions());
}
