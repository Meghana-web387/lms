import { Router } from "express";
import * as ctrl from "./video.controller.js";
import { requireAuth } from "../../middleware/authMiddleware.js";

export const videoRouter = Router();

videoRouter.get("/:videoId", requireAuth, ctrl.getVideo);
