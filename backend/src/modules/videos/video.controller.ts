import type { Request, Response, NextFunction } from "express";
import * as videoService from "./video.service.js";
import { AppError } from "../../middleware/errorHandler.js";
import { parseBigIntParam } from "../../utils/id.js";

export async function getVideo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new AppError(401, "Unauthorized");
    const videoId = parseBigIntParam(req.params.videoId, "videoId");
    const detail = await videoService.getVideoDetail(videoId, user.id);
    res.json(detail);
  } catch (e) {
    next(e);
  }
}
