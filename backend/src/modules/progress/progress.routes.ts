import { Router } from "express";
import * as ctrl from "./progress.controller.js";
import { requireAuth } from "../../middleware/authMiddleware.js";

export const progressRouter = Router();

progressRouter.get("/subjects/:subjectId", requireAuth, ctrl.getSubjectProgress);
progressRouter.get("/videos/:videoId", requireAuth, ctrl.getVideoProgress);
progressRouter.post("/videos/:videoId", requireAuth, ctrl.postVideoProgress);
