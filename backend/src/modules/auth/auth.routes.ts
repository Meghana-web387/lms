import { Router } from "express";
import * as ctrl from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", ctrl.register);
authRouter.post("/login", ctrl.login);
authRouter.post("/refresh", ctrl.refresh);
authRouter.post("/logout", ctrl.logout);
