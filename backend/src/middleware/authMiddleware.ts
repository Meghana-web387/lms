import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError(401, "Unauthorized");
    }
    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);
    const userId = BigInt(payload.sub);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw new AppError(401, "Unauthorized");
    req.user = user;
    next();
  } catch (e) {
    if (e instanceof AppError) {
      next(e);
      return;
    }
    next(new AppError(401, "Unauthorized"));
  }
}
