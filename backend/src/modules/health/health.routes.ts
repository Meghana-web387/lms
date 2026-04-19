import { Router } from "express";
import * as ctrl from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/", ctrl.health);
