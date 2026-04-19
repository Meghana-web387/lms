import { Router } from "express";
import * as ctrl from "./subject.controller.js";
import { requireAuth } from "../../middleware/authMiddleware.js";

export const subjectRouter = Router();

subjectRouter.get("/", ctrl.listSubjects);
subjectRouter.get("/:subjectId/tree", requireAuth, ctrl.getSubjectTree);
subjectRouter.get("/:subjectId/first-video", requireAuth, ctrl.getFirstVideo);
subjectRouter.get("/:subjectId", ctrl.getSubject);
