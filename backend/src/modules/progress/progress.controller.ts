import type { Request, Response, NextFunction } from "express";
import * as progressService from "./progress.service.js";
import { upsertProgressBody } from "./progress.validator.js";
import { AppError } from "../../middleware/errorHandler.js";
import { parseBigIntParam } from "../../utils/id.js";

export async function getSubjectProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new AppError(401, "Unauthorized");
    const subjectId = parseBigIntParam(req.params.subjectId, "subjectId");
    const data = await progressService.getSubjectProgress(subjectId, user.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function getVideoProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new AppError(401, "Unauthorized");
    const videoId = parseBigIntParam(req.params.videoId, "videoId");
    const data = await progressService.getVideoProgress(videoId, user.id);
    res.json(data);
  } catch (e) {
    next(e);
  }
}

export async function postVideoProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new AppError(401, "Unauthorized");
    const videoId = parseBigIntParam(req.params.videoId, "videoId");
    const body = upsertProgressBody.parse(req.body);
    const data = await progressService.upsertVideoProgress(
      videoId,
      user.id,
      body.last_position_seconds,
      body.is_completed
    );
    res.json(data);
  } catch (e) {
    next(e);
  }
}
