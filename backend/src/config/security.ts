import type { CookieOptions } from "express";
import { env } from "./env.js";

export const REFRESH_COOKIE_NAME = "refresh_token";

export function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
    maxAge: env.refreshTokenExpiresDays * 24 * 60 * 60 * 1000,
    domain: env.cookieDomain,
  };
}

export function clearRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
    maxAge: 0,
    domain: env.cookieDomain,
  };
}
