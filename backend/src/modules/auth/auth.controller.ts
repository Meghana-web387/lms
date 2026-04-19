import type { Request, Response, NextFunction } from "express";
import { registerBody, loginBody } from "./auth.validator.js";
import * as authService from "./auth.service.js";
import { REFRESH_COOKIE_NAME } from "../../config/security.js";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerBody.parse(req.body);
    const result = await authService.registerUser(body.email, body.password, body.name, res);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginBody.parse(req.body);
    const result = await authService.loginUser(body.email, body.password, res);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    const result = await authService.refreshAccessToken(raw, res);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await authService.logoutUser(raw, res);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
